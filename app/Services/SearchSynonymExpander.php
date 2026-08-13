<?php

namespace App\Services;

use App\Models\SearchSynonymTerm;
use Illuminate\Support\Str;

class SearchSynonymExpander
{
    /**
     * Expand a search query into every term that should be tried: the
     * original query plus every term sharing a thesaurus group with it
     * (matched either as the whole phrase or word by word, since some
     * terms are multi-word, e.g. "cuentas a pagar").
     *
     * @return array<int, string>
     */
    public function expand(string $query): array
    {
        $normalizedQuery = $this->normalize($query);
        $candidates = array_unique(array_merge([$normalizedQuery], $this->words($normalizedQuery)));

        $groupNumbers = SearchSynonymTerm::query()
            ->whereIn('term', $candidates)
            ->pluck('group_number')
            ->unique();

        if ($groupNumbers->isEmpty()) {
            return [$query];
        }

        $synonyms = SearchSynonymTerm::query()
            ->whereIn('group_number', $groupNumbers)
            ->pluck('term')
            ->all();

        return array_values(array_unique([$query, ...$synonyms]));
    }

    /**
     * @return array<int, string>
     */
    private function words(string $normalized): array
    {
        return array_values(array_filter(explode(' ', $normalized), fn (string $word) => $word !== ''));
    }

    private function normalize(string $value): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', Str::ascii($value))));
    }
}
