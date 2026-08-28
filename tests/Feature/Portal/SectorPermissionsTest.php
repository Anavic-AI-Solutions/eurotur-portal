<?php

namespace Tests\Feature\Portal;

use App\Enums\Permission;
use App\Models\SectorGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SectorPermissionsTest extends TestCase
{
    use RefreshDatabase;

    private function rrhhEditor(): User
    {
        return User::factory()
            ->withPermissions([Permission::SectorRrhhEdit], 'rrhh-editor')
            ->create();
    }

    private function group(string $sector): SectorGroup
    {
        return SectorGroup::create(['sector' => $sector, 'title' => 'Grupo', 'sort_order' => 0]);
    }

    public function test_a_sector_editor_can_manage_groups_in_their_own_sector(): void
    {
        $user = $this->rrhhEditor();

        $this->actingAs($user)
            ->post(route('portal.groups.store', 'rrhh'), ['title' => 'Nuevo grupo'])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $group = $this->group('rrhh');

        $this->actingAs($user)
            ->put(route('portal.groups.update', $group), ['title' => 'Renombrado'])
            ->assertRedirect();

        $this->actingAs($user)
            ->delete(route('portal.groups.destroy', $group))
            ->assertRedirect();

        $this->assertDatabaseMissing('sector_groups', ['id' => $group->id]);
    }

    public function test_a_sector_editor_cannot_manage_groups_in_another_sector(): void
    {
        $user = $this->rrhhEditor();
        $group = $this->group('adm');

        $this->actingAs($user)
            ->post(route('portal.groups.store', 'adm'), ['title' => 'Nuevo grupo'])
            ->assertForbidden();

        $this->actingAs($user)
            ->put(route('portal.groups.update', $group), ['title' => 'Renombrado'])
            ->assertForbidden();

        $this->actingAs($user)
            ->delete(route('portal.groups.destroy', $group))
            ->assertForbidden();

        $this->assertDatabaseHas('sector_groups', ['id' => $group->id]);
    }

    public function test_a_sector_editor_cannot_manage_items_in_another_sector(): void
    {
        $user = $this->rrhhEditor();
        $ownGroup = $this->group('rrhh');
        $otherGroup = $this->group('adm');

        $this->actingAs($user)
            ->post(route('portal.items.store', $ownGroup), [
                'label' => 'Link propio',
                'url' => 'https://example.com',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->actingAs($user)
            ->post(route('portal.items.store', $otherGroup), [
                'label' => 'Link ajeno',
                'url' => 'https://example.com',
            ])
            ->assertForbidden();

        $foreignItem = $otherGroup->items()->create([
            'label' => 'Existente',
            'url' => 'https://example.com',
            'sort_order' => 0,
        ]);

        $this->actingAs($user)
            ->put(route('portal.items.update', $foreignItem), [
                'label' => 'Cambiado',
                'url' => 'https://example.com',
            ])
            ->assertForbidden();

        $this->actingAs($user)
            ->delete(route('portal.items.destroy', $foreignItem))
            ->assertForbidden();
    }

    public function test_content_permissions_are_scoped_to_their_own_module(): void
    {
        $user = $this->rrhhEditor();

        $this->actingAs($user)
            ->get(route('portal.search-admin'))
            ->assertForbidden();

        $this->actingAs($user)
            ->post(route('portal.frentes.store'), ['nombre' => 'Frente'])
            ->assertForbidden();
    }

    public function test_shared_permissions_let_the_page_scope_its_edit_controls(): void
    {
        $user = $this->rrhhEditor();

        $this->actingAs($user)
            ->get(route('portal.rrhh'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('canEdit', true)
                ->where('auth.permissions', [Permission::SectorRrhhEdit->value]));
    }

    public function test_admins_keep_full_access_to_every_sector(): void
    {
        $admin = User::factory()->admin()->create();
        $group = $this->group('adm');

        $this->actingAs($admin)
            ->put(route('portal.groups.update', $group), ['title' => 'Renombrado'])
            ->assertRedirect();

        $this->actingAs($admin)
            ->get(route('portal.search-admin'))
            ->assertOk();
    }
}
