<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// BNA billete rate closes for the day well before 18:00 in Buenos Aires;
// weekdays-only matches the daily history table (lunes a viernes).
Schedule::command('app:record-bna-daily-rate')
    ->weekdays()
    ->at('18:00')
    ->timezone('America/Argentina/Buenos_Aires');
