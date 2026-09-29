<?php

namespace Tests\Feature\Internal;

use App\Enums\Permission;
use App\Models\Permission as PermissionModel;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PrepagosRoleSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrepagosSessionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_guests_are_unauthorized(): void
    {
        $this->get(route('internal.prepagos.validar-sesion'))
            ->assertStatus(401)
            ->assertHeaderMissing('X-Portal-Usuario');
    }

    public function test_users_without_the_permission_are_unauthorized(): void
    {
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertStatus(401);
    }

    public function test_a_role_with_all_three_vistas_gets_them_all(): void
    {
        $role = $this->roleWithPermissions('Coordinacion Total', [
            Permission::PrepagosManage,
            Permission::PrepagosVerCoordinacion,
            Permission::PrepagosVerControl,
            Permission::PrepagosVerBandeja,
        ]);

        $user = User::factory()->withRole($role)->create(['name' => 'Beatriz Flores']);

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertOk()
            ->assertHeader('X-Portal-Usuario', 'Beatriz Flores')
            ->assertHeader('X-Portal-Vistas', 'coordinacion,control,bandeja')
            ->assertHeader('X-Portal-Rol', 'Coordinacion Total');
    }

    public function test_a_role_with_only_bandeja_gets_just_that_vista_and_the_codigo(): void
    {
        $this->seed(PrepagosRoleSeeder::class);

        $analistaRole = Role::where('slug', 'analista-prepagos')->firstOrFail();

        $user = User::factory()->withRole($analistaRole)->create([
            'name' => 'Christian Peñaloza',
            'prepagos_analista_codigo' => 4,
        ]);

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertOk()
            // ASCII-folded: raw UTF-8 in an HTTP header gets mangled by the
            // panel's Python/Tornado stack, which decodes headers as Latin-1.
            ->assertHeader('X-Portal-Usuario', 'Christian Penaloza')
            ->assertHeader('X-Portal-Vistas', 'bandeja')
            ->assertHeader('X-Portal-Rol', 'Analista')
            ->assertHeader('X-Portal-Analista-Codigo', '4');
    }

    public function test_a_role_with_manage_but_no_vistas_gets_an_empty_vistas_header(): void
    {
        $role = $this->roleWithPermissions('Solo Entrada', [Permission::PrepagosManage]);

        $user = User::factory()->withRole($role)->create();

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertOk()
            ->assertHeader('X-Portal-Vistas', '')
            ->assertHeader('X-Portal-Analista-Codigo', '');
    }

    public function test_x_portal_rol_is_ascii_folded(): void
    {
        $role = $this->roleWithPermissions('Días Supervisión', [
            Permission::PrepagosManage,
            Permission::PrepagosVerControl,
        ]);

        $user = User::factory()->withRole($role)->create();

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertOk()
            ->assertHeader('X-Portal-Rol', 'Dias Supervision');
    }

    private function roleWithPermissions(string $name, array $permissions): Role
    {
        $role = Role::create(['slug' => str($name)->slug(), 'name' => $name]);

        $role->permissions()->sync(
            PermissionModel::whereIn('slug', array_map(fn (Permission $permission): string => $permission->value, $permissions))->pluck('id'),
        );

        $role->flushPermissionCache();

        return $role;
    }
}
