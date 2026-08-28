<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Permission;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property int|null $role_id
 * @property-read Role|null $role
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role_id'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @return BelongsTo<Role, $this>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function roleSlug(): ?string
    {
        return $this->role?->slug;
    }

    public function isAdmin(): bool
    {
        return $this->roleSlug() === UserRole::Admin->value;
    }

    /**
     * Every permission slug this user holds. Admins get the full catalogue so
     * the frontend sees the same thing the Gate::before shortcut grants.
     *
     * @return list<string>
     */
    public function permissionSlugs(): array
    {
        if ($this->isAdmin()) {
            return Permission::values();
        }

        return $this->role?->permissionSlugs() ?? [];
    }

    public function hasPermission(Permission|string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $slug = $permission instanceof Permission ? $permission->value : $permission;

        return in_array($slug, $this->permissionSlugs(), true);
    }

    /**
     * Whether the user may edit any portal content.
     */
    public function canEditPortal(): bool
    {
        foreach (Permission::contentPermissions() as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
