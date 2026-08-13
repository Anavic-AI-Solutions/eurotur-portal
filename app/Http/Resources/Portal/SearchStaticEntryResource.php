<?php

namespace App\Http\Resources\Portal;

use App\Models\SearchStaticEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property SearchStaticEntry $resource
 */
class SearchStaticEntryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'static-'.$this->resource->id,
            'label' => $this->resource->title,
            'url' => $this->resource->url,
            'groupTitle' => null,
            'sectorLabel' => $this->resource->sector_label,
            'sectorHref' => $this->resource->sector_href,
        ];
    }
}
