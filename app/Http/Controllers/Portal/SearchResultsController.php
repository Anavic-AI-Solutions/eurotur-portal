<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\SearchResultResource;
use App\Http\Resources\Portal\SearchStaticEntryResource;
use App\Models\SearchStaticEntry;
use App\Models\SectorItem;
use App\Services\SearchSynonymExpander;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SearchResultsController extends Controller
{
    public function __invoke(Request $request, SearchSynonymExpander $expander): Response
    {
        $query = trim((string) $request->query('q', ''));

        $results = [];

        if (mb_strlen($query) >= 2) {
            $terms = $expander->expand($query);

            $items = SectorItem::query()
                ->where(fn (Builder $builder) => $this->matchSectorItems($builder, $terms))
                ->with('group')
                ->orderBy('label')
                ->limit(50)
                ->get();

            $staticEntries = SearchStaticEntry::query()
                ->where(fn (Builder $builder) => $this->matchStaticEntries($builder, $terms))
                ->orderBy('title')
                ->limit(50)
                ->get();

            $results = [
                ...SearchResultResource::collection($items)->resolve(),
                ...SearchStaticEntryResource::collection($staticEntries)->resolve(),
            ];

            usort($results, fn (array $a, array $b) => $a['label'] <=> $b['label']);
            $results = array_slice($results, 0, 50);
        }

        return Inertia::render('portal/search-results', [
            'query' => $query,
            'results' => $results,
        ]);
    }

    /**
     * @param  Builder<SectorItem>  $builder
     * @param  array<int, string>  $terms
     */
    private function matchSectorItems(Builder $builder, array $terms): void
    {
        $isPostgres = DB::connection()->getDriverName() === 'pgsql';

        foreach ($terms as $term) {
            $needles = [$term.'%', '% '.$term.'%'];
            $bindings = [...$needles, ...$needles];

            $builder->orWhere(function (Builder $inner) use ($bindings, $isPostgres): void {
                if ($isPostgres) {
                    $inner->whereRaw(
                        "unaccent(lower(label)) like unaccent(lower(?)) or unaccent(lower(label)) like unaccent(lower(?)) or unaccent(lower(coalesce(keywords, ''))) like unaccent(lower(?)) or unaccent(lower(coalesce(keywords, ''))) like unaccent(lower(?))",
                        $bindings,
                    );

                    return;
                }

                $inner->whereRaw(
                    "lower(label) like lower(?) or lower(label) like lower(?) or lower(coalesce(keywords, '')) like lower(?) or lower(coalesce(keywords, '')) like lower(?)",
                    $bindings,
                );
            });
        }
    }

    /**
     * @param  Builder<SearchStaticEntry>  $builder
     * @param  array<int, string>  $terms
     */
    private function matchStaticEntries(Builder $builder, array $terms): void
    {
        $isPostgres = DB::connection()->getDriverName() === 'pgsql';

        foreach ($terms as $term) {
            $needles = [$term.'%', '% '.$term.'%'];
            $bindings = [...$needles, ...$needles];

            $builder->orWhere(function (Builder $inner) use ($bindings, $isPostgres): void {
                if ($isPostgres) {
                    $inner->whereRaw(
                        "unaccent(lower(title)) like unaccent(lower(?)) or unaccent(lower(title)) like unaccent(lower(?)) or unaccent(lower(coalesce(keywords, ''))) like unaccent(lower(?)) or unaccent(lower(coalesce(keywords, ''))) like unaccent(lower(?))",
                        $bindings,
                    );

                    return;
                }

                $inner->whereRaw(
                    "lower(title) like lower(?) or lower(title) like lower(?) or lower(coalesce(keywords, '')) like lower(?) or lower(coalesce(keywords, '')) like lower(?)",
                    $bindings,
                );
            });
        }
    }
}
