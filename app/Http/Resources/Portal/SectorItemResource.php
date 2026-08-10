<?php

namespace App\Http\Resources\Portal;

use App\Models\SectorItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property SectorItem $resource
 */
class SectorItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            't' => $this->resource->label,
            'h' => $this->resource->resolvedUrl(),
            'badge' => $this->resource->badge,
        ];
    }
}
