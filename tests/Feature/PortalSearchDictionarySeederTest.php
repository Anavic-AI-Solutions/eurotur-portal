<?php

namespace Tests\Feature;

use App\Models\SearchStaticEntry;
use App\Models\SearchSynonymTerm;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use Database\Seeders\PortalSearchDictionarySeeder;
use Database\Seeders\SectorLinksSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalSearchDictionarySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_loads_the_dictionary_into_the_search_index(): void
    {
        $this->seed(SectorLinksSeeder::class);
        SectorGroup::create(['sector' => 'adm', 'title' => 'Cuentas a pagar', 'sort_order' => 0])
            ->items()->create(['label' => 'Tipo de Cambio', 'url' => '/tipo-de-cambio', 'sort_order' => 0]);

        $this->seed(PortalSearchDictionarySeeder::class);

        $this->assertGreaterThan(100, SectorItem::whereNotNull('keywords')->count());
        $this->assertGreaterThan(20, SearchStaticEntry::count());
        $this->assertSame(111, SearchSynonymTerm::query()->distinct('group_number')->count('group_number'));

        $mesa = SearchStaticEntry::where('url', '/mesa')->first();
        $this->assertNotNull($mesa);
        $this->assertNotEmpty($mesa->keywords);

        $exchangeRate = SectorItem::where('url', '/tipo-de-cambio')->first();
        $this->assertNotNull($exchangeRate);
        $this->assertStringContainsString('dolar', $exchangeRate->keywords);
    }

    public function test_it_is_idempotent(): void
    {
        $this->seed(SectorLinksSeeder::class);
        SectorGroup::create(['sector' => 'adm', 'title' => 'Cuentas a pagar', 'sort_order' => 0])
            ->items()->create(['label' => 'Tipo de Cambio', 'url' => '/tipo-de-cambio', 'sort_order' => 0]);

        $this->seed(PortalSearchDictionarySeeder::class);
        $countAfterFirstRun = SearchStaticEntry::count();
        $termsAfterFirstRun = SearchSynonymTerm::count();

        $this->seed(PortalSearchDictionarySeeder::class);

        $this->assertSame($countAfterFirstRun, SearchStaticEntry::count());
        $this->assertSame($termsAfterFirstRun, SearchSynonymTerm::count());
    }
}
