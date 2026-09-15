<?php

namespace App\Services;

use App\Exceptions\InvoiceLoaderValidationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

/**
 * Backend-to-backend proxy for the cargador-facturas microservice (see
 * docs/Consumo_API.md in that repo) — keeps the X-API-Key server-side and
 * translates its job-based flow (create → poll → download) into plain
 * arrays/responses the controllers can act on.
 */
class InvoiceLoaderService
{
    /**
     * @return array{job_id: string}|null null on connection failure or a
     *                                    non-2xx/422 response
     *
     * @throws InvoiceLoaderValidationException on a 422 (invalid columns)
     */
    public function createProposal(UploadedFile $file): ?array
    {
        return $this->createJob('/proposals', $file);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function proposalStatus(string $jobId): ?array
    {
        return $this->status("/proposals/{$jobId}");
    }

    public function proposalFile(string $jobId): ?Response
    {
        return $this->download("/proposals/{$jobId}/file");
    }

    /**
     * @return array{job_id: string}|null
     *
     * @throws InvoiceLoaderValidationException on a 422 (tampered row hash)
     */
    public function createExecution(UploadedFile $file, bool $dryRun): ?array
    {
        return $this->createJob('/executions?dry_run='.($dryRun ? 'true' : 'false'), $file);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function executionStatus(string $jobId): ?array
    {
        return $this->status("/executions/{$jobId}");
    }

    public function executionReport(string $jobId): ?Response
    {
        return $this->download("/executions/{$jobId}/report");
    }

    public function executionLog(string $jobId): ?Response
    {
        return $this->download("/executions/{$jobId}/log");
    }

    /**
     * @return array{job_id: string}|null
     */
    private function createJob(string $path, UploadedFile $file): ?array
    {
        try {
            $response = $this->client()
                ->attach('file', $file->getContent(), $file->getClientOriginalName())
                ->post($path);
        } catch (ConnectionException) {
            return null;
        }

        if ($response->status() === 422) {
            throw new InvoiceLoaderValidationException(
                (string) $response->json('detail', 'El archivo fue rechazado por el cargador de facturas.')
            );
        }

        return $response->successful() ? $response->json() : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function status(string $path): ?array
    {
        try {
            $response = $this->client()->get($path);
        } catch (ConnectionException) {
            return null;
        }

        return $response->successful() ? $response->json() : null;
    }

    private function download(string $path): ?Response
    {
        try {
            $response = $this->client()->get($path);
        } catch (ConnectionException) {
            return null;
        }

        return $response->successful() ? $response : null;
    }

    private function client(): PendingRequest
    {
        return Http::withHeaders(['X-API-Key' => config('services.invoice_loader.api_key')])
            ->baseUrl(config('services.invoice_loader.url'))
            ->timeout((int) config('services.invoice_loader.timeout', 120));
    }
}
