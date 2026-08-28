<?php

namespace Tests\Feature\Auth;

use App\Enums\Permission as PermissionEnum;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionResolutionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admins_pass_every_gate_without_pivot_rows(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->role->permissions()->detach();
        $admin->role->flushPermissionCache();

        foreach (PermissionEnum::cases() as $permission) {
            $this->assertTrue($admin->can($permission->value), $permission->value);
        }

        $this->assertTrue($admin->canEditPortal());
    }

    public function test_admins_receive_the_full_catalogue_in_shared_props(): void
    {
        $admin = User::factory()->admin()->create();

        $this->assertSame(PermissionEnum::values(), $admin->permissionSlugs());
    }

    public function test_editors_hold_content_permissions_but_not_administration(): void
    {
        $editor = User::factory()->editor()->create();

        $this->assertTrue($editor->can(PermissionEnum::SectorRrhhEdit->value));
        $this->assertTrue($editor->can(PermissionEnum::SearchAdmin->value));
        $this->assertFalse($editor->can(PermissionEnum::UsersManage->value));
        $this->assertFalse($editor->can(PermissionEnum::RolesManage->value));
    }

    public function test_viewers_hold_no_permissions(): void
    {
        $viewer = User::factory()->viewer()->create();

        $this->assertSame([], $viewer->permissionSlugs());
        $this->assertFalse($viewer->canEditPortal());
    }

    public function test_a_user_can_hold_a_single_sector_permission(): void
    {
        $user = User::factory()
            ->withPermissions([PermissionEnum::SectorRrhhEdit], 'rrhh-editor')
            ->create();

        $this->assertTrue($user->can(PermissionEnum::SectorRrhhEdit->value));
        $this->assertFalse($user->can(PermissionEnum::SectorAdmEdit->value));
        $this->assertTrue($user->canEditPortal(), 'One content permission is enough for the legacy gate.');
    }

    public function test_the_permission_cache_is_dropped_when_the_pivot_is_synced(): void
    {
        $user = User::factory()->viewer()->create();

        $this->assertFalse($user->can(PermissionEnum::SectorRrhhEdit->value));

        $role = $user->role;
        $role->permissions()->sync(
            Permission::where('slug', PermissionEnum::SectorRrhhEdit->value)->pluck('id'),
        );
        $role->flushPermissionCache();

        $this->assertTrue($user->fresh()->can(PermissionEnum::SectorRrhhEdit->value));
    }

    public function test_the_seeder_keeps_the_permissions_table_in_sync(): void
    {
        Permission::create(['slug' => 'stale.permission', 'name' => 'Obsoleto', 'group' => 'contenido']);

        $this->seed(RolePermissionSeeder::class);

        $this->assertDatabaseMissing('permissions', ['slug' => 'stale.permission']);
        $this->assertSame(count(PermissionEnum::cases()), Permission::count());
        $this->assertSame(3, Role::where('is_system', true)->count());
    }
}
