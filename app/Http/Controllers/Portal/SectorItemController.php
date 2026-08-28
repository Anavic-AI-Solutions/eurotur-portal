<?php

namespace App\Http\Controllers\Portal;

use App\Enums\EditableSector;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreSectorItemRequest;
use App\Http\Requests\Portal\UpdateSectorItemRequest;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use RuntimeException;

class SectorItemController extends Controller
{
    /**
     * Create a new item (link or plain text) within a group.
     */
    public function store(SectorGroup $group, StoreSectorItemRequest $request): RedirectResponse
    {
        $nextSortOrder = $group->items()->max('sort_order') + 1;

        $group->items()->create([
            'label' => $request->validated('label'),
            'url' => $request->validated('url'),
            'file_path' => $this->storeFile($request),
            'keywords' => $request->validated('keywords'),
            'sort_order' => $nextSortOrder,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Link agregado.')]);

        return back();
    }

    /**
     * Update an item's label, link, or attached file.
     */
    public function update(SectorItem $item, UpdateSectorItemRequest $request): RedirectResponse
    {
        $attributes = [
            'label' => $request->validated('label'),
            'sort_order' => $request->validated('sort_order', $item->sort_order),
            'keywords' => $request->validated('keywords', $item->keywords),
        ];

        if ($request->hasFile('file')) {
            if ($item->file_path !== null) {
                Storage::disk('public')->delete($item->file_path);
            }

            $attributes['file_path'] = $this->storeFile($request);
            $attributes['url'] = null;
        } elseif ($request->filled('url')) {
            if ($item->file_path !== null) {
                Storage::disk('public')->delete($item->file_path);
            }

            $attributes['url'] = $request->validated('url');
            $attributes['file_path'] = null;
        }

        $item->update($attributes);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Link actualizado.')]);

        return back();
    }

    /**
     * Delete an item, removing its uploaded file if present.
     */
    public function destroy(SectorItem $item): RedirectResponse
    {
        Gate::authorize(Permission::forSector(EditableSector::from($item->group->sector))->value);

        if ($item->file_path !== null) {
            Storage::disk('public')->delete($item->file_path);
        }

        $item->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Link eliminado.')]);

        return back();
    }

    private function storeFile(StoreSectorItemRequest|UpdateSectorItemRequest $request): ?string
    {
        if (! $request->hasFile('file')) {
            return null;
        }

        $path = $request->file('file')->store('sector-links', 'public');

        throw_if($path === false, new RuntimeException('Failed to store uploaded file.'));

        return $path;
    }
}
