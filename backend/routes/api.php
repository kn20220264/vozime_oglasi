<?php

use Illuminate\Http\Request;
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
use App\Http\Controllers\Api\FilterOptionController;
use App\Http\Controllers\Api\MakeController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\AiSearchController;

// ═══════════════════════════════════════════
// JAVNE RUTE (bez autentifikacije)
// ═══════════════════════════════════════════

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerification'])
    ->name('verification.resend');

Route::get('/auth/google',          [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Javni oglasi — REDOSLIJED JE BITAN: specifične rute moraju biti prije {slug}
Route::get('/ads/count',    [AdController::class, 'count']);
Route::get('/ads/featured', [AdController::class, 'featured']);
Route::get('/ads',          [AdController::class, 'index']);
Route::get('/ads/{slug}',   [AdController::class, 'show']);

// Dileri — javno
Route::get('/dealers', [UserController::class, 'dealers']);

// Javni podaci
Route::get('/makes/popular',        [MakeController::class, 'popular']);
Route::get('/makes',                [MakeController::class, 'index']);
Route::get('/makes/{make}/models',  [MakeController::class, 'models']);
Route::get('/cities',               [CityController::class, 'index']);
Route::get('/equipment',            [EquipmentController::class, 'index']);
Route::get('/categories',           [CategoryController::class, 'index']);
Route::get('/categories/{id}/subcategories', [CategoryController::class, 'subcategories']);
Route::get('/packages',             [PackageController::class, 'index']);
Route::get('/bank-settings',        [PackageController::class, 'bankSettings']);
Route::get('/filter-options',       [FilterOptionController::class, 'index']);
Route::get('/users/{userId}/reviews', [ReviewController::class, 'index']);



Route::post('/ai-search', [AiSearchController::class, 'search'])
    ->middleware(['throttle:ai_search_minute', 'throttle:ai_search_daily']);

// ═══════════════════════════════════════════
// ZAŠTIĆENE RUTE (potreban login)
// ═══════════════════════════════════════════




Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    Route::get('/profile',         [ProfileController::class, 'show']);
    Route::put('/profile',         [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::post('/profile/logo',   [ProfileController::class, 'uploadLogo']);
    Route::get('/profile/stats',   [ProfileController::class, 'stats']);

    Route::post('/ads',                [AdController::class, 'store']);
    Route::put('/ads/{ad}',            [AdController::class, 'update']);
    Route::delete('/ads/{id}',         [AdController::class, 'destroy']);
    Route::get('/my-ads',              [AdController::class, 'myAds']);
    Route::post('/ads/{ad}/mark-sold', [AdController::class, 'markAsSold']);
    Route::get('/ads/{id}/edit',       [AdController::class, 'edit']);

    Route::get('/favorites',              [FavoriteController::class, 'index']);
    Route::post('/favorites/{adId}',      [FavoriteController::class, 'toggle']);
    Route::get('/favorites/{adId}/check', [FavoriteController::class, 'check']);

    Route::get('/messages',                 [MessageController::class, 'index']);
    Route::get('/messages/unread-count',    [MessageController::class, 'unreadCount']);
    Route::get('/messages/{adId}/{userId}', [MessageController::class, 'conversation']);
    Route::post('/messages',                [MessageController::class, 'store']);

    Route::post('/users/{userId}/reviews', [ReviewController::class, 'store']);
    Route::post('/ads/{adId}/report',      [ReportController::class, 'store']);

    Route::get('/saved-searches',         [SavedSearchController::class, 'index']);
    Route::post('/saved-searches',        [SavedSearchController::class, 'store']);
    Route::delete('/saved-searches/{id}', [SavedSearchController::class, 'destroy']);

    Route::post('/packages/purchase', [PackageController::class, 'purchase']);
    Route::get('/my-packages',        [PackageController::class, 'myPackages']);
    Route::get('/my-payments',        [PackageController::class, 'myPayments']);

    Route::get('/users/{id}',     [UserController::class, 'show']);
    Route::get('/users/{id}/ads', [UserController::class, 'ads']);

    Route::get('/notifications', function (Request $request) {
        return response()->json([
            'data'         => $request->user()->notifications()->latest()->take(20)->get(),
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    });

    Route::post('/notifications/read-all', function (Request $request) {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'Sve oznaceno kao procitano.']);
    });

    Route::post('/notifications/{id}/read', function (Request $request, $id) {
        $request->user()->notifications()->findOrFail($id)->markAsRead();
        return response()->json(['message' => 'Oznaceno kao procitano.']);
    });

    // ═══════════════════════════════════════════
    // ADMIN RUTE
    // ═══════════════════════════════════════════

    Route::prefix('admin')->group(function () {

        // Statistike
        Route::get('/stats', [AdminController::class, 'stats']);

        // Oglasi
        Route::get('/ads',                       [AdminController::class, 'ads']);
        Route::put('/ads/{id}/status',           [AdminController::class, 'updateAdStatus']);
        Route::put('/ads/{id}',                  [AdminController::class, 'updateAd']);
        Route::post('/ads/{id}/toggle-featured', [AdminController::class, 'toggleAdFeatured']);
        Route::post('/ads/{id}/toggle-pinned',   [AdminController::class, 'toggleAdPinned']);
        Route::post('/ads/{id}/grant-boost',     [AdminController::class, 'grantAdBoost']);
        Route::delete('/ads/{id}',               [AdminController::class, 'deleteAd']);

        // Korisnici
        Route::get('/users',                     [AdminController::class, 'users']);
        Route::get('/users/{id}',                [AdminController::class, 'showUser']);
        Route::put('/users/{id}/toggle-active',  [AdminController::class, 'toggleUserActive']);
        Route::put('/users/{id}/role',           [AdminController::class, 'updateUserRole']);
        Route::post('/users/{id}/grant-package', [AdminController::class, 'grantAccountPackage']);

        // Privilegije korisnika
        Route::get('/privileges/available',              [AdminController::class, 'availablePrivileges']);
        Route::get('/users/{userId}/privileges',         [AdminController::class, 'getUserPrivileges']);
        Route::post('/users/{userId}/privileges',        [AdminController::class, 'grantPrivilege']);
        Route::delete('/users/{userId}/privileges/{id}', [AdminController::class, 'revokePrivilege']);

        // Prijave
        Route::get('/reports',              [AdminController::class, 'reports']);
        Route::put('/reports/{id}/resolve', [AdminController::class, 'resolveReport']);

        // Placanja
        Route::get('/payments',               [AdminController::class, 'payments']);
        Route::post('/payments/{id}/confirm', [AdminController::class, 'confirmPayment']);
        Route::post('/payments/{id}/reject',  [AdminController::class, 'rejectPayment']);

        // Paketi
        Route::get('/packages',         [AdminController::class, 'packages']);
        Route::post('/packages/grant',  [AdminController::class, 'grantPackage']);
        Route::post('/packages',        [AdminController::class, 'storePackage']);
        Route::put('/packages/{id}',    [AdminController::class, 'updatePackage']);
        Route::delete('/packages/{id}', [AdminController::class, 'deletePackage']);
        Route::get('/user-packages',    [AdminController::class, 'userPackages']);

        // Kategorije — reorder mora biti prije {id} ruta
        Route::put('/categories/reorder', [CategoryController::class, 'reorder']);
        Route::get('/categories',         [CategoryController::class, 'adminIndex']);
        Route::post('/categories',        [CategoryController::class, 'store']);
        Route::put('/categories/{id}',    [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Marke & Modeli
        Route::get('/makes',          [AdminController::class, 'makes']);
        Route::post('/makes',         [AdminController::class, 'storeMake']);
        Route::put('/makes/{id}',     [AdminController::class, 'updateMake']);
        Route::delete('/makes/{id}',  [AdminController::class, 'deleteMake']);
        Route::get('/models',         [AdminController::class, 'models']);
        Route::post('/models',        [AdminController::class, 'storeModel']);
        Route::put('/models/{id}',    [AdminController::class, 'updateModel']);
        Route::delete('/models/{id}', [AdminController::class, 'deleteModel']);

        // Gradovi
        Route::get('/cities',         [AdminController::class, 'cities']);
        Route::post('/cities',        [AdminController::class, 'storeCity']);
        Route::put('/cities/{id}',    [AdminController::class, 'updateCity']);
        Route::delete('/cities/{id}', [AdminController::class, 'deleteCity']);

        // Oprema
        Route::get('/equipment',         [AdminController::class, 'equipment']);
        Route::post('/equipment',        [AdminController::class, 'storeEquipment']);
        Route::put('/equipment/{id}',    [AdminController::class, 'updateEquipment']);
        Route::delete('/equipment/{id}', [AdminController::class, 'deleteEquipment']);

        // Filter opcije — reorder i grouped moraju biti prije {id}
        Route::put('/filter-options/reorder',  [FilterOptionController::class, 'reorder']);
        Route::get('/filter-options/grouped',  [FilterOptionController::class, 'allGrouped']);
        Route::get('/filter-options',          [FilterOptionController::class, 'adminIndex']);
        Route::post('/filter-options',         [FilterOptionController::class, 'store']);
        Route::put('/filter-options/{id}',     [FilterOptionController::class, 'update']);
        Route::delete('/filter-options/{id}',  [FilterOptionController::class, 'destroy']);

        // Podešavanja (bank detalji, itd.)
        Route::get('/settings',  [SettingController::class, 'index']);
        Route::put('/settings',  [SettingController::class, 'update']);
    });
});