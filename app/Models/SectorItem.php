<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $sector_group_id
 * @property string $label
 * @property string|null $url
 * @property string|null $badge
 * @property string|null $keywords
 * @property string|null $file_path
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['sector_group_id', 'label', 'url', 'badge', 'keywords', 'file_path', 'sort_order'])]
class SectorItem extends Model
{
    /**
     * @return BelongsTo<SectorGroup, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(SectorGroup::class, 'sector_group_id');
    }

    public function resolvedUrl(): ?string
    {
        if ($this->file_path !== null) {
            return Storage::disk('public')->url($this->file_path);
        }

        return $this->url;
    }
}
