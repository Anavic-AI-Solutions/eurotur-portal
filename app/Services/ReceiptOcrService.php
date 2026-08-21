<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class ReceiptOcrService
{
    /**
     * Send a receipt image to the ocr-comprobantes microservice and return
     * the fields it could read. Null on any failure (unreachable, timeout,
     * non-2xx) — the caller falls back to manual entry, this is only ever
     * best-effort autocomplete.
     *
     * @return array<string, mixed>|null
     */
    public function extract(UploadedFile $image): ?array
    {
        try {
            $response = Http::withHeaders(['X-API-Key' => config('services.receipt_ocr.api_key')])
                ->baseUrl(config('services.receipt_ocr.url'))
                ->timeout((int) config('services.receipt_ocr.timeout', 120))
                ->attach('image', $image->getContent(), $image->getClientOriginalName())
                ->post('/extract-receipt');
        } catch (ConnectionException) {
            return null;
        }

        return $response->successful() ? $response->json() : null;
    }
}
