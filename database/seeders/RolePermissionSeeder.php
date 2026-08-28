<?php

namespace Database\Seeders;

use App\Enums\Permission as PermissionEnum;
use App\Enums\UserRole;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Syncs the `permissions` table with the enum catalogue and (re)builds the
 * three system roles. Idempotent: safe to run on every deploy.
 */
class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        self::syncPermissionCatalogue();

        foreach ($this->matrix() as $slug => $permissions) {
            self::ensureRole($slug, $permissions);
        }
    }

    /**
     * @param  list<PermissionEnum>|null  $permissions  null keeps the current grants
     */
    public static function ensureRole(string $slug, ?array $permissions = null): Role
    {
        self::syncPermissionCatalogue();

        $role = Role::updateOrCreate(
            ['slug' => $slug],
            ['name' => UserRole::fromSlug($slug)->label(), 'is_system' => true],
        );

        if ($permissions !== null) {
            $role->permissions()->sync(
                Permission::whereIn('slug', array_column($permissions, 'value'))->pluck('id'),
            );

            $role->flushPermissionCache();
        }

        return $role;
    }

    public static function syncPermissionCatalogue(): void
    {
        foreach (PermissionEnum::cases() as $permission) {
            Permission::updateOrCreate(
                ['slug' => $permission->value],
                ['name' => $permission->label(), 'group' => $permission->group()],
            );
        }

        Permission::whereNotIn('slug', PermissionEnum::values())->delete();
    }

    /**
     * @return array<string, list<PermissionEnum>>
     */
    protected function matrix(): array
    {
        return [
            UserRole::Admin->value => PermissionEnum::cases(),
            UserRole::Editor->value => PermissionEnum::contentPermissions(),
            UserRole::Viewer->value => [],
        ];
    }
}
