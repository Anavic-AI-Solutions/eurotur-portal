<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\BnaDailyRateResource;
use App\Models\BnaDailyRate;
use App\Services\DolarOficialService;
use Inertia\Inertia;
use Inertia\Response;

class ExchangeRateController extends Controller
{
    /**
     * Show the BNA and daily BNA cash-rate history blocks. The IATA rate is
     * already shared on every request via HandleInertiaRequests::share().
     */
    public function __invoke(DolarOficialService $official): Response
    {
        $history = BnaDailyRate::query()->orderByDesc('date')->get();

        return Inertia::render('portal/exchange-rate', [
            'bnaSell' => $official->ventaOficial(),
            'history' => BnaDailyRateResource::collection($history),
        ]);
    }
}
