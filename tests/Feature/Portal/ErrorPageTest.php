<?php

namespace Tests\Feature\Portal;

use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    public function test_unknown_urls_render_the_custom_404_page(): void
    {
        $response = $this->get('/ruta-inexistente-xyz');

        $response->assertStatus(404);
        $response->assertSee('Página no encontrada');
        $response->assertSee('← Volver al inicio');
        $response->assertSee('/eurotur-logo.png');
    }
}
