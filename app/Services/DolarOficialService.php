<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DolarOficialService
{
    private const CACHE_KEY = 'dolar-oficial-rates';

    private const CACHE_TTL_MINUTES = 15;

    /**
     * Fetch the official USD sell price from dolarapi.com, cached to avoid
     * hitting the third-party API on every request.
     */
    public function ventaOficial(): ?float
    {
        return $this->rates()['venta'] ?? null;
    }

    /**
     * Fetch the official USD buy/sell pair from dolarapi.com, cached to avoid
     * hitting the third-party API on every request.
     *
     * @return array{compra: float, venta: float}|null
     */
    public function rates(): ?array
    {
        if (Cache::has(self::CACHE_KEY)) {
            return Cache::get(self::CACHE_KEY);
        }

        $rates = $this->fetchRates();

        // Only cache successful responses so a temporary outage doesn't
        // suppress the real value for the full TTL once the API recovers.
        if ($rates !== null) {
            Cache::put(self::CACHE_KEY, $rates, now()->addMinutes(self::CACHE_TTL_MINUTES));
        }

        return $rates;
    }

    /**
     * Runs on every request via HandleInertiaRequests::share(), so any
     * network failure (timeout, DNS, refused connection) must be swallowed
     * here instead of bubbling up and breaking every page in the app.
     *
     * @return array{compra: float, venta: float}|null
     */
    private function fetchRates(): ?array
    {
        try {
            $response = Http::timeout(5)->get('https://dolarapi.com/v1/dolares/oficial');
        } catch (ConnectionException) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $compra = $response->json('compra');
        $venta = $response->json('venta');

        if (! is_numeric($compra) || ! is_numeric($venta)) {
            return null;
        }

        return ['compra' => (float) $compra, 'venta' => (float) $venta];
    }
}
