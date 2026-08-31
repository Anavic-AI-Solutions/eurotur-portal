<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\BnaDailyRateResource;
use App\Models\BnaDailyRate;
use App\Services\DolarOficialService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExchangeRateController extends Controller
{
    /**
     * Show the BNA and daily BNA cash-rate history blocks. The IATA rate is
     * already shared on every request via HandleInertiaRequests::share().
     */
    public function __invoke(Request $request, DolarOficialService $official): Response
    {
        $query = BnaDailyRate::query()->orderByDesc('date');

        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        $paginated = $query->paginate(25);

        return Inertia::render('portal/exchange-rate', [
            'bna' => $official->oficial(),
            'history' => $paginated->getCollection()->mapInto(BnaDailyRateResource::class),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
            'filters' => [
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
            ],
        ]);
    }
}
