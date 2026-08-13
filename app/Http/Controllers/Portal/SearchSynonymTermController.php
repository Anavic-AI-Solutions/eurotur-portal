<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreSearchSynonymTermRequest;
use App\Models\SearchSynonymTerm;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class SearchSynonymTermController extends Controller
{
    /**
     * Add a term to a thesaurus group (existing or brand new — the frontend
     * decides the group_number in both cases).
     */
    public function store(StoreSearchSynonymTermRequest $request): RedirectResponse
    {
        SearchSynonymTerm::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Término agregado.')]);

        return back();
    }

    /**
     * Remove a term from the thesaurus.
     */
    public function destroy(SearchSynonymTerm $term): RedirectResponse
    {
        $term->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Término eliminado.')]);

        return back();
    }
}
