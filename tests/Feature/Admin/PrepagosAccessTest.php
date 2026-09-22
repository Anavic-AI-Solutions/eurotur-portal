<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrepagosAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_users_without_the_permission_are_forbidden(): void
    {
        $viewer = User::factory()->viewer()->create();

        $this->actingAs($viewer)->get(route('admin.prepagos'))->assertForbidden();
    }

    public function test_editors_without_the_permission_are_also_forbidden(): void
    {
        // prepagos.manage is not part of contentPermissions(), so the Editor
        // role (which grants those) must not get it for free.
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get(route('admin.prepagos'))->assertForbidden();
    }

    public function test_admins_are_redirected_to_the_external_url(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.prepagos'))
            ->assertRedirect(config('services.prepagos.url'));
    }
}
