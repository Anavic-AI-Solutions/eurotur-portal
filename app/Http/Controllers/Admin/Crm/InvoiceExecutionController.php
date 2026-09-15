<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Exceptions\InvoiceLoaderValidationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Crm\StoreInvoiceExecutionRequest;
use App\Jobs\ArchiveInvoiceLoaderJobStatus;
use App\Models\InvoiceLoaderJob;
use App\Services\InvoiceLoaderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceExecutionController extends Controller
{
    public function store(StoreInvoiceExecutionRequest $request, InvoiceLoaderService $service): RedirectResponse
    {
        try {
            $job = $service->createExecution($request->file('file'), $request->dryRun());
        } catch (InvoiceLoaderValidationException $e) {
            throw ValidationException::withMessages(['file' => [$e->getMessage()]]);
        }

        if ($job === null) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se pudo conectar con el cargador de facturas. Reintentá en unos minutos.',
            ]);

            return back();
        }

        $record = InvoiceLoaderJob::create([
            'user_id' => $request->user()->id,
            'job_id' => $job['job_id'],
            'kind' => 'execution',
            'original_filename' => $request->file('file')->getClientOriginalName(),
            'dry_run' => $request->dryRun(),
        ]);

        ArchiveInvoiceLoaderJobStatus::dispatch($record->id)->delay(now()->addSeconds(10));

        return to_route('admin.crm.invoice-loader.executions.show', [
            'jobId' => $job['job_id'],
            'dry_run' => $request->dryRun() ? 1 : 0,
        ]);
    }

    public function show(Request $request, string $jobId, InvoiceLoaderService $service): Response|RedirectResponse
    {
        $status = $service->executionStatus($jobId);

        if ($status === null) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Esa ejecución ya no existe — puede que el cargador de facturas se haya reiniciado. Volvé a subir el archivo.',
            ]);

            return to_route('admin.crm.invoice-loader.index');
        }

        $record = InvoiceLoaderJob::query()
            ->where('job_id', $jobId)
            ->where('user_id', $request->user()->id)
            ->first();

        return Inertia::render('admin/crm/invoice-loader/execution', [
            'jobId' => $jobId,
            'status' => $status,
            'dryRun' => $request->boolean('dry_run', true),
            'createdAt' => $record?->created_at?->toIso8601String(),
        ]);
    }

    public function report(string $jobId, InvoiceLoaderService $service): HttpResponse|RedirectResponse
    {
        $file = $service->executionReport($jobId);

        if ($file === null) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se pudo descargar el reporte todavía. Esperá a que termine de procesarse.',
            ]);

            return to_route('admin.crm.invoice-loader.executions.show', ['jobId' => $jobId]);
        }

        return response($file->body(), 200, [
            'Content-Type' => $file->header('Content-Type') ?: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => $file->header('Content-Disposition') ?: 'attachment; filename="reporte_ejecucion.xlsx"',
        ]);
    }

    public function log(string $jobId, InvoiceLoaderService $service): HttpResponse|RedirectResponse
    {
        $file = $service->executionLog($jobId);

        if ($file === null) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se pudo descargar el log todavía. Esperá a que termine de procesarse.',
            ]);

            return to_route('admin.crm.invoice-loader.executions.show', ['jobId' => $jobId]);
        }

        return response($file->body(), 200, [
            'Content-Type' => $file->header('Content-Type') ?: 'application/jsonl',
            'Content-Disposition' => $file->header('Content-Disposition') ?: 'attachment; filename="carga.jsonl"',
        ]);
    }
}
