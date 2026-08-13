<?php

namespace App\Console\Commands;

use App\Models\BnaDailyRate;
use App\Services\DolarOficialService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:record-bna-daily-rate')]
#[Description('Record today\'s BNA buy/sell rate into the daily history table')]
class RecordBnaDailyRate extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(DolarOficialService $official): int
    {
        $rates = $official->rates();

        if ($rates === null) {
            $this->error('No se pudo obtener la cotización de dolarapi.com — no se guardó nada.');

            return self::FAILURE;
        }

        BnaDailyRate::query()->updateOrCreate(
            ['date' => today()->toDateString()],
            ['cash_buy' => $rates['compra'], 'cash_sell' => $rates['venta']],
        );

        $this->info("Guardado {$rates['compra']} / {$rates['venta']} para ".today()->toDateString());

        return self::SUCCESS;
    }
}
