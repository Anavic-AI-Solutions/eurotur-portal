<?php

namespace Tests\Feature\Internal;

use App\Enums\PrepagosRole;
use App\Models\Permission;
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
        $user = User::factory()->viewer()->create([
            'prepagos_role' => PrepagosRole::Analista,
            'prepagos_analista_codigo' => 2,
        ]);

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertStatus(401);
    }

    public function test_users_with_the_permission_but_no_prepagos_role_are_unauthorized(): void
    {
        $user = User::factory()->withRole($this->prepagosRole())->create([
            'prepagos_role' => null,
        ]);

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertStatus(401);
    }

    public function test_an_analista_gets_the_identity_headers(): void
    {
        $user = User::factory()->withRole($this->prepagosRole())->create([
            'name' => 'Valentina Homez',
            'prepagos_role' => PrepagosRole::Analista,
            'prepagos_analista_codigo' => 2,
        ]);

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertOk()
            ->assertHeader('X-Portal-Usuario', 'Valentina Homez')
            ->assertHeader('X-Portal-Rol', 'ANALISTA')
            ->assertHeader('X-Portal-Analista-Codigo', '2');
    }

    public function test_a_supervisor_without_an_analista_codigo_gets_an_empty_header(): void
    {
        $user = User::factory()->withRole($this->prepagosRole())->create([
            'prepagos_role' => PrepagosRole::Supervisor,
            'prepagos_analista_codigo' => null,
        ]);

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertOk()
            ->assertHeader('X-Portal-Rol', 'SUPERVISOR')
            ->assertHeader('X-Portal-Analista-Codigo', '');
    }

    public function test_a_user_with_the_seeded_analista_prepagos_role_gets_the_identity_headers(): void
    {
        $this->seed(PrepagosRoleSeeder::class);

        $analistaRole = Role::where('slug', 'analista-prepagos')->firstOrFail();

        $user = User::factory()->withRole($analistaRole)->create([
            'name' => 'Christian Peñaloza',
            'prepagos_role' => PrepagosRole::Analista,
            'prepagos_analista_codigo' => 4,
        ]);

        $this->actingAs($user)
            ->get(route('internal.prepagos.validar-sesion'))
            ->assertOk()
            // ASCII-folded: raw UTF-8 in an HTTP header gets mangled by the
            // panel's Python/Tornado stack, which decodes headers as Latin-1.
            ->assertHeader('X-Portal-Usuario', 'Christian Penaloza')
            ->assertHeader('X-Portal-Rol', 'ANALISTA')
            ->assertHeader('X-Portal-Analista-Codigo', '4');
    }

    private function prepagosRole(): Role
    {
        $role = Role::create(['slug' => 'prepagos-only', 'name' => 'Prepagos Only']);
        $role->permissions()->sync(Permission::whereIn('slug', ['prepagos.manage'])->pluck('id'));
        $role->flushPermissionCache();

        return $role;
    }
}
