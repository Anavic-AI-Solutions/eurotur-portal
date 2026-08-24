<?php

namespace Tests\Unit;

use App\Services\IataRateService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class IataRateServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        // The sudameria fixture is dated 11/08/2026 09:52:12.
        Carbon::setTestNow('2026-08-11 09:52:12');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function fixture(): string
    {
        return file_get_contents(base_path('tests/Fixtures/sudameria-home.html'));
    }

    private function scrapedPage(string $updatedAt): string
    {
        return '<html><body><article title="Actualizado: '.$updatedAt.'"><p>dolar aereo</p><p>$ 1.520,00</p></article></body></html>';
    }

    public function test_it_extracts_the_dolar_aereo_rate_and_not_other_cards(): void
    {
        Http::fake([
            'sudameria.com/*' => Http::response($this->fixture()),
        ]);

        $result = app(IataRateService::class)->rate();

        $this->assertSame(1520.0, $result['rate']);
        $this->assertFalse($result['stale']);
    }

    public function test_it_extracts_the_updated_at_timestamp_from_the_article_title(): void
    {
        Http::fake([
            'sudameria.com/*' => Http::response($this->fixture()),
        ]);

        $result = app(IataRateService::class)->rate();

        $this->assertSame('2026-08-11T09:52:12+00:00', $result['updatedAt']);
    }

    public function test_it_parses_dates_with_single_digit_month_and_comma_separator(): void
    {
        Http::fake([
            'sudameria.com/*' => Http::response($this->scrapedPage('14/8/2026, 07:00:02')),
        ]);

        $result = app(IataRateService::class)->rate();

        $this->assertSame('2026-08-14T07:00:02+00:00', $result['updatedAt']);
    }

    public function test_a_friday_rate_is_fresh_on_monday(): void
    {
        Carbon::setTestNow('2026-08-17 10:00:00'); // Monday

        Http::fake([
            'sudameria.com/*' => Http::response($this->scrapedPage('14/8/2026, 07:00:02')), // Friday
        ]);

        $result = app(IataRateService::class)->rate();

        $this->assertFalse($result['stale']);
    }

    public function test_a_rate_older_than_one_business_day_is_stale(): void
    {
        Carbon::setTestNow('2026-08-17 10:00:00'); // Monday

        Http::fake([
            'sudameria.com/*' => Http::response($this->scrapedPage('13/8/2026, 07:00:02')), // Thursday
        ]);

        $result = app(IataRateService::class)->rate();

        $this->assertTrue($result['stale']);
    }

    public function test_yesterdays_rate_is_fresh(): void
    {
        Carbon::setTestNow('2026-08-18 10:00:00'); // Tuesday

        Http::fake([
            'sudameria.com/*' => Http::response($this->scrapedPage('17/8/2026, 07:00:02')), // Monday
        ]);

        $result = app(IataRateService::class)->rate();

        $this->assertFalse($result['stale']);
    }

    public function test_a_cached_rate_keeps_its_staleness_flag(): void
    {
        Carbon::setTestNow('2026-08-17 10:00:00'); // Monday

        Cache::put('iata-rate:fresh', ['rate' => 1520.0, 'updatedAt' => '2026-08-14T07:00:02+00:00', 'stale' => false], now()->addMinutes(30));

        $result = app(IataRateService::class)->rate();

        $this->assertSame(1520.0, $result['rate']);
        $this->assertFalse($result['stale']);

        Cache::put('iata-rate:fresh', ['rate' => 1520.0, 'updatedAt' => '2026-08-13T07:00:02+00:00', 'stale' => false], now()->addMinutes(30));

        // Thursday data on Monday is older than one business day.
        $result = app(IataRateService::class)->rate();

        $this->assertTrue($result['stale']);
    }

    public function test_it_sends_a_browser_like_user_agent(): void
    {
        Http::fake([
            'sudameria.com/*' => Http::response($this->fixture()),
        ]);

        app(IataRateService::class)->rate();

        Http::assertSent(fn ($request) => str_contains($request->header('User-Agent')[0] ?? '', 'Chrome'));
    }

    public function test_it_caches_the_result_so_the_site_is_scraped_only_once(): void
    {
        Http::fake([
            'sudameria.com/*' => Http::response($this->fixture()),
        ]);

        $service = app(IataRateService::class);
        $service->rate();
        $service->rate();

        Http::assertSentCount(1);
    }

    public function test_it_returns_null_on_a_forbidden_response_with_no_prior_good_value(): void
    {
        Http::fake([
            'sudameria.com/*' => Http::response(null, 403),
        ]);

        $this->assertNull(app(IataRateService::class)->rate());
    }

    public function test_it_falls_back_to_the_last_good_value_when_a_later_scrape_fails(): void
    {
        Cache::put('iata-rate:last-good', ['rate' => 1520.0, 'updatedAt' => '2026-08-11T09:52:12+00:00', 'stale' => false], now()->addHours(24));

        Http::fake([
            'sudameria.com/*' => Http::response(null, 403),
        ]);
        $result = app(IataRateService::class)->rate();

        $this->assertSame(1520.0, $result['rate']);
        $this->assertTrue($result['stale']);
    }

    public function test_it_returns_null_when_the_expected_label_is_missing(): void
    {
        Http::fake([
            'sudameria.com/*' => Http::response('<html><body><article title="Actualizado: 11/08/2026 09:52:12"><p>Otra cosa</p><p>$ 1,00</p></article></body></html>'),
        ]);

        $this->assertNull(app(IataRateService::class)->rate());
    }

    public function test_it_returns_null_on_connection_failure(): void
    {
        Http::fake(function () {
            throw new ConnectionException('Could not connect');
        });

        $this->assertNull(app(IataRateService::class)->rate());
    }
}
