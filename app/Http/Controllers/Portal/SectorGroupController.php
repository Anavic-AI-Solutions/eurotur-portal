<?php

namespace App\Http\Controllers\Portal;

use App\Enums\EditableSector;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreSectorGroupRequest;
use App\Http\Requests\Portal\UpdateSectorGroupRequest;
use App\Models\SectorGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SectorGroupController extends Controller
{
    /**
     * Create a new group (column) within a sector.
     */
    public function store(EditableSector $sector, StoreSectorGroupRequest $request): RedirectResponse
    {
        $nextSortOrder = SectorGroup::query()->where('sector', $sector->value)->max('sort_order') + 1;

        SectorGroup::create([
            ...$request->validated(),
            'sector' => $sector->value,
            'sort_order' => $nextSortOrder,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Grupo agregado.')]);

        return back();
    }

    /**
     * Update a group's title.
     */
    public function update(SectorGroup $group, UpdateSectorGroupRequest $request): RedirectResponse
    {
        $group->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Grupo actualizado.')]);

        return back();
    }

    /**
     * Delete a group and its items.
     */
    public function destroy(SectorGroup $group): RedirectResponse
    {
        Gate::authorize(Permission::forSector(EditableSector::from($group->sector))->value);

        $group->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Grupo eliminado.')]);

        return back();
    }
}
