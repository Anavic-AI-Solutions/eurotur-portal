<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\BnaDailyRate;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BnaDailyRateExportController extends Controller
{
    /**
     * Export filtered BNA daily rates as a CSV download.
     */
    public function __invoke(Request $request): StreamedResponse
    {
        $query = BnaDailyRate::query()->orderByDesc('date');

        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        $filename = 'historico-bna-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Fecha', 'Compra', 'Venta', 'Nota'], ';');

            $query->chunk(200, function ($rows) use ($handle) {
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $row->date->format('Y-m-d'),
                        $row->cash_buy,
                        $row->cash_sell,
                        $row->note,
                    ], ';');
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
