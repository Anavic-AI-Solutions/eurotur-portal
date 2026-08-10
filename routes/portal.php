<?php

use App\Http\Controllers\Portal\FrenteController;
use App\Http\Controllers\Portal\IniciativaController;
use App\Http\Controllers\Portal\InnovacionController;
use App\Http\Controllers\Portal\SearchController;
use App\Http\Controllers\Portal\SectorGroupController;
use App\Http\Controllers\Portal\SectorItemController;
use App\Http\Controllers\Portal\SectorPageController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'portal/home')->name('home');
Route::get('search', SearchController::class)->name('portal.search');
Route::inertia('institucional', 'portal/institucional')->name('portal.institucional');
Route::get('rrhh', [SectorPageController::class, 'rrhh'])->name('portal.rrhh');
Route::get('adm', [SectorPageController::class, 'adm'])->name('portal.adm');
Route::inertia('adm/prebalance', 'portal/adm-prebalance')->name('portal.adm.prebalance');
Route::get('contrataciones', [SectorPageController::class, 'contrataciones'])->name('portal.contrataciones');
Route::get('operaciones', [SectorPageController::class, 'operaciones'])->name('portal.operaciones');
Route::get('producto', [SectorPageController::class, 'producto'])->name('portal.producto');
Route::get('customercare', [SectorPageController::class, 'customercare'])->name('portal.customercare');
Route::inertia('qrated', 'portal/qrated')->name('portal.qrated');
Route::get('sales', [SectorPageController::class, 'sales'])->name('portal.sales');
Route::get('traveldesigners', [SectorPageController::class, 'traveldesigners'])->name('portal.traveldesigners');
Route::get('it', [SectorPageController::class, 'it'])->name('portal.it');
Route::inertia('mesa', 'portal/mesa')->name('portal.mesa');
Route::get('responsables', [SectorPageController::class, 'responsables'])->name('portal.responsables');
Route::get('innovacion', InnovacionController::class)->name('portal.innovacion');

Route::middleware('auth')->group(function () {
    Route::post('{sector}/groups', [SectorGroupController::class, 'store'])->name('portal.groups.store');
    Route::put('groups/{group}', [SectorGroupController::class, 'update'])->name('portal.groups.update');
    Route::delete('groups/{group}', [SectorGroupController::class, 'destroy'])->name('portal.groups.destroy');

    Route::post('groups/{group}/items', [SectorItemController::class, 'store'])->name('portal.items.store');
    Route::put('items/{item}', [SectorItemController::class, 'update'])->name('portal.items.update');
    Route::delete('items/{item}', [SectorItemController::class, 'destroy'])->name('portal.items.destroy');

    Route::post('frentes', [FrenteController::class, 'store'])->name('portal.frentes.store');
    Route::put('frentes/{frente}', [FrenteController::class, 'update'])->name('portal.frentes.update');
    Route::delete('frentes/{frente}', [FrenteController::class, 'destroy'])->name('portal.frentes.destroy');

    Route::post('frentes/{frente}/iniciativas', [IniciativaController::class, 'store'])->name('portal.iniciativas.store');
    Route::put('iniciativas/{iniciativa}', [IniciativaController::class, 'update'])->name('portal.iniciativas.update');
    Route::delete('iniciativas/{iniciativa}', [IniciativaController::class, 'destroy'])->name('portal.iniciativas.destroy');
});
