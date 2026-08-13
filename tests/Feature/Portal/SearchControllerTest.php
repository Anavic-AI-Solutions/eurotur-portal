<?php

namespace Tests\Feature\Portal;

use App\Models\SearchStaticEntry;
use App\Models\SearchSynonymTerm;
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

    public function test_it_does_not_match_a_short_term_in_the_middle_of_an_unrelated_word(): void
    {
        $this->makeItem('Cuadro comparativo de tarifas', 'producto', 'Herramientas', 'comparativa, comparativo, benchmark');
        $this->makeItem('DDJJ Reintegro IVA', 'adm', 'Cuentas a pagar', 'iva, impuesto al valor agregado');

        $response = $this->getJson(route('portal.search', ['q' => 'iva']));

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.label', 'DDJJ Reintegro IVA');
    }

    public function test_it_still_matches_a_word_that_starts_with_the_term(): void
    {
        $this->makeItem('Manual de conductores');

        $response = $this->getJson(route('portal.search', ['q' => 'conductor']));

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.label', 'Manual de conductores');
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

    public function test_it_expands_the_query_through_the_synonym_thesaurus(): void
    {
        SearchSynonymTerm::create(['group_number' => 1, 'term' => 'factura']);
        SearchSynonymTerm::create(['group_number' => 1, 'term' => 'comprobante']);
        SearchSynonymTerm::create(['group_number' => 1, 'term' => 'invoice']);
        $this->makeItem('Solicitud de pago Comex', 'adm', 'Cuentas a pagar', 'factura, facturas');

        $response = $this->getJson(route('portal.search', ['q' => 'invoice']));

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.label', 'Solicitud de pago Comex');
    }

    public function test_it_finds_a_static_entry_by_its_keywords(): void
    {
        SearchStaticEntry::create([
            'title' => 'Mesa de Informacion',
            'url' => '/mesa',
            'keywords' => 'mesa de informacion, ayuda, faq, wifi',
            'sector_label' => 'Mesa de Informacion',
            'sector_href' => '/mesa',
        ]);

        $response = $this->getJson(route('portal.search', ['q' => 'wifi']));

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.label', 'Mesa de Informacion');
        $response->assertJsonPath('0.url', '/mesa');
        $response->assertJsonPath('0.sectorHref', '/mesa');
    }

    public function test_results_from_sector_items_and_static_entries_are_merged_and_sorted(): void
    {
        $this->makeItem('Zeta ítem', 'rrhh', 'Empleado', 'buscable');
        SearchStaticEntry::create([
            'title' => 'Alfa página',
            'url' => '/alfa',
            'keywords' => 'buscable',
        ]);

        $response = $this->getJson(route('portal.search', ['q' => 'buscable']));

        $response->assertOk();
        $response->assertJsonCount(2);
        $response->assertJsonPath('0.label', 'Alfa página');
        $response->assertJsonPath('1.label', 'Zeta ítem');
    }
}
