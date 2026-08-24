<?php

namespace Tests\Feature\Portal;

use App\Models\Frente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FrenteControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_a_frente(): void
    {
        $response = $this->post(route('portal.frentes.store'), [
            'area' => 'Nuevo frente',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('frentes', 0);
    }

    public function test_authenticated_user_can_create_a_frente(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('portal.frentes.store'), [
                'area' => 'Nuevo frente',
                'owner' => 'J. Pérez',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $this->assertDatabaseHas('frentes', [
            'area' => 'Nuevo frente',
            'owner' => 'J. Pérez',
        ]);
    }

    public function test_new_frente_gets_the_next_sort_order(): void
    {
        $user = User::factory()->admin()->create();
        Frente::create(['area' => 'Existente', 'sort_order' => 3]);

        $this->actingAs($user)->post(route('portal.frentes.store'), [
            'area' => 'Nuevo frente',
        ]);

        $this->assertDatabaseHas('frentes', [
            'area' => 'Nuevo frente',
            'sort_order' => 4,
        ]);
    }

    public function test_authenticated_user_can_update_a_frente(): void
    {
        $user = User::factory()->admin()->create();
        $frente = Frente::create(['area' => 'Original', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->put(route('portal.frentes.update', $frente), ['area' => 'Actualizado']);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('Actualizado', $frente->refresh()->area);
    }

    public function test_authenticated_user_can_delete_a_frente(): void
    {
        $user = User::factory()->admin()->create();
        $frente = Frente::create(['area' => 'Original', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->delete(route('portal.frentes.destroy', $frente));

        $response->assertRedirect();
        $this->assertModelMissing($frente);
    }
}
