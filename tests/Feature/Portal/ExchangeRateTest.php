<?php

namespace Tests\Feature\Portal;

use App\Models\BnaDailyRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExchangeRateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        Http::fake([
            'dolarapi.com/*' => Http::response(['venta' => 1510, 'compra' => 1460, 'fechaActualizacion' => '2026-08-14T10:00:02.000Z']),
            'sudameria.com/*' => Http::response(null, 403),
        ]);
    }

    public function test_it_renders_the_exchange_rate_page(): void
    {
        BnaDailyRate::create(['date' => '2026-08-10', 'cash_sell' => 1500]);
        BnaDailyRate::create(['date' => '2026-08-11', 'cash_sell' => 1530]);

        $response = $this->get(route('portal.exchange-rate'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('portal/exchange-rate')
            ->where('bna.venta', 1510)
            ->has('history', 2)
            ->where('history.0.date', '2026-08-11')
            ->where('history.1.date', '2026-08-10')
            ->where('pagination.current_page', 1)
            ->where('pagination.last_page', 1)
            ->where('pagination.total', 2)
            ->where('filters.date_from', null)
            ->where('filters.date_to', null)
        );
    }

    public function test_it_shares_the_official_rate_with_the_source_timestamp(): void
    {
        $response = $this->get(route('portal.exchange-rate'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('portal/exchange-rate')
            ->where('bna.venta', 1510)
            ->where('bna.fecha', '2026-08-14T10:00:02.000Z')
        );
    }

    public function test_it_paginates_history(): void
    {
        for ($i = 1; $i <= 30; $i++) {
            BnaDailyRate::create([
                'date' => "2026-01-{$i}",
                'cash_sell' => 1500 + $i,
            ]);
        }

        $response = $this->get(route('portal.exchange-rate'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('history', 25)
            ->where('pagination.current_page', 1)
            ->where('pagination.last_page', 2)
            ->where('pagination.total', 30)
        );
    }

    public function test_it_paginates_to_second_page(): void
    {
        for ($i = 1; $i <= 30; $i++) {
            BnaDailyRate::create([
                'date' => "2026-01-{$i}",
                'cash_sell' => 1500 + $i,
            ]);
        }

        $response = $this->get(route('portal.exchange-rate', ['page' => 2]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('history', 5)
            ->where('pagination.current_page', 2)
            ->where('pagination.last_page', 2)
            ->where('pagination.total', 30)
        );
    }

    public function test_it_filters_by_date_from(): void
    {
        BnaDailyRate::create(['date' => '2026-01-10', 'cash_sell' => 1500]);
        BnaDailyRate::create(['date' => '2026-06-15', 'cash_sell' => 1600]);
        BnaDailyRate::create(['date' => '2026-08-01', 'cash_sell' => 1700]);

        $response = $this->get(route('portal.exchange-rate', ['date_from' => '2026-06-01']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('history', 2)
            ->where('filters.date_from', '2026-06-01')
            ->where('filters.date_to', null)
        );
    }

    public function test_it_filters_by_date_to(): void
    {
        BnaDailyRate::create(['date' => '2026-01-10', 'cash_sell' => 1500]);
        BnaDailyRate::create(['date' => '2026-06-15', 'cash_sell' => 1600]);
        BnaDailyRate::create(['date' => '2026-08-01', 'cash_sell' => 1700]);

        $response = $this->get(route('portal.exchange-rate', ['date_to' => '2026-06-30']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('history', 2)
            ->where('filters.date_from', null)
            ->where('filters.date_to', '2026-06-30')
        );
    }

    public function test_it_filters_by_date_range(): void
    {
        BnaDailyRate::create(['date' => '2026-01-10', 'cash_sell' => 1500]);
        BnaDailyRate::create(['date' => '2026-06-15', 'cash_sell' => 1600]);
        BnaDailyRate::create(['date' => '2026-08-01', 'cash_sell' => 1700]);

        $response = $this->get(route('portal.exchange-rate', [
            'date_from' => '2026-03-01',
            'date_to' => '2026-07-31',
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('history', 1)
            ->where('history.0.date', '2026-06-15')
            ->where('filters.date_from', '2026-03-01')
            ->where('filters.date_to', '2026-07-31')
        );
    }

    public function test_it_returns_empty_when_no_rates_match_filters(): void
    {
        BnaDailyRate::create(['date' => '2026-01-10', 'cash_sell' => 1500]);

        $response = $this->get(route('portal.exchange-rate', ['date_from' => '2027-01-01']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('history', 0)
            ->where('pagination.total', 0)
        );
    }

    public function test_it_applies_filters_without_page_param(): void
    {
        for ($i = 1; $i <= 30; $i++) {
            BnaDailyRate::create([
                'date' => "2026-01-{$i}",
                'cash_sell' => 1500 + $i,
            ]);
        }

        $response = $this->get(route('portal.exchange-rate', ['date_from' => '2026-01-15']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('pagination.current_page', 1)
        );
    }
}
