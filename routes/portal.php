<?php

use App\Http\Controllers\Portal\BnaDailyRateController;
use App\Http\Controllers\Portal\BnaDailyRateExportController;
use App\Http\Controllers\Portal\ExchangeRateController;
use App\Http\Controllers\Portal\FrenteController;
use App\Http\Controllers\Portal\IniciativaController;
use App\Http\Controllers\Portal\InnovacionController;
use App\Http\Controllers\Portal\MeetingRoomController;
use App\Http\Controllers\Portal\ReceiptOcrController;
use App\Http\Controllers\Portal\SearchAdminController;
use App\Http\Controllers\Portal\SearchController;
use App\Http\Controllers\Portal\SearchResultsController;
use App\Http\Controllers\Portal\SearchStaticEntryController;
use App\Http\Controllers\Portal\SearchSynonymTermController;
use App\Http\Controllers\Portal\SectorGroupController;
use App\Http\Controllers\Portal\SectorItemController;
use App\Http\Controllers\Portal\SectorPageController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'portal/home')->name('home');
Route::get('search', SearchController::class)->name('portal.search');
Route::get('busqueda', SearchResultsController::class)->name('portal.search-results');
Route::inertia('institucional', 'portal/institucional')->name('portal.institucional');
Route::get('rrhh', [SectorPageController::class, 'rrhh'])->name('portal.rrhh');
Route::get('adm', [SectorPageController::class, 'adm'])->name('portal.adm');
Route::inertia('adm/prebalance', 'portal/adm-prebalance')->name('portal.adm.prebalance');
Route::inertia('adm/rendicion-gastos', 'portal/adm-rendicion-gastos')->name('portal.adm.rendicion');
Route::get('contrataciones', [SectorPageController::class, 'contrataciones'])->name('portal.contrataciones');
Route::get('operaciones', [SectorPageController::class, 'operaciones'])->name('portal.operaciones');
Route::get('producto', [SectorPageController::class, 'producto'])->name('portal.producto');
Route::get('customercare', [SectorPageController::class, 'customercare'])->name('portal.customercare');
Route::inertia('qrated', 'portal/qrated')->name('portal.qrated');
Route::get('sales', [SectorPageController::class, 'sales'])->name('portal.sales');
Route::get('traveldesigners', [SectorPageController::class, 'traveldesigners'])->name('portal.traveldesigners');
Route::get('it', [SectorPageController::class, 'it'])->name('portal.it');
Route::inertia('mesa', 'portal/mesa')->name('portal.mesa');
Route::get('sala-de-reuniones', MeetingRoomController::class)->name('portal.meeting-room');
Route::get('responsables', [SectorPageController::class, 'responsables'])->name('portal.responsables');
Route::get('innovacion', InnovacionController::class)->name('portal.innovacion');
Route::get('tipo-de-cambio', ExchangeRateController::class)->name('portal.exchange-rate');

// Pública (sin auth) igual que la página del wizard: la rendición de gastos
// la usa cualquier empleado, no solo quienes tienen cuenta en el portal. El
// throttle es la única protección contra abuso de un endpoint que le pega a
// un servicio de IA con costo real.
Route::post('rendicion-gastos/ocr', ReceiptOcrController::class)
    ->middleware('throttle:30,1')
    ->name('portal.rendicion-gastos.ocr');

Route::middleware(['auth', 'can:editar-portal'])->group(function () {
    Route::get('buscador', SearchAdminController::class)
        ->middleware('can:search.admin')
        ->name('portal.search-admin');

    Route::post('{sector}/groups', [SectorGroupController::class, 'store'])->name('portal.groups.store');
    Route::put('groups/{group}', [SectorGroupController::class, 'update'])->name('portal.groups.update');
    Route::delete('groups/{group}', [SectorGroupController::class, 'destroy'])->name('portal.groups.destroy');

    Route::post('groups/{group}/items', [SectorItemController::class, 'store'])->name('portal.items.store');
    Route::put('items/{item}', [SectorItemController::class, 'update'])->name('portal.items.update');
    Route::delete('items/{item}', [SectorItemController::class, 'destroy'])->name('portal.items.destroy');

    Route::middleware('can:innovacion.manage')->group(function () {
        Route::post('frentes', [FrenteController::class, 'store'])->name('portal.frentes.store');
        Route::put('frentes/{frente}', [FrenteController::class, 'update'])->name('portal.frentes.update');
        Route::delete('frentes/{frente}', [FrenteController::class, 'destroy'])->name('portal.frentes.destroy');

        Route::post('frentes/{frente}/iniciativas', [IniciativaController::class, 'store'])->name('portal.iniciativas.store');
        Route::put('iniciativas/{iniciativa}', [IniciativaController::class, 'update'])->name('portal.iniciativas.update');
        Route::delete('iniciativas/{iniciativa}', [IniciativaController::class, 'destroy'])->name('portal.iniciativas.destroy');
    });

    Route::middleware('can:exchange-rate.manage')->group(function () {
        Route::post('tipo-de-cambio/bna', [BnaDailyRateController::class, 'store'])->name('portal.bna-rates.store');
        Route::get('tipo-de-cambio/export', BnaDailyRateExportController::class)->name('portal.bna-rates.export');
        Route::put('bna-rates/{rate}', [BnaDailyRateController::class, 'update'])->name('portal.bna-rates.update');
        Route::delete('bna-rates/{rate}', [BnaDailyRateController::class, 'destroy'])->name('portal.bna-rates.destroy');
    });

    Route::middleware('can:search.admin')->group(function () {
        Route::post('search-static-entries', [SearchStaticEntryController::class, 'store'])->name('portal.search-static-entries.store');
        Route::put('search-static-entries/{entry}', [SearchStaticEntryController::class, 'update'])->name('portal.search-static-entries.update');
        Route::delete('search-static-entries/{entry}', [SearchStaticEntryController::class, 'destroy'])->name('portal.search-static-entries.destroy');

        Route::post('search-synonym-terms', [SearchSynonymTermController::class, 'store'])->name('portal.search-synonym-terms.store');
        Route::delete('search-synonym-terms/{term}', [SearchSynonymTermController::class, 'destroy'])->name('portal.search-synonym-terms.destroy');
    });
});
