<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use App\Jobs\ArchiveInvoiceLoaderJobStatus;
use App\Models\InvoiceLoaderJob;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class InvoiceLoaderHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $jobs = InvoiceLoaderJob::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20)
            ->through(fn (InvoiceLoaderJob $job): array => [
                'id' => $job->id,
                'job_id' => $job->job_id,
                'kind' => $job->kind,
                'original_filename' => $job->original_filename,
                'dry_run' => $job->dry_run,
                'status' => $job->status,
                'archived' => $job->archived_at !== null,
                'created_at' => $job->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/crm/invoice-loader/history', [
            'jobs' => $jobs,
        ]);
    }

    public function file(Request $request, InvoiceLoaderJob $invoiceLoaderJob): SymfonyResponse
    {
        $this->authorizeOwner($request, $invoiceLoaderJob);

        abort_unless($invoiceLoaderJob->file_path !== null, 404);

        return Storage::disk('local')->download($invoiceLoaderJob->file_path, 'propuesta_carga.xlsx');
    }

    public function report(Request $request, InvoiceLoaderJob $invoiceLoaderJob): SymfonyResponse
    {
        $this->authorizeOwner($request, $invoiceLoaderJob);

        abort_unless($invoiceLoaderJob->report_path !== null, 404);

        return Storage::disk('local')->download($invoiceLoaderJob->report_path, 'reporte_ejecucion.xlsx');
    }

    public function log(Request $request, InvoiceLoaderJob $invoiceLoaderJob): SymfonyResponse
    {
        $this->authorizeOwner($request, $invoiceLoaderJob);

        abort_unless($invoiceLoaderJob->log_path !== null, 404);

        return Storage::disk('local')->download($invoiceLoaderJob->log_path, 'carga.jsonl');
    }

    public function recheck(Request $request, InvoiceLoaderJob $invoiceLoaderJob): RedirectResponse
    {
        $this->authorizeOwner($request, $invoiceLoaderJob);

        if ($invoiceLoaderJob->archived_at === null) {
            $invoiceLoaderJob->update(['polling_attempts' => 0]);
            ArchiveInvoiceLoaderJobStatus::dispatch($invoiceLoaderJob->id);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Revisando el estado…']);

        return back();
    }

    private function authorizeOwner(Request $request, InvoiceLoaderJob $invoiceLoaderJob): void
    {
        abort_unless($invoiceLoaderJob->user_id === $request->user()->id, 403);
    }
}
