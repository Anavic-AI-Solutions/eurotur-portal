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

    public function test_it_creates_both_roles_scoped_to_exactly_prepagos_manage(): void
    {
        $this->seed(PrepagosRoleSeeder::class);

        foreach (['supervisor-prepagos' => 'Supervisor', 'analista-prepagos' => 'Analista'] as $slug => $name) {
            $role = Role::where('slug', $slug)->firstOrFail();

            $this->assertSame($name, $role->name);
            $this->assertTrue($role->is_system);
            $this->assertSame([Permission::PrepagosManage->value], $role->permissionSlugs());
        }
    }

    public function test_it_is_idempotent(): void
    {
        $this->seed(PrepagosRoleSeeder::class);
        $this->seed(PrepagosRoleSeeder::class);

        $this->assertSame(1, Role::where('slug', 'supervisor-prepagos')->count());
        $this->assertSame(1, Role::where('slug', 'analista-prepagos')->count());
    }
}
