<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\SearchStaticEntryResource;
use App\Http\Resources\Portal\SectorItemAdminResource;
use App\Models\SearchStaticEntry;
use App\Models\SearchSynonymTerm;
use App\Models\SectorItem;
use Inertia\Inertia;
use Inertia\Response;

class SearchAdminController extends Controller
{
    /**
     * Show the search index administration panel: keywords per sector item,
     * the static entries (sector pages/links with no SectorItem row), and
     * the synonym thesaurus, grouped by group number.
     */
    public function __invoke(): Response
    {
        $items = SectorItem::query()->with('group')->orderBy('label')->get();
        $staticEntries = SearchStaticEntry::query()->orderBy('title')->get();

        $groups = SearchSynonymTerm::query()
            ->orderBy('group_number')
            ->orderBy('term')
            ->get()
            ->groupBy('group_number')
            ->map(fn ($terms, $groupNumber) => [
                'groupNumber' => (int) $groupNumber,
                'terms' => $terms->map(fn (SearchSynonymTerm $term) => [
                    'id' => $term->id,
                    'term' => $term->term,
                ])->values(),
            ])
            ->values();

        return Inertia::render('portal/search-admin', [
            'items' => SectorItemAdminResource::collection($items),
            'staticEntries' => SearchStaticEntryResource::collection($staticEntries),
            'synonymGroups' => $groups,
        ]);
    }
}
