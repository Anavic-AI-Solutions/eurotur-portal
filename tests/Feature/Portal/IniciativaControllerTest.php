<?php

namespace Tests\Feature\Portal;

use App\Models\Frente;
use App\Models\Iniciativa;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class IniciativaControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_an_iniciativa(): void
    {
        $frente = Frente::create(['area' => 'Frente', 'sort_order' => 0]);

        $response = $this->post(route('portal.iniciativas.store', $frente), [
            'n' => 'Nueva iniciativa',
            'badge' => 'Producción',
            'cls' => 'prod',
            'desc' => 'Descripción',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('iniciativas', 0);
    }

    public function test_authenticated_user_can_create_an_iniciativa(): void
    {
        $user = User::factory()->admin()->create();
        $frente = Frente::create(['area' => 'Frente', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.iniciativas.store', $frente), [
                'n' => 'Nueva iniciativa',
                'badge' => 'Producción',
                'cls' => 'prod',
                'desc' => 'Descripción',
                'url' => 'https://example.com',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $this->assertDatabaseHas('iniciativas', [
            'frente_id' => $frente->id,
            'n' => 'Nueva iniciativa',
            'cls' => 'prod',
            'url' => 'https://example.com',
        ]);
    }

    public function test_authenticated_user_can_create_an_iniciativa_with_an_uploaded_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->admin()->create();
        $frente = Frente::create(['area' => 'Frente', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.iniciativas.store', $frente), [
                'n' => 'Nueva iniciativa',
                'badge' => 'Producción',
                'cls' => 'prod',
                'desc' => 'Descripción',
                'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $iniciativa = Iniciativa::where('n', 'Nueva iniciativa')->firstOrFail();
        $this->assertNotNull($iniciativa->file_path);
        Storage::disk('public')->assertExists($iniciativa->file_path);
    }

    public function test_cls_must_be_a_known_value(): void
    {
        $user = User::factory()->admin()->create();
        $frente = Frente::create(['area' => 'Frente', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.iniciativas.store', $frente), [
                'n' => 'Nueva iniciativa',
                'badge' => 'Producción',
                'cls' => 'not-a-class',
                'desc' => 'Descripción',
            ]);

        $response->assertSessionHasErrors('cls');
    }

    public function test_iniciativa_cannot_have_both_url_and_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->admin()->create();
        $frente = Frente::create(['area' => 'Frente', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.iniciativas.store', $frente), [
                'n' => 'Nueva iniciativa',
                'badge' => 'Producción',
                'cls' => 'prod',
                'desc' => 'Descripción',
                'url' => 'https://example.com',
                'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
            ]);

        $response->assertSessionHasErrors(['url', 'file']);
    }

    public function test_authenticated_user_can_update_an_iniciativa(): void
    {
        $user = User::factory()->admin()->create();
        $frente = Frente::create(['area' => 'Frente', 'sort_order' => 0]);
        $iniciativa = $frente->iniciativas()->create([
            'n' => 'Original', 'badge' => 'Producción', 'cls' => 'prod', 'desc' => 'Desc', 'sort_order' => 0,
        ]);

        $response = $this
            ->actingAs($user)
            ->put(route('portal.iniciativas.update', $iniciativa), [
                'n' => 'Actualizada',
                'badge' => 'Desarrollo',
                'cls' => 'dev',
                'desc' => 'Desc actualizada',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $iniciativa->refresh();
        $this->assertSame('Actualizada', $iniciativa->n);
        $this->assertSame('dev', $iniciativa->cls);
    }

    public function test_authenticated_user_can_delete_an_iniciativa(): void
    {
        $user = User::factory()->admin()->create();
        $frente = Frente::create(['area' => 'Frente', 'sort_order' => 0]);
        $iniciativa = $frente->iniciativas()->create([
            'n' => 'Original', 'badge' => 'Producción', 'cls' => 'prod', 'desc' => 'Desc', 'sort_order' => 0,
        ]);

        $response = $this
            ->actingAs($user)
            ->delete(route('portal.iniciativas.destroy', $iniciativa));

        $response->assertRedirect();
        $this->assertModelMissing($iniciativa);
    }
}
