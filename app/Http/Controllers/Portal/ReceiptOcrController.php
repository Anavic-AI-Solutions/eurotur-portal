<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\ExtractReceiptRequest;
use App\Services\ReceiptOcrService;
use Illuminate\Http\JsonResponse;

class ReceiptOcrController extends Controller
{
    /**
     * Proxy a receipt image to the ocr-comprobantes microservice so the
     * API key never reaches the browser, and return the fields it read for
     * the "Rendición de Gastos" wizard to autocomplete (best-effort only —
     * the person filling the form always reviews/corrects the result).
     */
    public function __invoke(ExtractReceiptRequest $request, ReceiptOcrService $service): JsonResponse
    {
        $result = $service->extract($request->file('image'));

        if ($result === null) {
            return response()->json([
                'message' => 'No se pudo leer el comprobante automáticamente. Completá los datos a mano.',
            ], 502);
        }

        return response()->json($result);
    }
}
