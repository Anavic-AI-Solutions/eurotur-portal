<?php

namespace Tests\Feature\Portal;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Testing\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ReceiptOcrControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_use_the_endpoint(): void
    {
        // La rendición de gastos es de uso general (cualquier empleado, no
        // solo quienes tienen cuenta en el portal) — a diferencia de
        // "Buscador" y los CRUD de administración, este endpoint no exige
        // sesión. El único freno contra abuso es el throttle de la ruta.
        Http::fake([
            '*/extract-receipt' => Http::response(['confidence' => 0, 'mensajes' => []]),
        ]);

        $response = $this->post(route('portal.rendicion-gastos.ocr'), [
            'image' => UploadedFile::fake()->image('comprobante.jpg'),
        ]);

        $response->assertOk();
    }

    public function test_authenticated_user_gets_the_fields_read_by_the_microservice(): void
    {
        $user = User::factory()->create();

        Http::fake([
            '*/extract-receipt' => Http::response([
                'tipo_documento' => 'FACTURA',
                'legibilidad' => 'BUENA',
                'moneda_tipo' => 'ARS',
                'fecha' => '2026-08-14',
                'proveedor' => 'Acme SRL',
                'cuit' => '20345678901',
                'letra_factura' => 'A',
                'talonario' => '0001',
                'numero_comprobante' => '00012345',
                'importe_neto' => 15000.5,
                'importe_total' => 18150.5,
                'iva_27' => 0,
                'iva_21' => 3150.0,
                'iva_105' => 0,
                'percepcion_iva' => 0,
                'percepcion_iibb_caba' => 0,
                'percepcion_iibb_sc' => 0,
                'percepcion_iibb_tdf' => 0,
                'moneda_iso' => null,
                'importe_original' => null,
                'confidence' => 0.92,
                'raw_text' => 'ACME SRL FACTURA A 0001-00012345 ...',
                'estado_lectura' => 'ALTA',
                'campos_faltantes' => [],
                'mensajes' => [],
            ]),
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.rendicion-gastos.ocr'), [
                'image' => UploadedFile::fake()->image('comprobante.jpg'),
            ]);

        $response->assertOk();
        $response->assertJsonPath('proveedor', 'Acme SRL');
        $response->assertJsonPath('cuit', '20345678901');
        $response->assertJsonPath('estado_lectura', 'ALTA');

        Http::assertSent(fn ($request) => $request->hasHeader('X-API-Key') && str_contains((string) $request->url(), '/extract-receipt'));
    }

    public function test_it_rejects_files_that_are_not_images(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('portal.rendicion-gastos.ocr'), [
                'image' => File::create('comprobante.pdf', 10),
            ]);

        $response->assertSessionHasErrors('image');
    }

    public function test_it_returns_a_bad_gateway_when_the_microservice_is_unreachable(): void
    {
        $user = User::factory()->create();

        Http::fake([
            '*/extract-receipt' => Http::response(null, 500),
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.rendicion-gastos.ocr'), [
                'image' => UploadedFile::fake()->image('comprobante.jpg'),
            ]);

        $response->assertStatus(502);
        $response->assertJsonStructure(['message']);
    }
}
