<?php

namespace App\Http\Resources\Portal;

use App\Models\SectorItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property SectorItem $resource
 */
class SectorItemAdminResource extends JsonResource
{
    private const SECTOR_LABELS = [
        'rrhh' => 'RRHH',
        'adm' => 'Administración',
        'contrataciones' => 'Contrataciones',
        'operaciones' => 'Operaciones',
        'producto' => 'Producto',
        'customercare' => 'Customer Care',
        'sales' => 'Sales',
        'traveldesigners' => 'Travel Designers',
        'it' => 'IT',
        'responsables' => 'Responsables del Portal',
    ];

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $sector = $this->resource->group->sector;

        return [
            'id' => $this->resource->id,
            'label' => $this->resource->label,
            'url' => $this->resource->resolvedUrl(),
            'groupTitle' => $this->resource->group->title,
            'sectorLabel' => self::SECTOR_LABELS[$sector] ?? $sector,
            'keywords' => $this->resource->keywords,
        ];
    }
}
