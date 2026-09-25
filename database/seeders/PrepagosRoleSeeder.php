<?php

namespace Database\Seeders;

use App\Enums\Permission as PermissionEnum;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Two starter roles scoped to a single domain permission (prepagos.manage),
 * orthogonal to the generic admin/editor/viewer content ladder in
 * RolePermissionSeeder — deliberately not added to the UserRole enum or its
 * matrix(). Not marked as system roles: admins can delete or repurpose them
 * like any other custom role once no user holds them. Idempotent: safe to
 * run on every deploy.
 */
class PrepagosRoleSeeder extends Seeder
{
    /**
     * @var array<string, string> slug => name
     */
    private const ROLES = [
        'supervisor-prepagos' => 'Supervisor',
        'analista-prepagos' => 'Analista',
    ];

    public function run(): void
    {
        RolePermissionSeeder::syncPermissionCatalogue();

        foreach (self::ROLES as $slug => $name) {
            $role = Role::updateOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'is_system' => false],
            );

            $role->permissions()->sync(
                Permission::where('slug', PermissionEnum::PrepagosManage->value)->pluck('id'),
            );

            $role->flushPermissionCache();
        }
    }
}
