<?php

namespace Tests\Feature\Portal;

use App\Models\BnaDailyRate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BnaDailyRateControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_a_rate(): void
    {
        $response = $this->post(route('portal.bna-rates.store'), [
            'date' => '2026-08-11',
            'cash_sell' => 1530,
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('bna_daily_rates', 0);
    }

    public function test_authenticated_user_can_create_a_rate(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('portal.bna-rates.store'), [
                'date' => '2026-08-11',
                'cash_buy' => 1480,
                'cash_sell' => 1530,
                'note' => 'valor de referencia',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $this->assertDatabaseHas('bna_daily_rates', [
            'date' => '2026-08-11',
            'cash_sell' => 1530,
            'note' => 'valor de referencia',
        ]);
    }

    public function test_date_must_be_unique(): void
    {
        $user = User::factory()->create();
        BnaDailyRate::create(['date' => '2026-08-11', 'cash_sell' => 1530]);

        $response = $this
            ->actingAs($user)
            ->post(route('portal.bna-rates.store'), [
                'date' => '2026-08-11',
                'cash_sell' => 1540,
            ]);

        $response->assertSessionHasErrors('date');
        $this->assertDatabaseCount('bna_daily_rates', 1);
    }

    public function test_authenticated_user_can_update_a_rate(): void
    {
        $user = User::factory()->create();
        $rate = BnaDailyRate::create(['date' => '2026-08-11', 'cash_sell' => 1530]);

        $response = $this
            ->actingAs($user)
            ->put(route('portal.bna-rates.update', $rate), [
                'date' => '2026-08-11',
                'cash_sell' => 1545,
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('1545.0000', $rate->refresh()->cash_sell);
    }

    public function test_authenticated_user_can_delete_a_rate(): void
    {
        $user = User::factory()->create();
        $rate = BnaDailyRate::create(['date' => '2026-08-11', 'cash_sell' => 1530]);

        $response = $this
            ->actingAs($user)
            ->delete(route('portal.bna-rates.destroy', $rate));

        $response->assertRedirect();
        $this->assertModelMissing($rate);
    }
}
