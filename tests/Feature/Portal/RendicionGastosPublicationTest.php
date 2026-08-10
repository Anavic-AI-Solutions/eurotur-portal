<?php

namespace Tests\Feature\Portal;

use App\Models\Frente;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use Database\Seeders\FrenteSeeder;
use Database\Seeders\SectorLinksSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The Panel de Rendición de Gastos entries reach a fresh database through the
 * seeders and an already-seeded one (where the old "Formulario rendición de
 * gastos" item still exists) through a data migration. Both paths must agree,
 * running the migration twice must not duplicate anything, and /rrhh must
 * remain untouched.
 */
class RendicionGastosPublicationTest extends TestCase
{
    use RefreshDatabase;

    private const MIGRATION = 'database/migrations/2026_08_10_140000_publish_rendicion_gastos_portal_entries.php';

    public function test_the_seeders_publish_the_tool_across_adm_and_innovacion(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        $this->assertPublished();
    }

    public function test_the_data_migration_publishes_the_tool_on_an_already_seeded_database(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        // Simulate the pre-existing database: the old item still has its original label/url.
        SectorItem::query()->where('label', 'Rendición de gastos — panel guiado')->update([
            'label' => 'Formulario rendición de gastos',
            'url' => 'https://drive.google.com/drive/u/0/folders/1rRgOCZ8QBBin6Qgjmnxb-cGbwJhm_5I_',
            'badge' => null,
            'keywords' => null,
        ]);
        SectorItem::query()->whereIn('label', [
            'Rendición de gastos — plantilla Excel (respaldo)',
            'Rendición de gastos — manual de uso',
        ])->delete();
        Frente::query()->where('area', 'Administrativo · Cuentas a pagar')->first()
            ?->iniciativas()->where('n', 'Panel de Rendición de Gastos')->delete();

        $this->runDataMigration();

        $this->assertPublished();
    }

    public function test_the_data_migration_is_idempotent_over_the_seeded_content(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        $this->runDataMigration();
        $this->runDataMigration();

        $this->assertPublished();
    }

    public function test_rrhh_rendicion_de_gastos_de_internet_is_untouched(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        $this->runDataMigration();

        $item = SectorItem::query()->where('label', 'Rendición de gastos de internet')->first();
        $this->assertNotNull($item);
        $this->assertSame(
            'https://docs.google.com/forms/d/e/1FAIpQLSdNjkgDveNTy3jp8dx1y43mrpgRH688NRSuoqve4Cha2143HQ/viewform',
            $item->url,
        );
        $this->assertSame('rrhh', $item->group->sector);
    }

    private function runDataMigration(): void
    {
        (require base_path(self::MIGRATION))->up();
    }

    private function assertPublished(): void
    {
        // The old item was replaced, not duplicated.
        $this->assertCount(0, SectorItem::query()->where('label', 'Formulario rendición de gastos')->get());

        $tool = SectorItem::query()->where('label', 'Rendición de gastos — panel guiado')->get();
        $this->assertCount(1, $tool);
        $this->assertSame('/adm/rendicion-gastos', $tool->first()?->url);
        $this->assertSame('En prueba — Cuentas a pagar', $tool->first()?->badge);
        $this->assertStringContainsString('viaticos', (string) $tool->first()?->keywords);

        $backup = SectorItem::query()->where('label', 'Rendición de gastos — plantilla Excel (respaldo)')->get();
        $this->assertCount(1, $backup);
        $this->assertSame(
            'https://drive.google.com/drive/u/0/folders/1rRgOCZ8QBBin6Qgjmnxb-cGbwJhm_5I_',
            $backup->first()?->url,
        );

        // The backup sits directly below the tool, as the ticket asks.
        $this->assertSame($tool->first()?->sort_order + 1, $backup->first()?->sort_order);

        $instructivos = SectorGroup::query()
            ->where('sector', 'adm')
            ->where('title', 'Instructivos')
            ->firstOrFail();
        $labels = $instructivos->items()->pluck('label');
        $this->assertContains('Cierre de módulo mensual', $labels);
        $this->assertSame(1, $labels->filter(fn (string $l) => $l === 'Rendición de gastos — manual de uso')->count());

        $frente = Frente::query()->where('area', 'Administrativo · Cuentas a pagar')->firstOrFail();
        $iniciativas = $frente->iniciativas()->get();
        $this->assertSame(1, $iniciativas->filter(fn ($i) => $i->n === 'Panel de Rendición de Gastos')->count());
        $iniciativa = $iniciativas->firstWhere('n', 'Panel de Rendición de Gastos');
        $this->assertSame('En prueba', $iniciativa->badge);
        $this->assertSame('test', $iniciativa->cls);
    }
}
