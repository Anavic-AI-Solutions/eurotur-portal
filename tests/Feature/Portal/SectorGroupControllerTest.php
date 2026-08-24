<?php

namespace Tests\Feature\Portal;

use App\Models\SectorGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SectorGroupControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_a_group(): void
    {
        $response = $this->post(route('portal.groups.store', ['sector' => 'rrhh']), [
            'title' => 'Nuevo grupo',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('sector_groups', 0);
    }

    public function test_authenticated_user_can_create_a_group(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('portal.groups.store', ['sector' => 'rrhh']), [
                'title' => 'Nuevo grupo',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $this->assertDatabaseHas('sector_groups', [
            'sector' => 'rrhh',
            'title' => 'Nuevo grupo',
        ]);
    }

    public function test_group_creation_requires_a_valid_sector(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('portal.groups.store', ['sector' => 'not-a-sector']), [
                'title' => 'Nuevo grupo',
            ]);

        $response->assertNotFound();
    }

    public function test_authenticated_user_can_update_a_group(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Original', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->put(route('portal.groups.update', $group), ['title' => 'Actualizado']);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('Actualizado', $group->refresh()->title);
    }

    public function test_authenticated_user_can_delete_a_group(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Original', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->delete(route('portal.groups.destroy', $group));

        $response->assertRedirect();
        $this->assertModelMissing($group);
    }
}
