<?php

namespace Tests\Feature\Portal;

use App\Models\SearchStaticEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchStaticEntryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_an_entry(): void
    {
        $response = $this->post(route('portal.search-static-entries.store'), [
            'title' => 'Mesa de Información',
            'url' => '/mesa',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('search_static_entries', 0);
    }

    public function test_authenticated_user_can_create_an_entry(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('portal.search-static-entries.store'), [
                'title' => 'Mesa de Información',
                'url' => '/mesa',
                'keywords' => 'ayuda, faq, wifi',
                'sector_label' => 'Mesa de Información',
                'sector_href' => '/mesa',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $this->assertDatabaseHas('search_static_entries', [
            'title' => 'Mesa de Información',
            'url' => '/mesa',
            'keywords' => 'ayuda, faq, wifi',
        ]);
    }

    public function test_url_must_be_unique(): void
    {
        $user = User::factory()->create();
        SearchStaticEntry::create(['title' => 'Mesa', 'url' => '/mesa']);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.search-static-entries.store'), [
                'title' => 'Otra',
                'url' => '/mesa',
            ]);

        $response->assertSessionHasErrors('url');
        $this->assertDatabaseCount('search_static_entries', 1);
    }

    public function test_authenticated_user_can_update_an_entry(): void
    {
        $user = User::factory()->create();
        $entry = SearchStaticEntry::create(['title' => 'Mesa', 'url' => '/mesa']);

        $response = $this
            ->actingAs($user)
            ->put(route('portal.search-static-entries.update', $entry), [
                'title' => 'Mesa de Información',
                'url' => '/mesa',
                'keywords' => 'ayuda',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('Mesa de Información', $entry->refresh()->title);
        $this->assertSame('ayuda', $entry->keywords);
    }

    public function test_authenticated_user_can_delete_an_entry(): void
    {
        $user = User::factory()->create();
        $entry = SearchStaticEntry::create(['title' => 'Mesa', 'url' => '/mesa']);

        $response = $this
            ->actingAs($user)
            ->delete(route('portal.search-static-entries.destroy', $entry));

        $response->assertRedirect();
        $this->assertModelMissing($entry);
    }
}
