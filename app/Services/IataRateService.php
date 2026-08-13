<?php

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class IataRateService
{
    private const URL = 'https://sudameria.com/';

    private const LABEL = 'dolar aereo';

    private const FRESH_CACHE_KEY = 'iata-rate:fresh';

    private const LAST_GOOD_CACHE_KEY = 'iata-rate:last-good';

    private const FRESH_TTL_MINUTES = 30;

    private const LAST_GOOD_TTL_HOURS = 24;

    /**
     * Sudameria (Cloudflare) rejects requests without a browser-like User-Agent.
     */
    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

    /**
     * Fetch the IATA "Dolar Aereo" rate scraped from sudameria.com's public
     * home page, cached to avoid hitting the third-party site on every visit.
     *
     * @return array{rate: float, updatedAt: ?string, stale: bool}|null
     */
    public function rate(): ?array
    {
        $fresh = Cache::get(self::FRESH_CACHE_KEY);

        if ($fresh !== null) {
            return $fresh;
        }

        $scraped = $this->scrape();

        if ($scraped !== null) {
            Cache::put(self::FRESH_CACHE_KEY, $scraped, now()->addMinutes(self::FRESH_TTL_MINUTES));
            Cache::put(self::LAST_GOOD_CACHE_KEY, $scraped, now()->addHours(self::LAST_GOOD_TTL_HOURS));

            return $scraped;
        }

        /** @var array{rate: float, updatedAt: ?string, stale: bool}|null $lastGood */
        $lastGood = Cache::get(self::LAST_GOOD_CACHE_KEY);

        if ($lastGood !== null) {
            return ['rate' => $lastGood['rate'], 'updatedAt' => $lastGood['updatedAt'], 'stale' => true];
        }

        return null;
    }

    /**
     * Runs only when the exchange-rate page is visited (never from
     * HandleInertiaRequests::share()), so a slow or failing scrape only
     * affects that single request instead of every page in the app.
     *
     * @return array{rate: float, updatedAt: ?string, stale: bool}|null
     */
    private function scrape(): ?array
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
                'Accept' => 'text/html,application/xhtml+xml',
                'Accept-Language' => 'es-AR,es;q=0.9',
            ])->timeout(8)->retry(1, 300, throw: false)->get(self::URL);
        } catch (ConnectionException) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        return $this->parseHtml($response->body());
    }

    /**
     * @return array{rate: float, updatedAt: ?string, stale: bool}|null
     */
    private function parseHtml(string $html): ?array
    {
        libxml_use_internal_errors(true);
        $dom = new DOMDocument;
        $dom->loadHTML('<?xml encoding="UTF-8">'.$html);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);
        $articles = $xpath->query('//article');

        if ($articles === false) {
            return null;
        }

        foreach ($articles as $article) {
            if (! $article instanceof DOMElement) {
                continue;
            }

            $paragraphNodes = $xpath->query('.//p', $article);

            if ($paragraphNodes === false || $paragraphNodes->length === 0) {
                continue;
            }

            $paragraphs = [];
            foreach ($paragraphNodes as $node) {
                if ($node instanceof DOMElement) {
                    $paragraphs[] = $node;
                }
            }

            if ($paragraphs === [] || $this->normalize($paragraphs[0]->textContent ?? '') !== self::LABEL) {
                continue;
            }

            $rate = $this->findRate($paragraphs);

            if ($rate === null) {
                return null;
            }

            return [
                'rate' => $rate,
                'updatedAt' => $this->extractUpdatedAt($article->getAttribute('title')),
                'stale' => false,
            ];
        }

        return null;
    }

    /**
     * @param  array<int, DOMElement>  $paragraphs
     */
    private function findRate(array $paragraphs): ?float
    {
        foreach ($paragraphs as $paragraph) {
            if (preg_match('/\$\s*([\d.]+,\d+)/u', $paragraph->textContent ?? '', $matches) === 1) {
                return (float) str_replace(['.', ','], ['', '.'], $matches[1]);
            }
        }

        return null;
    }

    private function extractUpdatedAt(string $title): ?string
    {
        if (preg_match('/Actualizado:\s*(.+)$/u', trim($title), $matches) !== 1) {
            return null;
        }

        try {
            return Carbon::createFromFormat('d/m/Y H:i:s', trim($matches[1]))->toIso8601String();
        } catch (\Exception) {
            return null;
        }
    }

    private function normalize(string $value): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', Str::ascii($value))));
    }
}
