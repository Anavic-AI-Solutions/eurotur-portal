<?php

namespace Tests\Feature\Admin;

use App\Enums\Permission as PermissionEnum;
use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_users_without_the_permission_are_forbidden(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get(route('admin.roles.index'))->assertForbidden();
    }

    public function test_the_edit_page_exposes_the_grouped_matrix(): void
    {
        $admin = User::factory()->admin()->create();
        $editorRole = Role::where('slug', UserRole::Editor->value)->firstOrFail();

        $this->actingAs($admin)
            ->get(route('admin.roles.edit', $editorRole))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/roles/edit')
                ->where('locked', false)
                ->where('permissionGroups.0.key', 'sectores')
                ->has('role.permissions', count(PermissionEnum::contentPermissions())));
    }

    public function test_the_admin_role_matrix_is_locked(): void
    {
        $admin = User::factory()->admin()->create();
        $adminRole = Role::where('slug', UserRole::Admin->value)->firstOrFail();

        $this->actingAs($admin)
            ->get(route('admin.roles.edit', $adminRole))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('locked', true));

        $this->actingAs($admin)
            ->put(route('admin.roles.update', $adminRole), [
                'name' => 'Administrador',
                'permissions' => [],
            ])
            ->assertRedirect(route('admin.roles.index'));

        $this->assertNotEmpty($adminRole->fresh()->permissionSlugs());
    }

    public function test_syncing_the_matrix_takes_effect_on_the_next_request(): void
    {
        $admin = User::factory()->admin()->create();
        $viewerRole = Role::where('slug', UserRole::Viewer->value)->firstOrFail();
        $viewer = User::factory()->withRole($viewerRole)->create();

        $this->assertFalse($viewer->can(PermissionEnum::SectorRrhhEdit->value));

        $this->actingAs($admin)
            ->put(route('admin.roles.update', $viewerRole), [
                'name' => 'Visitante',
                'permissions' => [PermissionEnum::SectorRrhhEdit->value],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.roles.index'));

        $this->assertTrue($viewer->fresh()->can(PermissionEnum::SectorRrhhEdit->value));
    }

    public function test_an_admin_creates_a_custom_role(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.roles.store'), [
                'name' => 'Editor de RRHH',
                'description' => 'Solo el sector de RRHH',
                'permissions' => [PermissionEnum::SectorRrhhEdit->value],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.roles.index'));

        $role = Role::where('slug', 'editor-de-rrhh')->firstOrFail();

        $this->assertFalse($role->is_system);
        $this->assertSame([PermissionEnum::SectorRrhhEdit->value], $role->permissionSlugs());
    }

    public function test_unknown_permission_slugs_are_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.roles.store'), [
                'name' => 'Rol inválido',
                'permissions' => ['sector.inexistente.edit'],
            ])
            ->assertSessionHasErrors('permissions.0');
    }

    public function test_system_roles_cannot_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $viewerRole = Role::where('slug', UserRole::Viewer->value)->firstOrFail();

        $this->actingAs($admin)
            ->delete(route('admin.roles.destroy', $viewerRole))
            ->assertForbidden();

        $this->assertDatabaseHas('roles', ['id' => $viewerRole->id]);
    }

    public function test_a_role_with_users_cannot_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $role = Role::create(['slug' => 'temporal', 'name' => 'Temporal']);
        User::factory()->withRole($role)->create();

        $this->actingAs($admin)
            ->delete(route('admin.roles.destroy', $role))
            ->assertForbidden();
    }

    public function test_an_empty_custom_role_can_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $role = Role::create(['slug' => 'temporal', 'name' => 'Temporal']);

        $this->actingAs($admin)
            ->delete(route('admin.roles.destroy', $role))
            ->assertRedirect(route('admin.roles.index'));

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }
}
