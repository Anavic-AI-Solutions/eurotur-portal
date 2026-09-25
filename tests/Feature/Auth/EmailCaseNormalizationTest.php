<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailCaseNormalizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_email_is_stored_lowercase(): void
    {
        $user = User::factory()->create(['email' => 'Beatriz.Flores@eurotur.tur.ar']);

        $this->assertSame('beatriz.flores@eurotur.tur.ar', $user->fresh()->email);
    }

    public function test_admin_creation_normalizes_uppercase_email(): void
    {
        $admin = User::factory()->admin()->create();
        $role = Role::where('slug', UserRole::Viewer->value)->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Beatriz Flores',
                'email' => 'Beatriz.Flores@eurotur.tur.ar',
                'role_id' => $role->id,
                'password' => 'contrasena-larga',
                'password_confirmation' => 'contrasena-larga',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', ['email' => 'beatriz.flores@eurotur.tur.ar']);
        $this->assertDatabaseMissing('users', ['email' => 'Beatriz.Flores@eurotur.tur.ar']);
    }

    public function test_user_created_with_uppercase_email_can_log_in_with_lowercase(): void
    {
        User::factory()->create(['email' => 'Beatriz.Flores@eurotur.tur.ar']);

        $response = $this->post(route('login.store'), [
            'email' => 'beatriz.flores@eurotur.tur.ar',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('home', absolute: false));
    }
}
