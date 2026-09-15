<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Exceptions\InvoiceLoaderValidationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Crm\StoreInvoiceProposalRequest;
use App\Jobs\ArchiveInvoiceLoaderJobStatus;
use App\Models\InvoiceLoaderJob;
use App\Services\InvoiceLoaderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceProposalController extends Controller
{
    public function store(StoreInvoiceProposalRequest $request, InvoiceLoaderService $service): RedirectResponse
    {
        try {
            $job = $service->createProposal($request->file('file'));
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
            'kind' => 'proposal',
            'original_filename' => $request->file('file')->getClientOriginalName(),
        ]);

        ArchiveInvoiceLoaderJobStatus::dispatch($record->id)->delay(now()->addSeconds(10));

        return to_route('admin.crm.invoice-loader.proposals.show', ['jobId' => $job['job_id']]);
    }

    public function show(Request $request, string $jobId, InvoiceLoaderService $service): Response|RedirectResponse
    {
        $status = $service->proposalStatus($jobId);

        if ($status === null) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Esa propuesta ya no existe — puede que el cargador de facturas se haya reiniciado. Volvé a subir el archivo.',
            ]);

            return to_route('admin.crm.invoice-loader.index');
        }

        $record = InvoiceLoaderJob::query()
            ->where('job_id', $jobId)
            ->where('user_id', $request->user()->id)
            ->first();

        return Inertia::render('admin/crm/invoice-loader/proposal', [
            'jobId' => $jobId,
            'status' => $status,
            'createdAt' => $record?->created_at?->toIso8601String(),
        ]);
    }

    public function download(string $jobId, InvoiceLoaderService $service): HttpResponse|RedirectResponse
    {
        $file = $service->proposalFile($jobId);

        if ($file === null) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se pudo descargar la propuesta todavía. Esperá a que termine de procesarse.',
            ]);

            return to_route('admin.crm.invoice-loader.proposals.show', ['jobId' => $jobId]);
        }

        return response($file->body(), 200, [
            'Content-Type' => $file->header('Content-Type') ?: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => $file->header('Content-Disposition') ?: 'attachment; filename="propuesta_carga.xlsx"',
        ]);
    }
}
