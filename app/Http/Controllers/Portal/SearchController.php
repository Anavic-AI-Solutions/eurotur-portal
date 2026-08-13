<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\SearchResultResource;
use App\Http\Resources\Portal\SearchStaticEntryResource;
use App\Models\SearchStaticEntry;
use App\Models\SectorItem;
use App\Services\SearchSynonymExpander;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Search sector links/documents and static portal pages by title or
     * keywords, across all sectors. The query is first expanded against the
     * synonym thesaurus (e.g. "factura" also tries "comprobante", "invoice")
     * before matching.
     *
     * Matches are anchored to the start of a word (either the start of the
     * whole string or right after a space) rather than a free substring, so
     * short terms like "iva" don't also match the middle of unrelated words
     * like "comparativa" or "operativa" — while still matching "conductor"
     * against "conductores", since that's a prefix of the word.
     *
     * Case- and accent-insensitive (e.g. "recepcion" finds "recepción") on
     * PostgreSQL via the `unaccent` extension; falls back to a case-insensitive
     * match only where that extension isn't available (e.g. SQLite in tests).
     */
    public function __invoke(Request $request, SearchSynonymExpander $expander): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $terms = $expander->expand($query);

        $items = SectorItem::query()
            ->where(fn (Builder $builder) => $this->matchSectorItems($builder, $terms))
            ->with('group')
            ->orderBy('label')
            ->limit(20)
            ->get();

        $staticEntries = SearchStaticEntry::query()
            ->where(fn (Builder $builder) => $this->matchStaticEntries($builder, $terms))
            ->orderBy('title')
            ->limit(20)
            ->get();

        $results = [
            ...SearchResultResource::collection($items)->resolve(),
            ...SearchStaticEntryResource::collection($staticEntries)->resolve(),
        ];

        usort($results, fn (array $a, array $b) => $a['label'] <=> $b['label']);

        return response()->json(array_slice($results, 0, 20));
    }

    /**
     * @param  Builder<SectorItem>  $builder
     * @param  array<int, string>  $terms
     */
    private function matchSectorItems(Builder $builder, array $terms): void
    {
        $isPostgres = DB::connection()->getDriverName() === 'pgsql';

        foreach ($terms as $term) {
            // Anchor to a word start: either the beginning of the string or
            // right after a space (keywords are stored as ", "-separated
            // phrases, so this also covers "after a comma").
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
