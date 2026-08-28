<?php

namespace Tests\Feature\Portal;

use App\Enums\UserRole;
use App\Models\SectorGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_search_admin_page_redirects_guests_to_login(): void
    {
        $this->get(route('portal.search-admin'))->assertRedirect(route('login'));
    }

    public function test_gate_blocks_viewers_from_editing_content(): void
    {
        $viewer = User::factory()->viewer()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);

        $this->actingAs($viewer)
            ->post(route('portal.items.store', $group), [
                'label' => 'Nuevo link',
                'url' => 'https://example.com',
            ])
            ->assertForbidden();

        $this->actingAs($viewer)
            ->get(route('portal.search-admin'))
            ->assertForbidden();

        $this->actingAs($viewer)
            ->delete(route('portal.groups.destroy', $group))
            ->assertForbidden();
    }

    public function test_gate_allows_editors_and_admins(): void
    {
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);

        foreach ([UserRole::Editor, UserRole::Admin] as $role) {
            $user = User::factory()->withRole($role)->create();

            $this->actingAs($user)
                ->post(route('portal.items.store', $group), [
                    'label' => 'Nuevo link '.$role->value,
                    'url' => 'https://example.com',
                ])
                ->assertSessionHasNoErrors()
                ->assertRedirect();

            $this->actingAs($user)
                ->get(route('portal.search-admin'))
                ->assertOk();
        }
    }

    public function test_the_can_edit_prop_is_shared_per_role(): void
    {
        $viewer = User::factory()->viewer()->create();

        $this->actingAs($viewer)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page->where('canEdit', false));

        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page->where('canEdit', true));
    }
}
