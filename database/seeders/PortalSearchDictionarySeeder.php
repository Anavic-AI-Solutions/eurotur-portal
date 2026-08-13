<?php

namespace Database\Seeders;

use App\Models\SearchStaticEntry;
use App\Models\SearchSynonymTerm;
use App\Models\SectorItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Loads docs/Keywords/portal_diccionario.json (180 entries relevadas del
 * portal + a 111-group thesaurus) into the search index:
 *
 * - Entries whose URL matches an existing SectorItem get their `keywords`
 *   column enriched with the dictionary's keywords + sinonimos.
 * - Entries with no matching SectorItem (the 14 sector home pages, the 2
 *   Innovación instructivos, and a handful of links embedded directly in
 *   home/mesa/qrated pages) become — or merge into — a SearchStaticEntry
 *   keyed by URL, since several dictionary entries share the same sector
 *   page URL (e.g. multiple "frentes de automatización" all point back to
 *   /innovacion) and their keywords should accumulate on that one row.
 * - "Cotización Dólar" (EU-102) is special-cased: the dictionary still has
 *   it pointing at bna.com.ar because it was relevado before that quick
 *   access became internal; its keywords are routed to the /tipo-de-cambio
 *   SectorItem instead of creating a stale static entry.
 * - Every thesaurus group becomes a set of SearchSynonymTerm rows.
 *
 * Idempotent: safe to re-run without duplicating rows or losing previously
 * accumulated keywords.
 */
class PortalSearchDictionarySeeder extends Seeder
{
    private const DICTIONARY_ITEM_TO_INTERNAL_URL = [
        'EU-102' => '/tipo-de-cambio',
    ];

    public function run(): void
    {
        $json = file_get_contents(base_path('docs/Keywords/portal_diccionario.json'));

        if ($json === false) {
            throw new \RuntimeException('No se pudo leer docs/Keywords/portal_diccionario.json');
        }

        $data = json_decode($json, true);

        $sectorRoutes = $this->sectorRoutes($data['sectores']);
        $sectorItemsByUrl = $this->sectorItemsByNormalizedUrl();

        foreach ($data['entradas'] as $entrada) {
            $keywords = array_values(array_unique(array_merge(
                $entrada['keywords'] ?? [],
                $entrada['sinonimos'] ?? [],
            )));

            if ($keywords === []) {
                continue;
            }

            $url = self::DICTIONARY_ITEM_TO_INTERNAL_URL[$entrada['id']] ?? ($entrada['url'] ?? $entrada['ruta'] ?? null);

            if ($url === null) {
                continue;
            }

            $normalizedUrl = $this->normalizeUrl($url);

            if (isset($sectorItemsByUrl[$normalizedUrl])) {
                $item = $sectorItemsByUrl[$normalizedUrl];
                $item->update(['keywords' => $this->mergeKeywords($item->keywords, $keywords)]);

                continue;
            }

            $staticUrl = rtrim($url, '/');
            $sectorName = $entrada['sector'] ?? null;

            $entry = SearchStaticEntry::query()->firstOrNew(['url' => $staticUrl]);

            // Several dictionary entries share a sector page's URL (e.g. every
            // "frente de automatización" points back to /innovacion); only the
            // first one to create the row should name it — later merges just
            // add their keywords without renaming an already-titled page.
            if (! $entry->exists) {
                $entry->title = $entrada['titulo'] ?? $entrada['nombre'] ?? $staticUrl;
                $entry->sector_label = $sectorName;
                $entry->sector_href = $sectorRoutes[$this->normalizeLabel($sectorName ?? '')] ?? null;
            }

            $entry->keywords = $this->mergeKeywords($entry->keywords, $keywords);
            $entry->save();
        }

        foreach ($data['tesauro'] as $grupo) {
            foreach ($grupo['terminos'] as $term) {
                SearchSynonymTerm::query()->updateOrCreate([
                    'group_number' => $grupo['grupo'],
                    'term' => $term,
                ]);
            }
        }
    }

    /**
     * @param  array<int, array{ruta: string, nombre: string}>  $sectores
     * @return array<string, string>
     */
    private function sectorRoutes(array $sectores): array
    {
        $routes = ['home' => '/'];

        foreach ($sectores as $sector) {
            $routes[$this->normalizeLabel($sector['nombre'])] = $sector['ruta'];
        }

        return $routes;
    }

    /**
     * @return array<string, SectorItem>
     */
    private function sectorItemsByNormalizedUrl(): array
    {
        $map = [];

        foreach (SectorItem::query()->whereNotNull('url')->get() as $item) {
            $map[$this->normalizeUrl($item->url)] = $item;
        }

        return $map;
    }

    private function normalizeUrl(string $url): string
    {
        $url = rtrim($url, '/');

        return preg_replace('#drive\.google\.com/drive/u/\d+/folders/#', 'drive.google.com/drive/folders/', $url);
    }

    private function normalizeLabel(string $label): string
    {
        return mb_strtolower(trim(Str::ascii($label)));
    }

    /**
     * @param  array<int, string>  $newKeywords
     */
    private function mergeKeywords(?string $existing, array $newKeywords): string
    {
        $current = $existing !== null && $existing !== ''
            ? array_map('trim', explode(',', $existing))
            : [];

        return implode(', ', array_values(array_unique(array_merge($current, $newKeywords))));
    }
}
