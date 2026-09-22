<?php

use App\Http\Controllers\Admin\Crm\CrmIndexController;
use App\Http\Controllers\Admin\Crm\InvoiceExecutionController;
use App\Http\Controllers\Admin\Crm\InvoiceLoaderHistoryController;
use App\Http\Controllers\Admin\Crm\InvoiceLoaderPageController;
use App\Http\Controllers\Admin\Crm\InvoiceProposalController;
use App\Http\Controllers\Admin\PrepagosRedirectController;
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

    Route::middleware('can:prepagos.manage')->get('prepagos', PrepagosRedirectController::class)->name('prepagos');

    Route::middleware('can:herramientas.view')->prefix('crm')->name('crm.')->group(function () {
        Route::get('/', CrmIndexController::class)->name('index');

        Route::middleware('can:invoice-loader.manage')->prefix('cargador-facturas')->name('invoice-loader.')->group(function () {
            Route::get('/', [InvoiceLoaderPageController::class, 'index'])->name('index');

            Route::post('propuestas', [InvoiceProposalController::class, 'store'])->name('proposals.store');
            Route::get('propuestas/{jobId}', [InvoiceProposalController::class, 'show'])->name('proposals.show');
            Route::get('propuestas/{jobId}/archivo', [InvoiceProposalController::class, 'download'])->name('proposals.download');

            Route::post('ejecuciones', [InvoiceExecutionController::class, 'store'])->name('executions.store');
            Route::get('ejecuciones/{jobId}', [InvoiceExecutionController::class, 'show'])->name('executions.show');
            Route::get('ejecuciones/{jobId}/reporte', [InvoiceExecutionController::class, 'report'])->name('executions.report');
            Route::get('ejecuciones/{jobId}/log', [InvoiceExecutionController::class, 'log'])->name('executions.log');

            Route::prefix('historico')->name('history.')->group(function () {
                Route::get('/', [InvoiceLoaderHistoryController::class, 'index'])->name('index');
                Route::get('{invoiceLoaderJob}/archivo', [InvoiceLoaderHistoryController::class, 'file'])->name('file');
                Route::get('{invoiceLoaderJob}/reporte', [InvoiceLoaderHistoryController::class, 'report'])->name('report');
                Route::get('{invoiceLoaderJob}/log', [InvoiceLoaderHistoryController::class, 'log'])->name('log');
                Route::post('{invoiceLoaderJob}/revisar', [InvoiceLoaderHistoryController::class, 'recheck'])->name('recheck');
            });
        });
    });
});
