<?php

namespace App\Jobs;

use App\Models\InvoiceLoaderJob;
use App\Services\InvoiceLoaderService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

/**
 * Polls the cargador-facturas microservice for one job until it reaches a
 * terminal state, then archives its result on our own disk — the
 * microservice's own job registry is in-memory, so this is what lets the
 * "Histórico" page keep working after uvicorn restarts or the browser tab
 * that created the job is long gone.
 *
 * Re-dispatches itself as a NEW job instance (never `$this->release()`):
 * `composer run dev` runs `queue:listen --tries=1`, and a released job keeps
 * incrementing the same attempt counter, which `--tries=1` would immediately
 * treat as exhausted. A fresh dispatch starts its own attempt count.
 */
class ArchiveInvoiceLoaderJobStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const MAX_ATTEMPTS = 500;

    public function __construct(public int $invoiceLoaderJobId) {}

    public function handle(InvoiceLoaderService $service): void
    {
        $record = InvoiceLoaderJob::find($this->invoiceLoaderJobId);

        if ($record === null || $record->archived_at !== null) {
            return;
        }

        $status = $record->kind === 'proposal'
            ? $service->proposalStatus($record->job_id)
            : $service->executionStatus($record->job_id);

        if ($status === null) {
            $this->reschedule($record);

            return;
        }

        $record->update(['status' => $status['status']]);

        if (in_array($status['status'], ['PENDING', 'RUNNING'], true)) {
            $this->reschedule($record);

            return;
        }

        if ($status['status'] === 'ERROR') {
            return;
        }

        $this->archive($record, $service);
    }

    private function archive(InvoiceLoaderJob $record, InvoiceLoaderService $service): void
    {
        $prefix = "invoice-loader/{$record->id}";

        if ($record->kind === 'proposal') {
            $file = $service->proposalFile($record->job_id);

            if ($file === null) {
                $this->reschedule($record);

                return;
            }

            $path = "{$prefix}/propuesta_carga.xlsx";
            Storage::disk('local')->put($path, $file->body());
            $record->update(['file_path' => $path, 'archived_at' => now()]);

            return;
        }

        $report = $service->executionReport($record->job_id);
        $log = $service->executionLog($record->job_id);

        if ($report === null && $log === null) {
            $this->reschedule($record);

            return;
        }

        $attributes = ['archived_at' => now()];

        if ($report !== null) {
            $attributes['report_path'] = "{$prefix}/reporte_ejecucion.xlsx";
            Storage::disk('local')->put($attributes['report_path'], $report->body());
        }

        if ($log !== null) {
            $attributes['log_path'] = "{$prefix}/carga.jsonl";
            Storage::disk('local')->put($attributes['log_path'], $log->body());
        }

        $record->update($attributes);
    }

    private function reschedule(InvoiceLoaderJob $record): void
    {
        $attempts = $record->polling_attempts + 1;
        $record->update(['polling_attempts' => $attempts]);

        if ($attempts >= self::MAX_ATTEMPTS) {
            return;
        }

        self::dispatch($record->id)->delay(now()->addSeconds(self::nextDelaySeconds($attempts)));
    }

    private static function nextDelaySeconds(int $attempt): int
    {
        return match (true) {
            $attempt <= 4 => 15,
            $attempt <= 10 => 60,
            default => 300,
        };
    }
}
