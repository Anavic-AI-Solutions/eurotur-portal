<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreSearchStaticEntryRequest;
use App\Http\Requests\Portal\UpdateSearchStaticEntryRequest;
use App\Models\SearchStaticEntry;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class SearchStaticEntryController extends Controller
{
    /**
     * Create a new static search entry (a portal page or link with no
     * SectorItem row of its own, e.g. a sector home page).
     */
    public function store(StoreSearchStaticEntryRequest $request): RedirectResponse
    {
        SearchStaticEntry::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Entrada agregada.')]);

        return back();
    }

    /**
     * Update a static search entry.
     */
    public function update(SearchStaticEntry $entry, UpdateSearchStaticEntryRequest $request): RedirectResponse
    {
        $entry->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Entrada actualizada.')]);

        return back();
    }

    /**
     * Delete a static search entry.
     */
    public function destroy(SearchStaticEntry $entry): RedirectResponse
    {
        $entry->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Entrada eliminada.')]);

        return back();
    }
}
