<?php

namespace Tests\Feature\Portal;

use App\Models\SectorGroup;
use App\Models\SectorItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SectorItemControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_an_item(): void
    {
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);

        $response = $this->post(route('portal.items.store', $group), [
            'label' => 'Nuevo link',
            'url' => 'https://example.com',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('sector_items', 0);
    }

    public function test_authenticated_user_can_create_an_item_with_url(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.items.store', $group), [
                'label' => 'Nuevo link',
                'url' => 'https://example.com',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $this->assertDatabaseHas('sector_items', [
            'sector_group_id' => $group->id,
            'label' => 'Nuevo link',
            'url' => 'https://example.com',
        ]);
    }

    public function test_authenticated_user_can_create_an_item_with_an_uploaded_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.items.store', $group), [
                'label' => 'Documento',
                'file' => UploadedFile::fake()->create('documento.pdf', 100, 'application/pdf'),
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $item = SectorItem::where('label', 'Documento')->firstOrFail();
        $this->assertNotNull($item->file_path);
        Storage::disk('public')->assertExists($item->file_path);
    }

    public function test_item_cannot_have_both_url_and_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.items.store', $group), [
                'label' => 'Documento',
                'url' => 'https://example.com',
                'file' => UploadedFile::fake()->create('documento.pdf', 100, 'application/pdf'),
            ]);

        $response->assertSessionHasErrors(['url', 'file']);
    }

    public function test_authenticated_user_can_update_an_item(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);
        $item = $group->items()->create(['label' => 'Original', 'url' => 'https://example.com', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->put(route('portal.items.update', $item), ['label' => 'Actualizado']);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('Actualizado', $item->refresh()->label);
    }

    public function test_authenticated_user_can_update_an_items_keywords(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);
        $item = $group->items()->create(['label' => 'Original', 'url' => 'https://example.com', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->put(route('portal.items.update', $item), [
                'label' => 'Original',
                'keywords' => 'factura, comprobante',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('factura, comprobante', $item->refresh()->keywords);
    }

    public function test_updating_an_item_without_keywords_in_the_request_leaves_them_unchanged(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);
        $item = $group->items()->create([
            'label' => 'Original',
            'url' => 'https://example.com',
            'keywords' => 'factura',
            'sort_order' => 0,
        ]);

        $response = $this
            ->actingAs($user)
            ->put(route('portal.items.update', $item), ['label' => 'Actualizado']);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('factura', $item->refresh()->keywords);
    }

    public function test_authenticated_user_can_delete_an_item(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);
        $item = $group->items()->create(['label' => 'Original', 'url' => 'https://example.com', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->delete(route('portal.items.destroy', $item));

        $response->assertRedirect();
        $this->assertModelMissing($item);
    }

    public function test_deleting_an_item_removes_its_uploaded_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Grupo', 'sort_order' => 0]);
        $path = UploadedFile::fake()->create('documento.pdf')->store('sector-links', 'public');
        $item = $group->items()->create(['label' => 'Documento', 'file_path' => $path, 'sort_order' => 0]);

        $this->actingAs($user)->delete(route('portal.items.destroy', $item));

        Storage::disk('public')->assertMissing($path);
    }
}
