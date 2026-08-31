<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
    private const CITIES = [
        ['name' => 'Buenos Aires', 'lat' => -34.6037, 'lon' => -58.3816],
        ['name' => 'El Calafate', 'lat' => -50.3402, 'lon' => -72.2647],
        ['name' => 'Ushuaia', 'lat' => -54.8019, 'lon' => -68.3030],
        ['name' => 'Iguazú', 'lat' => -25.5167, 'lon' => -54.5862],
        ['name' => 'Salta', 'lat' => -24.7829, 'lon' => -65.4232],
        ['name' => 'Mendoza', 'lat' => -32.8895, 'lon' => -68.8458],
        ['name' => 'Bariloche', 'lat' => -41.1335, 'lon' => -71.3103],
    ];

    private const WMO_CODES = [
        0 => 'Despejado',
        1 => 'Mayormente despejado',
        2 => 'Parcial nublado',
        3 => 'Nublado',
        45 => 'Neblina',
        48 => 'Neblina con escarcha',
        51 => 'Llovizna ligera',
        53 => 'Llovizna',
        55 => 'Llovizna intensa',
        61 => 'Lluvia ligera',
        63 => 'Lluvia',
        65 => 'Lluvia intensa',
        71 => 'Nieve ligera',
        73 => 'Nieve',
        75 => 'Nieve intensa',
        77 => 'Granizo',
        80 => 'Chubascos ligeros',
        81 => 'Chubascos',
        82 => 'Chubascos intensos',
        85 => 'Chubascos de nieve',
        86 => 'Chubascos de nieve intensos',
        95 => 'Tormenta',
        96 => 'Tormenta con granizo',
        99 => 'Tormenta con granizo intenso',
    ];

    public function __invoke(): JsonResponse
    {
        $lats = array_column(self::CITIES, 'lat');
        $lons = array_column(self::CITIES, 'lon');

        $latStr = implode(',', $lats);
        $lonStr = implode(',', $lons);

        $url = sprintf(
            'https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America/Argentina/Buenos_Aires&forecast_days=1',
            $latStr,
            $lonStr,
        );

        $response = Http::timeout(10)->get($url);

        if (! $response->successful()) {
            return response()->json(['error' => 'Weather service unavailable'], 502);
        }

        $data = $response->json();

        // Open-Meteo returns an array of results when multiple coordinates are passed.
        $results = is_array($data) ? $data : [$data];

        $weather = [];

        foreach ($results as $index => $item) {
            $city = self::CITIES[$index] ?? null;
            if (! $city) {
                continue;
            }

            $current = $item['current'] ?? [];
            $daily = $item['daily'] ?? [];
            $code = $current['weather_code'] ?? 0;

            $weather[] = [
                'city' => $city['name'],
                'temp' => (string) (int) round($current['temperature_2m'] ?? 0),
                'cond' => self::WMO_CODES[$code] ?? 'N/D',
                'hi' => (string) (int) round($daily['temperature_2m_max'][0] ?? 0),
                'lo' => (string) (int) round($daily['temperature_2m_min'][0] ?? 0),
            ];
        }

        return response()->json($weather);
    }
}
