<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('admin.users.index'))->assertRedirect(route('login'));
    }

    public function test_users_without_the_permission_are_forbidden(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get(route('admin.users.index'))->assertForbidden();
        $this->actingAs($editor)->get(route('admin.users.create'))->assertForbidden();
    }

    public function test_an_admin_sees_the_user_list(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->viewer()->create(['name' => 'Zulema']);

        $this->actingAs($admin)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/users/index')
                ->where('users.data.1.email', $other->email)
                ->where('users.data.1.role.slug', UserRole::Viewer->value));
    }

    public function test_an_admin_creates_a_user_with_a_role(): void
    {
        $admin = User::factory()->admin()->create();
        $role = Role::where('slug', UserRole::Editor->value)->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Nueva Persona',
                'email' => 'nueva@eurotur.tur.ar',
                'role_id' => $role->id,
                'password' => 'contrasena-larga',
                'password_confirmation' => 'contrasena-larga',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.users.index'));

        $created = User::where('email', 'nueva@eurotur.tur.ar')->firstOrFail();

        $this->assertSame($role->id, $created->role_id);
        $this->assertTrue($created->canEditPortal());
    }

    public function test_an_admin_changes_a_user_role_without_touching_the_password(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->viewer()->create();
        $original = $user->password;
        $role = Role::where('slug', UserRole::Editor->value)->firstOrFail();

        $this->actingAs($admin)
            ->put(route('admin.users.update', $user), [
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $role->id,
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.users.index'));

        $user->refresh();

        $this->assertSame($role->id, $user->role_id);
        $this->assertSame($original, $user->password);
    }

    public function test_an_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->delete(route('admin.users.destroy', $admin))
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_an_admin_deletes_another_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->viewer()->create();

        $this->actingAs($admin)
            ->delete(route('admin.users.destroy', $user))
            ->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_the_email_must_be_unique_across_other_users(): void
    {
        $admin = User::factory()->admin()->create();
        $taken = User::factory()->viewer()->create();
        $user = User::factory()->viewer()->create();

        $this->actingAs($admin)
            ->put(route('admin.users.update', $user), [
                'name' => $user->name,
                'email' => $taken->email,
                'role_id' => $user->role_id,
            ])
            ->assertSessionHasErrors('email');
    }
}
