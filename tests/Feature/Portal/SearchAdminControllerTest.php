<?php

namespace Tests\Feature\Portal;

use App\Models\SearchStaticEntry;
use App\Models\SearchSynonymTerm;
use App\Models\SectorGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchAdminControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_renders_the_search_admin_page_with_the_three_datasets(): void
    {
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);
        $group->items()->create([
            'label' => 'Manual de conductores',
            'url' => 'https://example.com',
            'keywords' => 'conductor',
            'sort_order' => 0,
        ]);
        SearchStaticEntry::create(['title' => 'Mesa', 'url' => '/mesa', 'keywords' => 'ayuda']);
        SearchSynonymTerm::create(['group_number' => 1, 'term' => 'factura']);
        SearchSynonymTerm::create(['group_number' => 1, 'term' => 'comprobante']);

        $response = $this->get(route('portal.search-admin'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('portal/search-admin')
            ->has('items', 1)
            ->where('items.0.label', 'Manual de conductores')
            ->has('staticEntries', 1)
            ->where('staticEntries.0.label', 'Mesa')
            ->has('synonymGroups', 1)
            ->where('synonymGroups.0.groupNumber', 1)
            ->has('synonymGroups.0.terms', 2)
        );
    }

    public function test_search_admin_does_not_require_authentication(): void
    {
        $response = $this->get(route('portal.search-admin'));

        $response->assertOk();
    }
}
