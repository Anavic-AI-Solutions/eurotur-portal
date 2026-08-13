<?php

use App\Models\SectorGroup;
use App\Models\SectorItem;
use Illuminate\Database\Migrations\Migration;

/**
 * Publishes the "Tipo de Cambio" page into already-seeded databases, so the
 * search index can find it. New installs get it from SectorLinksSeeder, so
 * this is idempotent: nothing is duplicated when both paths run.
 */
return new class extends Migration
{
    private const CXP_GROUP = 'Cuentas a pagar';

    private const ITEM_LABEL = 'Tipo de Cambio — IATA, BNA e histórico';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // On a fresh install the seeder owns this content; there is nothing to backfill.
        if (SectorGroup::query()->where('sector', 'adm')->doesntExist()) {
            return;
        }

        $cxpGroup = SectorGroup::query()
            ->where('sector', 'adm')
            ->where('title', self::CXP_GROUP)
            ->first();

        if (! $cxpGroup instanceof SectorGroup) {
            return;
        }

        $cxpGroup->items()->firstOrCreate(
            ['label' => self::ITEM_LABEL],
            [
                'url' => '/tipo-de-cambio',
                'keywords' => 'dolar cotizacion tipo de cambio iata bna aereo billete',
                'sort_order' => (int) $cxpGroup->items()->max('sort_order') + 1,
            ],
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        SectorItem::query()->where('label', self::ITEM_LABEL)->delete();
    }
};
