<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string|null $description
 * @property bool $is_system
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['slug', 'name', 'description', 'is_system'])]
class Role extends Model
{
    /**
     * @return BelongsToMany<Permission, $this>
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * The permission slugs granted to this role, cached until the role or its
     * pivot rows change.
     *
     * @return list<string>
     */
    public function permissionSlugs(): array
    {
        return Cache::rememberForever(
            self::cacheKey($this->id),
            fn (): array => array_values($this->permissions()->pluck('slug')->all()),
        );
    }

    public static function cacheKey(int $id): string
    {
        return "role:{$id}:permissions";
    }

    /**
     * Must be called by hand after syncing the pivot: `sync()` does not fire
     * model events, so the `saved` hook below never sees those writes.
     */
    public function flushPermissionCache(): void
    {
        Cache::forget(self::cacheKey($this->id));
    }

    protected static function booted(): void
    {
        static::saved(fn (Role $role) => $role->flushPermissionCache());
        static::deleted(fn (Role $role) => $role->flushPermissionCache());
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }
}
