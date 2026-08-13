<?php

namespace Tests\Feature\Console;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RecordBnaDailyRateTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_records_todays_rate(): void
    {
        Http::fake([
            'dolarapi.com/*' => Http::response(['compra' => 1460, 'venta' => 1510]),
        ]);

        $this->artisan('app:record-bna-daily-rate')->assertExitCode(0);

        $this->assertDatabaseHas('bna_daily_rates', [
            'date' => today()->toDateString(),
            'cash_buy' => 1460,
            'cash_sell' => 1510,
        ]);
    }

    public function test_it_updates_todays_rate_if_run_twice(): void
    {
        Http::fakeSequence()
            ->push(['compra' => 1460, 'venta' => 1510])
            ->push(['compra' => 1465, 'venta' => 1515]);

        $this->artisan('app:record-bna-daily-rate')->assertExitCode(0);
        Cache::forget('dolar-oficial-rates');
        $this->artisan('app:record-bna-daily-rate')->assertExitCode(0);

        $this->assertDatabaseCount('bna_daily_rates', 1);
        $this->assertDatabaseHas('bna_daily_rates', [
            'date' => today()->toDateString(),
            'cash_sell' => 1515,
        ]);
    }

    public function test_it_fails_without_writing_when_the_api_is_unreachable(): void
    {
        Http::fake([
            'dolarapi.com/*' => Http::response(null, 500),
        ]);

        $this->artisan('app:record-bna-daily-rate')->assertExitCode(1);

        $this->assertDatabaseCount('bna_daily_rates', 0);
    }
}
