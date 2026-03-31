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
use App\Http\Controllers\Api\MakeController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
 
// ═══════════════════════════════════════════
// JAVNE RUTE (bez autentifikacije)
// ═══════════════════════════════════════════
 
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
 
Route::get('/ads',         [AdController::class, 'index']);
Route::get('/ads/{slug}',  [AdController::class, 'show']);
 
Route::get('/makes',               [MakeController::class, 'index']);
Route::get('/makes/{make}/models', [MakeController::class, 'models']);
Route::get('/cities',              [CityController::class, 'index']);
Route::get('/equipment',           [EquipmentController::class, 'index']);
Route::get('/categories',          [CategoryController::class, 'index']);
Route::get('/packages',            [PackageController::class, 'index']);
 
Route::get('/users/{userId}/reviews', [ReviewController::class, 'index']);
 
// ═══════════════════════════════════════════
// ZAŠTIĆENE RUTE (potreban login)
// ═══════════════════════════════════════════
 
Route::middleware('auth:sanctum')->group(function () {
 
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
 
    // Profil
    Route::get('/profile',         [ProfileController::class, 'show']);
    Route::put('/profile',         [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::post('/profile/logo',   [ProfileController::class, 'uploadLogo']);
    Route::get('/profile/stats',   [ProfileController::class, 'stats']);
 
    // Oglasi
    Route::post('/ads',                [AdController::class, 'store']);
    Route::put('/ads/{ad}',            [AdController::class, 'update']);
    Route::delete('/ads/{id}',         [AdController::class, 'destroy']);
    Route::get('/my-ads',              [AdController::class, 'myAds']);
    Route::post('/ads/{ad}/mark-sold', [AdController::class, 'markAsSold']);
    Route::get('/ads/{id}/edit',       [AdController::class, 'edit']);
 
    // Omiljeni
    Route::get('/favorites',              [FavoriteController::class, 'index']);
    Route::post('/favorites/{adId}',      [FavoriteController::class, 'toggle']);
    Route::get('/favorites/{adId}/check', [FavoriteController::class, 'check']);
 
    // Poruke
    Route::get('/messages',                 [MessageController::class, 'index']);
    Route::get('/messages/unread-count',    [MessageController::class, 'unreadCount']);
    Route::get('/messages/{adId}/{userId}', [MessageController::class, 'conversation']);
    Route::post('/messages',                [MessageController::class, 'store']);
 
    // Recenzije
    Route::post('/users/{userId}/reviews', [ReviewController::class, 'store']);
 
    // Prijave oglasa
    Route::post('/ads/{adId}/report', [ReportController::class, 'store']);
 
    // Sačuvane pretrage
    Route::get('/saved-searches',         [SavedSearchController::class, 'index']);
    Route::post('/saved-searches',        [SavedSearchController::class, 'store']);
    Route::delete('/saved-searches/{id}', [SavedSearchController::class, 'destroy']);
 
    // Paketi
    Route::post('/packages/purchase', [PackageController::class, 'purchase']);
    Route::get('/my-packages',        [PackageController::class, 'myPackages']);
 
    // Javni profil korisnika
    Route::get('/users/{id}',     [UserController::class, 'show']);
    Route::get('/users/{id}/ads', [UserController::class, 'ads']);
 
    // Notifikacije
    Route::get('/notifications', function (Request $request) {
        return response()->json([
            'data'         => $request->user()->notifications()->latest()->take(20)->get(),
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    });
 
    Route::post('/notifications/read-all', function (Request $request) {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'Sve označeno kao pročitano.']);
    });
 
    Route::post('/notifications/{id}/read', function (Request $request, $id) {
        $request->user()->notifications()->findOrFail($id)->markAsRead();
        return response()->json(['message' => 'Označeno kao pročitano.']);
    });
 
    // ═══════════════════════════════════════
    // ADMIN + MODERATOR RUTE
    // ═══════════════════════════════════════
    Route::prefix('admin')->group(function () {
 
        // Statistike (admin i moderator)
        Route::get('/stats', [AdminController::class, 'stats']);
 
        // Oglasi (admin i moderator)
        Route::get('/ads',                 [AdminController::class, 'ads']);
        Route::put('/ads/{id}/status',     [AdminController::class, 'updateAdStatus']);
        Route::delete('/ads/{id}',         [AdminController::class, 'deleteAd']);
 
        // Korisnici (samo admin)
        Route::get('/users',                    [AdminController::class, 'users']);
        Route::put('/users/{id}/toggle-active', [AdminController::class, 'toggleUserActive']);
        Route::put('/users/{id}/role',          [AdminController::class, 'updateUserRole']);
 
        // Prijave (admin i moderator)
        Route::get('/reports',             [AdminController::class, 'reports']);
        Route::put('/reports/{id}/resolve',[AdminController::class, 'resolveReport']);
 
        // Marke (samo admin)
        Route::get('/makes',           [AdminController::class, 'makes']);
        Route::post('/makes',          [AdminController::class, 'storeMake']);
        Route::put('/makes/{id}',      [AdminController::class, 'updateMake']);
        Route::delete('/makes/{id}',   [AdminController::class, 'deleteMake']);
 
        // Modeli (samo admin)
        Route::get('/models',          [AdminController::class, 'models']);
        Route::post('/models',         [AdminController::class, 'storeModel']);
        Route::put('/models/{id}',     [AdminController::class, 'updateModel']);
        Route::delete('/models/{id}',  [AdminController::class, 'deleteModel']);
 
        // Gradovi (samo admin)
        Route::get('/cities',          [AdminController::class, 'cities']);
        Route::post('/cities',         [AdminController::class, 'storeCity']);
        Route::put('/cities/{id}',     [AdminController::class, 'updateCity']);
        Route::delete('/cities/{id}',  [AdminController::class, 'deleteCity']);
 
        // Paketi (samo admin)
        Route::get('/packages',        [AdminController::class, 'packages']);
        Route::post('/packages',       [AdminController::class, 'storePackage']);
        Route::put('/packages/{id}',   [AdminController::class, 'updatePackage']);
        Route::delete('/packages/{id}',[AdminController::class, 'deletePackage']);
    });
});