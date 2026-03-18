<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SavedSearchController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MakeController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\PackageController;

// ═══════════════════════════════════════════
// JAVNE RUTE (bez autentifikacije)
// ═══════════════════════════════════════════

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Oglasi
Route::get('/ads',        [AdController::class, 'index']);
Route::get('/ads/{slug}', [AdController::class, 'show']);

// Filteri (dropdownovi na frontendu)
Route::get('/makes',              [MakeController::class, 'index']);
Route::get('/makes/{id}/models',  [MakeController::class, 'models']);
Route::get('/cities',             [CityController::class, 'index']);
Route::get('/equipment',          [EquipmentController::class, 'index']);

// Recenzije korisnika (javno vidljive)
Route::get('/users/{userId}/reviews', [ReviewController::class, 'index']);


Route::get('/packages', [PackageController::class, 'index']);
// ═══════════════════════════════════════════
// ZAŠTIĆENE RUTE (potreban login)
// ═══════════════════════════════════════════

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Profil
    Route::get('/profile',           [ProfileController::class, 'show']);
    Route::put('/profile',           [ProfileController::class, 'update']);
    Route::post('/profile/avatar',   [ProfileController::class, 'uploadAvatar']);

    // Oglasi
    Route::post('/ads',                    [AdController::class, 'store']);
    Route::put('/ads/{id}',                [AdController::class, 'update']);
    Route::delete('/ads/{id}',             [AdController::class, 'destroy']);
    Route::get('/my-ads',                  [AdController::class, 'myAds']);
    Route::post('/ads/{id}/mark-sold',     [AdController::class, 'markSold']);

    // Omiljeni
    Route::get('/favorites',              [FavoriteController::class, 'index']);
    Route::post('/favorites/{adId}',      [FavoriteController::class, 'toggle']);
    Route::get('/favorites/{adId}/check', [FavoriteController::class, 'check']);

    // Poruke
    Route::get('/messages',                          [MessageController::class, 'index']);
    Route::get('/messages/unread-count',             [MessageController::class, 'unreadCount']);
    Route::get('/messages/{adId}/{userId}',          [MessageController::class, 'conversation']);
    Route::post('/messages',                         [MessageController::class, 'store']);

    // Recenzije
    Route::post('/users/{userId}/reviews', [ReviewController::class, 'store']);

    // Prijave oglasa
    Route::post('/ads/{adId}/report', [ReportController::class, 'store']);

    // Sačuvane pretrage
    Route::get('/saved-searches',        [SavedSearchController::class, 'index']);
    Route::post('/saved-searches',       [SavedSearchController::class, 'store']);
    Route::delete('/saved-searches/{id}',[SavedSearchController::class, 'destroy']);

    Route::post('/packages/purchase', [PackageController::class, 'purchase']);
    Route::get('/my-packages',        [PackageController::class, 'myPackages']);

    // ═══════════════════════════════════════
    // ADMIN RUTE
    // ═══════════════════════════════════════
    Route::prefix('admin')->group(function () {
        Route::get('/stats',                       [AdminController::class, 'stats']);
        Route::get('/ads',                         [AdminController::class, 'ads']);
        Route::put('/ads/{id}/status',             [AdminController::class, 'updateAdStatus']);
        Route::get('/users',                       [AdminController::class, 'users']);
        Route::put('/users/{id}/toggle-active',    [AdminController::class, 'toggleUserActive']);
        Route::get('/reports',                     [AdminController::class, 'reports']);
        Route::put('/reports/{id}/resolve',        [AdminController::class, 'resolveReport']);
    });


});