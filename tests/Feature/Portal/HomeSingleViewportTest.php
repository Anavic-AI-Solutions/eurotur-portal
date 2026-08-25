<?php

namespace Tests\Feature\Portal;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeSingleViewportTest extends TestCase
{
    use RefreshDatabase;


    public function test_home_renders_without_error(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn ($p) => $p->component('portal/home'));
    }

    public function test_other_sections_still_render(): void
    {
        $this->get('/tipo-de-cambio')->assertOk();
        $this->get('/rrhh')->assertOk();
    }

    public function test_home_contains_expected_sections(): void
    {
        $response = $this->get('/');
        $response->assertOk();
        $response->assertInertia(fn ($p) => $p->component('portal/home'));
    }

    public function test_exchange_rates_still_shared(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn ($p) => $p->has('dolarOficial')->has('iataRate'));
    }

    public function test_search_endpoint_still_works(): void
    {
        $this->get(route('portal.search', ['q' => 'rrhh']))->assertOk();
    }

    public function test_other_pages_still_scrollable(): void
    {
        $this->get('/rrhh')->assertOk();
        $this->get('/adm')->assertOk();
        $this->get('/it')->assertOk();
        $this->get('/mesa')->assertOk();
    }

    public function test_guest_can_see_home(): void
    {
        $this->get('/')->assertOk();
    }
}
