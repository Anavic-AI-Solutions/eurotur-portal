<?php

use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('administracion')->name('admin.')->group(function () {
    Route::middleware('can:users.manage')->group(function () {
        Route::resource('usuarios', UserController::class)
            ->parameters(['usuarios' => 'user'])
            ->except('show')
            ->names('users');
    });

    Route::middleware('can:roles.manage')->group(function () {
        Route::resource('roles', RoleController::class)->except('show');
    });
});
