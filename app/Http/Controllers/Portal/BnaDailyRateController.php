<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreBnaDailyRateRequest;
use App\Http\Requests\Portal\UpdateBnaDailyRateRequest;
use App\Models\BnaDailyRate;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class BnaDailyRateController extends Controller
{
    /**
     * Create a new daily BNA cash-rate entry.
     */
    public function store(StoreBnaDailyRateRequest $request): RedirectResponse
    {
        BnaDailyRate::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Cotización agregada.')]);

        return back();
    }

    /**
     * Update a daily BNA cash-rate entry.
     */
    public function update(BnaDailyRate $rate, UpdateBnaDailyRateRequest $request): RedirectResponse
    {
        $rate->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Cotización actualizada.')]);

        return back();
    }

    /**
     * Delete a daily BNA cash-rate entry.
     */
    public function destroy(BnaDailyRate $rate): RedirectResponse
    {
        $rate->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Cotización eliminada.')]);

        return back();
    }
}
