<?php

namespace Tests\Feature\Portal;

use App\Models\SectorGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeItem(string $label, string $sector = 'rrhh', string $groupTitle = 'Empleado', ?string $keywords = null): void
    {
        $group = SectorGroup::create(['sector' => $sector, 'title' => $groupTitle, 'sort_order' => 0]);
        $group->items()->create([
            'label' => $label,
            'url' => 'https://example.com',
            'keywords' => $keywords,
            'sort_order' => 0,
        ]);
    }

    public function test_it_finds_items_by_partial_label_case_insensitively(): void
    {
        $this->makeItem('Manual de conductores');

        $response = $this->getJson(route('portal.search', ['q' => 'conductor']));

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.label', 'Manual de conductores');
        $response->assertJsonPath('0.sectorLabel', 'RRHH');
        $response->assertJsonPath('0.groupTitle', 'Empleado');
    }

    public function test_it_returns_empty_for_queries_shorter_than_two_characters(): void
    {
        $this->makeItem('Manual de conductores');

        $response = $this->getJson(route('portal.search', ['q' => 'm']));

        $response->assertOk();
        $response->assertJsonCount(0);
    }

    public function test_it_returns_no_results_when_nothing_matches(): void
    {
        $this->makeItem('Manual de conductores');

        $response = $this->getJson(route('portal.search', ['q' => 'zzzzz']));

        $response->assertOk();
        $response->assertJsonCount(0);
    }

    public function test_it_finds_items_by_keywords_when_the_label_does_not_match(): void
    {
        $this->makeItem(
            'Pre-Balance de Módulos — herramienta',
            'adm',
            'Contabilidad · Cierre mensual',
            'prebalance, pre-balance, balance de módulos, cierre contable, Tango, sumas y saldos',
        );

        foreach (['prebalance', 'tango', 'sumas y saldos', 'cierre contable'] as $needle) {
            $response = $this->getJson(route('portal.search', ['q' => $needle]));

            $response->assertOk();
            $response->assertJsonCount(1);
            $response->assertJsonPath('0.label', 'Pre-Balance de Módulos — herramienta');
        }
    }

    public function test_it_still_matches_items_without_keywords(): void
    {
        $this->makeItem('Manual de conductores');
        $this->makeItem('Pre-Balance de Módulos — herramienta', 'adm', 'Contabilidad · Cierre mensual', 'tango');

        $response = $this->getJson(route('portal.search', ['q' => 'manual']));

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.label', 'Manual de conductores');
    }

    public function test_search_does_not_require_authentication(): void
    {
        $this->makeItem('Manual de conductores');

        $response = $this->getJson(route('portal.search', ['q' => 'manual']));

        $response->assertOk();
    }

    public function test_it_finds_the_expense_report_panel_by_its_indexed_keywords(): void
    {
        $this->makeItem(
            'Rendición de gastos — panel guiado',
            'adm',
            'Cuentas a pagar',
            'rendición de gastos, rendicion de gastos, rendicion, gastos, viáticos, viaticos, comprobantes, reintegro, tesorería',
        );

        foreach (['rendicion de gastos', 'viaticos', 'comprobantes', 'reintegro'] as $needle) {
            $response = $this->getJson(route('portal.search', ['q' => $needle]));

            $response->assertOk();
            $response->assertJsonCount(1);
            $response->assertJsonPath('0.label', 'Rendición de gastos — panel guiado');
        }
    }
}
