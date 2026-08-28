<?php

namespace App\Concerns;

use App\Enums\EditableSector;
use App\Enums\Permission;
use App\Models\SectorGroup;
use App\Models\SectorItem;

/**
 * Resolves the sector a request targets and checks the matching fine-grained
 * permission. The sector comes from the route binding on store routes and from
 * the bound model on update/destroy routes.
 */
trait AuthorizesSectorEditing
{
    public function authorize(): bool
    {
        $sector = $this->resolveSector();

        return $sector !== null && $this->user()?->can(Permission::forSector($sector)->value) === true;
    }

    protected function resolveSector(): ?EditableSector
    {
        $sector = $this->route('sector');

        if ($sector instanceof EditableSector) {
            return $sector;
        }

        $group = $this->route('group');

        if ($group instanceof SectorItem) {
            $group = $group->group;
        }

        $item = $this->route('item');

        if ($item instanceof SectorItem) {
            $group = $item->group;
        }

        return $group instanceof SectorGroup
            ? EditableSector::tryFrom($group->sector)
            : null;
    }
}
