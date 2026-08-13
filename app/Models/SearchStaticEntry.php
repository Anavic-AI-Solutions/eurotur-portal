<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $url
 * @property string|null $keywords
 * @property string|null $sector_label
 * @property string|null $sector_href
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'url', 'keywords', 'sector_label', 'sector_href'])]
class SearchStaticEntry extends Model
{
    //
}
