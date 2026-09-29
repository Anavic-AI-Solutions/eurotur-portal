<?php

namespace Tests\Feature\Admin;

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
                'prepagos_analista_codigo' => 10,
            ])
            ->assertSessionHasErrors('prepagos_analista_codigo');
    }

    public function test_a_role_with_ver_bandeja_requires_an_analista_codigo(): void
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
                'prepagos_analista_codigo' => '',
            ])
            ->assertSessionHasErrors('prepagos_analista_codigo');
    }

    public function test_a_role_with_ver_bandeja_and_a_valid_codigo_is_saved(): void
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
                'prepagos_analista_codigo' => 4,
            ])
            ->assertSessionHasNoErrors();

        $created = User::where('email', 'valentina@eurotur.tur.ar')->firstOrFail();

        $this->assertSame(4, $created->prepagos_analista_codigo);
    }

    public function test_a_role_without_ver_bandeja_does_not_require_a_codigo(): void
    {
        $admin = User::factory()->admin()->create();
        $supervisorRole = Role::where('slug', 'supervisor-prepagos')->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Nuevo Supervisor',
                'email' => 'supervisor@eurotur.tur.ar',
                'role_id' => $supervisorRole->id,
                'password' => 'contrasena-larga',
                'password_confirmation' => 'contrasena-larga',
            ])
            ->assertSessionHasNoErrors();
    }

    public function test_a_role_without_ver_bandeja_can_still_optionally_carry_a_codigo(): void
    {
        $admin = User::factory()->admin()->create();
        $supervisorRole = Role::where('slug', 'supervisor-prepagos')->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Supervisor Mixto',
                'email' => 'supervisor-mixto@eurotur.tur.ar',
                'role_id' => $supervisorRole->id,
                'password' => 'contrasena-larga',
                'password_confirmation' => 'contrasena-larga',
                'prepagos_analista_codigo' => 7,
            ])
            ->assertSessionHasNoErrors();
    }
}
