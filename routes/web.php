<?php

use App\Http\Controllers\Internal\PrepagosSessionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// Called server-to-server by the Panel de Prepagos reverse proxy (nginx
// auth_request) — deliberately outside the 'auth' group, which redirects to
// /login (302) instead of resolving to 401. auth_request only understands
// 2xx/401/403.
Route::get('/internal/prepagos/validar-sesion', PrepagosSessionController::class)
    ->name('internal.prepagos.validar-sesion');

require __DIR__.'/admin.php';
require __DIR__.'/portal.php';
require __DIR__.'/settings.php';
