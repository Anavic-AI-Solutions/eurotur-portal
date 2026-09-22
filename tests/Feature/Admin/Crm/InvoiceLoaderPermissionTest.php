<?php

namespace Tests\Feature\Admin\Crm;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceLoaderPermissionTest extends TestCase
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

        $this->actingAs($viewer)->get(route('admin.crm.index'))->assertForbidden();
        $this->actingAs($viewer)->get(route('admin.crm.invoice-loader.index'))->assertForbidden();
        $this->actingAs($viewer)->post(route('admin.crm.invoice-loader.proposals.store'))->assertForbidden();
    }

    public function test_editors_without_the_permission_are_also_forbidden(): void
    {
        // invoice-loader.manage is not part of contentPermissions(), so the
        // Editor role (which grants those) must not get it for free.
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get(route('admin.crm.index'))->assertForbidden();
    }

    public function test_admins_can_access_the_crm_pages(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.crm.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/crm/index'));

        $this->actingAs($admin)
            ->get(route('admin.crm.invoice-loader.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/crm/invoice-loader/index'));
    }

    public function test_a_user_with_only_prepagos_permission_sees_the_hub_but_not_invoice_loader(): void
    {
        $role = Role::create(['slug' => 'prepagos-only', 'name' => 'Prepagos Only']);
        $role->permissions()->sync(Permission::whereIn('slug', ['prepagos.manage'])->pluck('id'));
        $role->flushPermissionCache();
        $user = User::factory()->withRole($role)->create();

        $this->actingAs($user)
            ->get(route('admin.crm.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/crm/index'));

        $this->actingAs($user)->get(route('admin.crm.invoice-loader.index'))->assertForbidden();
    }
}
