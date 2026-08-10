<?php

use App\Models\Frente;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use Illuminate\Database\Migrations\Migration;

/**
 * Publishes the "Panel de Rendición de Gastos" tool into already-seeded databases.
 *
 * New installs get the same content from SectorLinksSeeder / FrenteSeeder, so every
 * change here is idempotent: nothing is duplicated when both paths run.
 */
return new class extends Migration
{
    private const CXP_GROUP = 'Cuentas a pagar';

    private const OLD_ITEM = 'Formulario rendición de gastos';

    private const OLD_ITEM_URL = 'https://drive.google.com/drive/u/0/folders/1rRgOCZ8QBBin6Qgjmnxb-cGbwJhm_5I_';

    private const TOOL_ITEM = 'Rendición de gastos — panel guiado';

    private const BACKUP_ITEM = 'Rendición de gastos — plantilla Excel (respaldo)';

    private const HOWTO_ITEM = 'Rendición de gastos — manual de uso';

    private const DOC_URL = '/documentos/rendicion-gastos-manual.docx';

    private const FRENTE_AREA = 'Administrativo · Cuentas a pagar';

    private const INICIATIVA_NOMBRE = 'Panel de Rendición de Gastos';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // On a fresh install the seeders own this content; there is nothing to backfill.
        if (SectorGroup::query()->where('sector', 'adm')->doesntExist()) {
            return;
        }

        $cxpGroup = SectorGroup::query()
            ->where('sector', 'adm')
            ->where('title', self::CXP_GROUP)
            ->first();

        if ($cxpGroup instanceof SectorGroup) {
            $oldItem = $cxpGroup->items()->where('label', self::OLD_ITEM)->first();

            if ($oldItem instanceof SectorItem) {
                $oldItem->update([
                    'label' => self::TOOL_ITEM,
                    'url' => '/adm/rendicion-gastos',
                    'badge' => 'En prueba — Cuentas a pagar',
                    'keywords' => 'rendición de gastos, rendicion de gastos, rendicion, gastos, viáticos, viaticos, comprobantes, reintegro, tesorería',
                ]);
            } else {
                $this->item($cxpGroup, self::TOOL_ITEM, [
                    'url' => '/adm/rendicion-gastos',
                    'badge' => 'En prueba — Cuentas a pagar',
                    'keywords' => 'rendición de gastos, rendicion de gastos, rendicion, gastos, viáticos, viaticos, comprobantes, reintegro, tesorería',
                ]);
            }

            $this->item($cxpGroup, self::BACKUP_ITEM, ['url' => self::OLD_ITEM_URL]);
            $this->placeBackupRightAfterTool($cxpGroup);
        }

        $instructivos = SectorGroup::query()
            ->where('sector', 'adm')
            ->where('title', 'Instructivos')
            ->first();

        if ($instructivos instanceof SectorGroup) {
            $this->item($instructivos, self::HOWTO_ITEM, ['url' => self::DOC_URL]);
        }

        $frente = Frente::query()->where('area', self::FRENTE_AREA)->first();

        if ($frente instanceof Frente) {
            $frente->iniciativas()->firstOrCreate(
                ['n' => self::INICIATIVA_NOMBRE],
                [
                    'badge' => 'En prueba',
                    'cls' => 'test',
                    'desc' => 'Panel guiado que reemplaza la carga manual del Excel oficial de rendición de gastos: se completa paso a paso y descarga el mismo Excel ya completo, con fórmulas y validaciones intactas, listo para Tesorería. Cubre ARS y moneda extranjera, hasta 60 comprobantes.',
                    'url' => '/adm/rendicion-gastos',
                    'sort_order' => (int) $frente->iniciativas()->max('sort_order') + 1,
                ],
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        SectorItem::query()
            ->where('label', self::TOOL_ITEM)
            ->update([
                'label' => self::OLD_ITEM,
                'url' => self::OLD_ITEM_URL,
                'badge' => null,
                'keywords' => null,
            ]);

        SectorItem::query()
            ->whereIn('label', [self::BACKUP_ITEM, self::HOWTO_ITEM])
            ->delete();

        Frente::query()
            ->where('area', self::FRENTE_AREA)
            ->first()
            ?->iniciativas()
            ->where('n', self::INICIATIVA_NOMBRE)
            ->delete();
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

    /**
     * On an already-seeded database, item() appends the backup item at the end
     * of the group. The ticket asks for it directly below the tool item, so
     * this shifts everything after the tool item down by one and slots the
     * backup in right after it. Idempotent: a no-op once the order is correct.
     */
    private function placeBackupRightAfterTool(SectorGroup $group): void
    {
        $tool = $group->items()->where('label', self::TOOL_ITEM)->first();
        $backup = $group->items()->where('label', self::BACKUP_ITEM)->first();

        if (! $tool instanceof SectorItem || ! $backup instanceof SectorItem) {
            return;
        }

        if ($backup->sort_order === $tool->sort_order + 1) {
            return;
        }

        $group->items()
            ->where('id', '!=', $backup->id)
            ->where('sort_order', '>', $tool->sort_order)
            ->increment('sort_order');

        $backup->update(['sort_order' => $tool->sort_order + 1]);
    }
};
