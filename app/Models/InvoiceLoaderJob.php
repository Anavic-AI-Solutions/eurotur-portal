<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $job_id
 * @property string $kind
 * @property string $original_filename
 * @property bool|null $dry_run
 * @property string|null $status
 * @property int $polling_attempts
 * @property string|null $file_path
 * @property string|null $report_path
 * @property string|null $log_path
 * @property Carbon|null $archived_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'job_id',
    'kind',
    'original_filename',
    'dry_run',
    'status',
    'polling_attempts',
    'file_path',
    'report_path',
    'log_path',
    'archived_at',
])]
class InvoiceLoaderJob extends Model
{
    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dry_run' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }
}
