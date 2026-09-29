<?php

namespace Tests\Feature;

use App\Enums\Permission;
use App\Models\Role;
use Database\Seeders\PrepagosRoleSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrepagosRoleSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_supervisor_gets_manage_plus_coordinacion_and_control(): void
    {
        $this->seed(PrepagosRoleSeeder::class);

        $role = Role::where('slug', 'supervisor-prepagos')->firstOrFail();

        $this->assertSame('Supervisor', $role->name);
        $this->assertFalse($role->is_system);
        $this->assertEqualsCanonicalizing(
            [
                Permission::PrepagosManage->value,
                Permission::PrepagosVerCoordinacion->value,
                Permission::PrepagosVerControl->value,
            ],
            $role->permissionSlugs(),
        );
    }

    public function test_analista_gets_manage_plus_bandeja(): void
    {
        $this->seed(PrepagosRoleSeeder::class);

        $role = Role::where('slug', 'analista-prepagos')->firstOrFail();

        $this->assertSame('Analista', $role->name);
        $this->assertFalse($role->is_system);
        $this->assertEqualsCanonicalizing(
            [Permission::PrepagosManage->value, Permission::PrepagosVerBandeja->value],
            $role->permissionSlugs(),
        );
    }

    public function test_it_is_idempotent(): void
    {
        $this->seed(PrepagosRoleSeeder::class);
        $this->seed(PrepagosRoleSeeder::class);

        $this->assertSame(1, Role::where('slug', 'supervisor-prepagos')->count());
        $this->assertSame(1, Role::where('slug', 'analista-prepagos')->count());
    }
}
