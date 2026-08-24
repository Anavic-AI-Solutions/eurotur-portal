<?php

namespace Tests\Feature\Portal;

use App\Models\SearchSynonymTerm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchSynonymTermControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_a_term(): void
    {
        $response = $this->post(route('portal.search-synonym-terms.store'), [
            'group_number' => 1,
            'term' => 'factura',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('search_synonym_terms', 0);
    }

    public function test_authenticated_user_can_add_a_term_to_an_existing_group(): void
    {
        $user = User::factory()->admin()->create();
        SearchSynonymTerm::create(['group_number' => 1, 'term' => 'factura']);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.search-synonym-terms.store'), [
                'group_number' => 1,
                'term' => 'comprobante',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertDatabaseHas('search_synonym_terms', ['group_number' => 1, 'term' => 'comprobante']);
    }

    public function test_authenticated_user_can_create_a_new_group(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('portal.search-synonym-terms.store'), [
                'group_number' => 112,
                'term' => 'nuevo termino',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertDatabaseHas('search_synonym_terms', ['group_number' => 112, 'term' => 'nuevo termino']);
    }

    public function test_term_must_be_unique_within_its_group(): void
    {
        $user = User::factory()->admin()->create();
        SearchSynonymTerm::create(['group_number' => 1, 'term' => 'factura']);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.search-synonym-terms.store'), [
                'group_number' => 1,
                'term' => 'factura',
            ]);

        $response->assertSessionHasErrors('term');
        $this->assertDatabaseCount('search_synonym_terms', 1);
    }

    public function test_the_same_term_can_exist_in_different_groups(): void
    {
        $user = User::factory()->admin()->create();
        SearchSynonymTerm::create(['group_number' => 1, 'term' => 'pago']);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.search-synonym-terms.store'), [
                'group_number' => 2,
                'term' => 'pago',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertDatabaseCount('search_synonym_terms', 2);
    }

    public function test_authenticated_user_can_delete_a_term(): void
    {
        $user = User::factory()->admin()->create();
        $term = SearchSynonymTerm::create(['group_number' => 1, 'term' => 'factura']);

        $response = $this
            ->actingAs($user)
            ->delete(route('portal.search-synonym-terms.destroy', $term));

        $response->assertRedirect();
        $this->assertModelMissing($term);
    }
}
