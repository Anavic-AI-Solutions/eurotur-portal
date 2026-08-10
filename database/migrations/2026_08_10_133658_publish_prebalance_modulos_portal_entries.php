<?php

use App\Models\Frente;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use Illuminate\Database\Migrations\Migration;

/**
 * Publishes the "Armado Pre-Balance de Módulos" tool into already-seeded databases.
 *
 * New installs get the same content from SectorLinksSeeder / FrenteSeeder, so every
 * insert here is idempotent: nothing is duplicated when both paths run.
 */
return new class extends Migration
{
    private const TOOL_GROUP = 'Contabilidad · Cierre mensual';

    private const TOOL_ITEM = 'Pre-Balance de Módulos — herramienta';

    private const DOC_ITEM = 'Pre-Balance de Módulos — documentación';

    private const HOWTO_ITEM = 'Pre-Balance de Módulos — cómo se usa';

    private const RESPONSABLES_GROUP = 'Contabilidad · Pre-Balance';

    private const DOC_URL = '/documentos/prebalance-modulos.docx';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // On a fresh install the seeders own this content; there is nothing to backfill.
        if (SectorGroup::query()->where('sector', 'adm')->doesntExist()) {
            return;
        }

        $admBlock = $this->group('adm', self::TOOL_GROUP);

        $this->item($admBlock, self::TOOL_ITEM, [
            'url' => '/adm/prebalance',
            'badge' => 'En prueba — Contabilidad',
            'keywords' => 'prebalance, pre-balance, balance de módulos, cierre contable, Tango, sumas y saldos',
        ]);

        $this->item($admBlock, self::DOC_ITEM, ['url' => self::DOC_URL]);

        $instructivos = SectorGroup::query()
            ->where('sector', 'adm')
            ->where('title', 'Instructivos')
            ->first();

        if ($instructivos instanceof SectorGroup) {
            $this->item($instructivos, self::HOWTO_ITEM, ['url' => self::DOC_URL]);
        }

        $this->item($this->group('responsables', self::RESPONSABLES_GROUP), 'Quintana, Elsa');

        $frente = Frente::query()->firstOrCreate(
            ['area' => self::TOOL_GROUP],
            [
                'owner' => 'E. Quintana · N. Basualdo',
                'sort_order' => (int) Frente::query()->max('sort_order') + 1,
            ],
        );

        $frente->iniciativas()->firstOrCreate(
            ['n' => 'Pre-Balance de Módulos (Tango)'],
            [
                'badge' => 'En prueba',
                'cls' => 'test',
                'desc' => 'Se le arrastran los 4 reportes de Tango y devuelve el Excel armado con 15 controles: pegado de listados, fórmulas EXTRAE, saldo neto debe menos haber, tablas dinámicas por cuenta, validación de que cada módulo dé cero, BUSCARV contra el plan de cuentas y detección de cuentas nuevas.',
                'url' => self::DOC_URL,
                'sort_order' => 0,
            ],
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        SectorItem::query()
            ->whereIn('label', [self::TOOL_ITEM, self::DOC_ITEM, self::HOWTO_ITEM])
            ->delete();

        SectorGroup::query()
            ->where(fn ($builder) => $builder->where('sector', 'adm')->where('title', self::TOOL_GROUP))
            ->orWhere(fn ($builder) => $builder->where('sector', 'responsables')->where('title', self::RESPONSABLES_GROUP))
            ->delete();

        Frente::query()->where('area', self::TOOL_GROUP)->delete();
    }

    private function group(string $sector, string $title): SectorGroup
    {
        return SectorGroup::query()->firstOrCreate(
            ['sector' => $sector, 'title' => $title],
            ['sort_order' => (int) SectorGroup::query()->where('sector', $sector)->max('sort_order') + 1],
        );
    }

    /**
     * @param  array{url?: string, badge?: string, keywords?: string}  $attributes
     */
    private function item(SectorGroup $group, string $label, array $attributes = []): void
    {
        $group->items()->firstOrCreate(
            ['label' => $label],
            [...$attributes, 'sort_order' => (int) $group->items()->max('sort_order') + 1],
        );
    }
};
