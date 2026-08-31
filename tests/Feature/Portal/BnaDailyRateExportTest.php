<?php

namespace Tests\Feature\Portal;

use App\Models\BnaDailyRate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BnaDailyRateExportTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->admin()->create();
    }

    public function test_it_exports_csv_with_all_rates(): void
    {
        BnaDailyRate::create(['date' => '2026-08-10', 'cash_buy' => 1450, 'cash_sell' => 1500, 'note' => 'test']);
        BnaDailyRate::create(['date' => '2026-08-11', 'cash_buy' => 1460, 'cash_sell' => 1530]);

        $response = $this->actingAs($this->user)->get(route('portal.bna-rates.export'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString(
            'historico-bna-',
            $response->headers->get('Content-Disposition'),
        );

        $content = $response->streamedContent();
        $lines = explode("\n", trim($content));

        // Header + 2 data rows
        $this->assertCount(3, $lines);
        $this->assertStringContainsString('Fecha;Compra;Venta;Nota', $lines[0]);
        $this->assertStringContainsString('2026-08-11', $lines[1]);
        $this->assertStringContainsString('2026-08-10', $lines[2]);
        $this->assertStringContainsString('test', $lines[2]);
    }

    public function test_it_filters_export_by_date_from(): void
    {
        BnaDailyRate::create(['date' => '2026-01-10', 'cash_sell' => 1500]);
        BnaDailyRate::create(['date' => '2026-08-11', 'cash_sell' => 1530]);

        $response = $this->actingAs($this->user)->get(route('portal.bna-rates.export', ['date_from' => '2026-06-01']));

        $response->assertOk();

        $content = $response->streamedContent();
        $lines = explode("\n", trim($content));

        // Header + 1 data row
        $this->assertCount(2, $lines);
        $this->assertStringContainsString('2026-08-11', $lines[1]);
        $this->assertStringNotContainsString('2026-01-10', $content);
    }

    public function test_it_filters_export_by_date_to(): void
    {
        BnaDailyRate::create(['date' => '2026-01-10', 'cash_sell' => 1500]);
        BnaDailyRate::create(['date' => '2026-08-11', 'cash_sell' => 1530]);

        $response = $this->actingAs($this->user)->get(route('portal.bna-rates.export', ['date_to' => '2026-06-30']));

        $response->assertOk();

        $content = $response->streamedContent();
        $lines = explode("\n", trim($content));

        // Header + 1 data row
        $this->assertCount(2, $lines);
        $this->assertStringContainsString('2026-01-10', $lines[1]);
        $this->assertStringNotContainsString('2026-08-11', $content);
    }

    public function test_it_filters_export_by_date_range(): void
    {
        BnaDailyRate::create(['date' => '2026-01-10', 'cash_sell' => 1500]);
        BnaDailyRate::create(['date' => '2026-06-15', 'cash_sell' => 1600]);
        BnaDailyRate::create(['date' => '2026-08-11', 'cash_sell' => 1530]);

        $response = $this->actingAs($this->user)->get(route('portal.bna-rates.export', [
            'date_from' => '2026-03-01',
            'date_to' => '2026-07-31',
        ]));

        $response->assertOk();

        $content = $response->streamedContent();
        $lines = explode("\n", trim($content));

        // Header + 1 data row
        $this->assertCount(2, $lines);
        $this->assertStringContainsString('2026-06-15', $lines[1]);
        $this->assertStringNotContainsString('2026-01-10', $content);
        $this->assertStringNotContainsString('2026-08-11', $content);
    }

    public function test_it_returns_only_header_when_no_rates_match(): void
    {
        BnaDailyRate::create(['date' => '2026-01-10', 'cash_sell' => 1500]);

        $response = $this->actingAs($this->user)->get(route('portal.bna-rates.export', ['date_from' => '2027-01-01']));

        $response->assertOk();

        $content = $response->streamedContent();
        $lines = explode("\n", trim($content));

        // Only header
        $this->assertCount(1, $lines);
    }

    public function test_it_requires_authentication(): void
    {
        $response = $this->get(route('portal.bna-rates.export'));

        $response->assertRedirect();
    }
}
