<?php

namespace Tests\Feature\Admin;

use App\Enums\PrepagosRole;
use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PrepagosRoleSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrepagosUserFieldsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        $this->seed(PrepagosRoleSeeder::class);
    }

    public function test_prepagos_role_is_rejected_when_the_chosen_role_lacks_the_permission(): void
    {
        $admin = User::factory()->admin()->create();
        $viewerRole = Role::where('slug', UserRole::Viewer->value)->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Nueva Persona',
                'email' => 'sin-permiso@eurotur.tur.ar',
                'role_id' => $viewerRole->id,
                'password' => 'contrasena-larga',
                'password_confirmation' => 'contrasena-larga',
                'prepagos_role' => PrepagosRole::Supervisor->value,
            ])
            ->assertSessionHasErrors('prepagos_role');
    }

    public function test_prepagos_analista_codigo_must_be_between_1_and_9(): void
    {
        $admin = User::factory()->admin()->create();
        $analistaRole = Role::where('slug', 'analista-prepagos')->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Nueva Persona',
                'email' => 'codigo-invalido@eurotur.tur.ar',
                'role_id' => $analistaRole->id,
                'password' => 'contrasena-larga',
                'password_confirmation' => 'contrasena-larga',
                'prepagos_role' => PrepagosRole::Analista->value,
                'prepagos_analista_codigo' => 10,
            ])
            ->assertSessionHasErrors('prepagos_analista_codigo');
    }

    public function test_analista_role_requires_an_analista_codigo(): void
    {
        $admin = User::factory()->admin()->create();
        $analistaRole = Role::where('slug', 'analista-prepagos')->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Nueva Persona',
                'email' => 'sin-codigo@eurotur.tur.ar',
                'role_id' => $analistaRole->id,
                'password' => 'contrasena-larga',
                'password_confirmation' => 'contrasena-larga',
                'prepagos_role' => PrepagosRole::Analista->value,
                'prepagos_analista_codigo' => '',
            ])
            ->assertSessionHasErrors('prepagos_analista_codigo');
    }

    public function test_an_analista_prepagos_with_a_valid_codigo_is_saved(): void
    {
        $admin = User::factory()->admin()->create();
        $analistaRole = Role::where('slug', 'analista-prepagos')->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Valentina Homez',
                'email' => 'valentina@eurotur.tur.ar',
                'role_id' => $analistaRole->id,
                'password' => 'contrasena-larga',
                'password_confirmation' => 'contrasena-larga',
                'prepagos_role' => PrepagosRole::Analista->value,
                'prepagos_analista_codigo' => 4,
            ])
            ->assertSessionHasNoErrors();

        $created = User::where('email', 'valentina@eurotur.tur.ar')->firstOrFail();

        $this->assertSame(PrepagosRole::Analista, $created->prepagos_role);
        $this->assertSame(4, $created->prepagos_analista_codigo);
    }

    public function test_an_admin_role_can_carry_prepagos_role_without_the_dedicated_roles(): void
    {
        $admin = User::factory()->admin()->create();
        $adminRole = Role::where('slug', UserRole::Admin->value)->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Otro Admin',
                'email' => 'otro-admin@eurotur.tur.ar',
                'role_id' => $adminRole->id,
                'password' => 'contrasena-larga',
                'password_confirmation' => 'contrasena-larga',
                'prepagos_role' => PrepagosRole::Supervisor->value,
            ])
            ->assertSessionHasNoErrors();
    }
}
