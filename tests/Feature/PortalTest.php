<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Avoid real network calls to dolarapi.com (HandleInertiaRequests::share())
        // and euroturbot-monitor (InnovacionController) from every page visit.
        Http::fake([
            'dolarapi.com/*' => Http::response(['venta' => 1510, 'compra' => 1460]),
            'euroturbot-monitor:8000/*' => Http::response(['state' => 'idle', 'stats' => null]),
            'sudameria.com/*' => Http::response(null, 403),
        ]);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function portalRoutes(): array
    {
        return [
            'home' => ['home'],
            'rrhh' => ['portal.rrhh'],
            'institucional' => ['portal.institucional'],
            'adm' => ['portal.adm'],
            'adm.prebalance' => ['portal.adm.prebalance'],
            'adm.rendicion' => ['portal.adm.rendicion'],
            'contrataciones' => ['portal.contrataciones'],
            'operaciones' => ['portal.operaciones'],
            'producto' => ['portal.producto'],
            'customercare' => ['portal.customercare'],
            'qrated' => ['portal.qrated'],
            'sales' => ['portal.sales'],
            'traveldesigners' => ['portal.traveldesigners'],
            'it' => ['portal.it'],
            'mesa' => ['portal.mesa'],
            'responsables' => ['portal.responsables'],
            'innovacion' => ['portal.innovacion'],
            'exchange-rate' => ['portal.exchange-rate'],
            'search-admin' => ['portal.search-admin'],
        ];
    }

    #[DataProvider('portalRoutes')]
    public function test_portal_pages_are_publicly_accessible(string $routeName): void
    {
        $response = $this->get(route($routeName));

        $response->assertOk();
    }
}
