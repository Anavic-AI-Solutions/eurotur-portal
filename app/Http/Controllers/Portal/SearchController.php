<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\SearchResultResource;
use App\Models\SectorItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Search sector links/documents by title or keywords, across all sectors.
     *
     * Matches case- and accent-insensitively (e.g. "recepcion" finds "recepción")
     * on PostgreSQL via the `unaccent` extension; falls back to a case-insensitive
     * match only where that extension isn't available (e.g. SQLite in tests).
     */
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return SearchResultResource::collection([]);
        }

        $needle = '%'.$query.'%';

        $items = SectorItem::query()
            ->when(
                DB::connection()->getDriverName() === 'pgsql',
                fn ($builder) => $builder->whereRaw(
                    "unaccent(lower(label)) like unaccent(lower(?)) or unaccent(lower(coalesce(keywords, ''))) like unaccent(lower(?))",
                    [$needle, $needle],
                ),
                fn ($builder) => $builder->whereRaw(
                    "lower(label) like lower(?) or lower(coalesce(keywords, '')) like lower(?)",
                    [$needle, $needle],
                ),
            )
            ->with('group')
            ->orderBy('label')
            ->limit(20)
            ->get();

        return SearchResultResource::collection($items);
    }
}
