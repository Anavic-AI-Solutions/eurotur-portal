<?php

namespace Database\Factories;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user belongs to the admin role.
     */
    public function admin(): static
    {
        return $this->withRole(UserRole::Admin);
    }

    /**
     * Indicate that the user belongs to the editor role.
     */
    public function editor(): static
    {
        return $this->withRole(UserRole::Editor);
    }

    /**
     * Indicate that the user belongs to the viewer role.
     */
    public function viewer(): static
    {
        return $this->withRole(UserRole::Viewer);
    }

    /**
     * Attach the user to a role, creating the system role (with its seeded
     * permissions) when it does not exist yet.
     */
    public function withRole(UserRole|Role|string $role): static
    {
        return $this->state(function (array $attributes) use ($role): array {
            if ($role instanceof Role) {
                return ['role_id' => $role->id];
            }

            $slug = $role instanceof UserRole ? $role->value : $role;

            return ['role_id' => RolePermissionSeeder::ensureRole($slug, self::permissionsFor($slug))->id];
        });
    }

    /**
     * Attach the user to an ad-hoc role holding exactly the given permissions.
     *
     * @param  list<Permission>  $permissions
     */
    public function withPermissions(array $permissions, string $slug = 'custom'): static
    {
        return $this->state(function (array $attributes) use ($permissions, $slug): array {
            $role = Role::updateOrCreate(['slug' => $slug], ['name' => Str::headline($slug)]);

            RolePermissionSeeder::syncPermissionCatalogue();

            $role->permissions()->sync(
                \App\Models\Permission::whereIn('slug', array_column($permissions, 'value'))->pluck('id'),
            );
            $role->flushPermissionCache();

            return ['role_id' => $role->id];
        });
    }

    /**
     * @return list<Permission>
     */
    protected static function permissionsFor(string $slug): array
    {
        return match ($slug) {
            UserRole::Admin->value => Permission::cases(),
            UserRole::Editor->value => Permission::contentPermissions(),
            default => [],
        };
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static {}
}
