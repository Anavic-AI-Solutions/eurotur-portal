<?php

namespace Tests\Feature\Portal;

use App\Models\BnaDailyRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExchangeRateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake([
            'dolarapi.com/*' => Http::response(['venta' => 1510, 'compra' => 1460]),
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
            ->where('bnaSell', 1510)
            ->has('history', 2)
            ->where('history.0.date', '2026-08-11')
            ->where('history.1.date', '2026-08-10')
        );
    }
}
