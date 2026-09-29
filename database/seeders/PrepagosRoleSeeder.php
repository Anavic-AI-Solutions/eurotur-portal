<?php

namespace Database\Seeders;

use App\Enums\Permission as PermissionEnum;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Two starter roles scoped to the Prepagos domain permissions, orthogonal to
 * the generic admin/editor/viewer content ladder in RolePermissionSeeder —
 * deliberately not added to the UserRole enum or its matrix(). Not marked as
 * system roles: admins can delete or repurpose them like any other custom
 * role once no user holds them. A combination that needs a different mix of
 * views is just a Role built from Admin → Roles, no seeder change needed.
 * Idempotent: safe to run on every deploy.
 */
class PrepagosRoleSeeder extends Seeder
{
    /**
     * @var array<string, array{name: string, permissions: list<PermissionEnum>}>
     */
    private const ROLES = [
        'supervisor-prepagos' => [
            'name' => 'Supervisor',
            'permissions' => [
                PermissionEnum::PrepagosManage,
                PermissionEnum::PrepagosVerCoordinacion,
                PermissionEnum::PrepagosVerControl,
            ],
        ],
        'analista-prepagos' => [
            'name' => 'Analista',
            'permissions' => [
                PermissionEnum::PrepagosManage,
                PermissionEnum::PrepagosVerBandeja,
            ],
        ],
    ];

    public function run(): void
    {
        RolePermissionSeeder::syncPermissionCatalogue();

        foreach (self::ROLES as $slug => $definition) {
            $role = Role::updateOrCreate(
                ['slug' => $slug],
                ['name' => $definition['name'], 'is_system' => false],
            );

            $slugs = array_map(fn (PermissionEnum $permission): string => $permission->value, $definition['permissions']);

            $role->permissions()->sync(
                Permission::whereIn('slug', $slugs)->pluck('id'),
            );

            $role->flushPermissionCache();
        }
    }
}
