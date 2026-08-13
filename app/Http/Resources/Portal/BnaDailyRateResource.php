<?php

namespace App\Http\Resources\Portal;

use App\Models\BnaDailyRate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property BnaDailyRate $resource
 */
class BnaDailyRateResource extends JsonResource
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
            'date' => $this->resource->date->format('Y-m-d'),
            'dateLabel' => $this->resource->date->translatedFormat('D d/m/y'),
            'cashBuy' => $this->resource->cash_buy !== null ? (float) $this->resource->cash_buy : null,
            'cashSell' => (float) $this->resource->cash_sell,
            'note' => $this->resource->note,
        ];
    }
}
