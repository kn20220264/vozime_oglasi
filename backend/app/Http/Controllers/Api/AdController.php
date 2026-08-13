<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ad\StoreAdRequest;
use App\Http\Requests\Ad\UpdateAdRequest;
use App\Http\Resources\AdDetailResource;
use App\Http\Resources\AdResource;
use App\Models\Ad;
use App\Models\AdImage;
use App\Models\UserPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


class AdController extends Controller
{
    // ==========================================
    // INDEX — lista oglasa sa filterima
    // GET /api/ads?make_id=1&city_id=2&price_to=15000
    // ==========================================
    public function index(Request $request): JsonResponse
    {
        $query = Ad::with(['city', 'make', 'vehicleModel', 'primaryImage', 'user'])
            ->where('status', 'active');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('make_id')) {
            $query->where('make_id', $request->make_id);
        }

        if ($request->filled('model_id')) {
            $query->where('model_id', $request->model_id);
        }

        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->filled('year_from')) {
            $query->where('year', '>=', $request->year_from);
        }

        if ($request->filled('year_to')) {
            $query->where('year', '<=', $request->year_to);
        }

        if ($request->filled('price_from')) {
            $query->where('price', '>=', $request->price_from);
        }

        if ($request->filled('price_to')) {
            $query->where('price', '<=', $request->price_to);
        }

        if ($request->filled('mileage_to')) {
            $query->where('mileage', '<=', $request->mileage_to);
        }

        if ($request->filled('fuel_type')) {
            $query->where('fuel_type', $request->fuel_type);
        }

        if ($request->filled('transmission')) {
            $query->where('transmission', $request->transmission);
        }

        if ($request->filled('body_type')) {
            $query->where('body_type', $request->body_type);
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        if ($request->filled('damage')) {
            $query->where('damage', $request->damage);
        }

        if ($request->filled('drive_type')) {
            $query->where('drive_type', $request->drive_type);
        }

        if ($request->filled('power_kw_from')) {
            $query->where('power_kw', '>=', $request->power_kw_from);
        }

        if ($request->filled('power_kw_to')) {
            $query->where('power_kw', '<=', $request->power_kw_to);
        }

        // Istorija vozila — CSV lista vrijednosti, oglas mora imati SVE odabrane
        if ($request->filled('vehicle_history')) {
            foreach (explode(',', $request->vehicle_history) as $historyItem) {
                $historyItem = trim($historyItem);
                if ($historyItem !== '') {
                    $query->whereJsonContains('vehicle_history', $historyItem);
                }
            }
        }

        // Kuka za prikolicu — '1'/'any' = bilo koja, ili konkretan tip
        if ($request->filled('trailer_coupling')) {
            if (in_array($request->trailer_coupling, ['1', 'any', 'true'])) {
                $query->whereNotNull('trailer_coupling');
            } else {
                $query->where('trailer_coupling', $request->trailer_coupling);
            }
        }

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->q . '%')
                    ->orWhere('description', 'like', '%' . $request->q . '%');
            });
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // SORTIRANJE
        $sortBy  = $request->get('sort', 'created_at');
        $sortDir = $request->get('dir', 'desc');

        $allowedSorts = ['price', 'year', 'mileage', 'created_at', 'views_count'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy('featured', 'desc')
                ->orderBy($sortBy, $sortDir);
        }

        $perPage = min((int) $request->get('per_page', 20), 50);
        $ads = $query->paginate($perPage);

        return response()->json([
            'data' => AdResource::collection($ads),
            'meta' => [
                'current_page' => $ads->currentPage(),
                'last_page'    => $ads->lastPage(),
                'per_page'     => $ads->perPage(),
                'total'        => $ads->total(),
            ],
        ]);
    }

    // ==========================================
    // COUNT — broj oglasa koji odgovaraju filterima
    // GET /api/ads/count?make_id=1&category_id=2
    // Koristi se za dugme na SearchBox-u
    // ==========================================
    public function count(Request $request): JsonResponse
    {
        $query = Ad::where('status', 'active');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('make_id')) {
            $query->where('make_id', $request->make_id);
        }

        if ($request->filled('model_id')) {
            $query->where('model_id', $request->model_id);
        }

        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->filled('year_from')) {
            $query->where('year', '>=', $request->year_from);
        }

        if ($request->filled('year_to')) {
            $query->where('year', '<=', $request->year_to);
        }

        if ($request->filled('price_from')) {
            $query->where('price', '>=', $request->price_from);
        }

        if ($request->filled('price_to')) {
            $query->where('price', '<=', $request->price_to);
        }

        if ($request->filled('mileage_to')) {
            $query->where('mileage', '<=', $request->mileage_to);
        }

        return response()->json(['count' => $query->count()]);
    }

    // ==========================================
    // FEATURED — istaknuti oglasi za homepage (max 30)
    // GET /api/ads/featured
    // ==========================================
    public function featured(): JsonResponse
    {
        $ads = Ad::with(['city', 'make', 'vehicleModel', 'primaryImage', 'user'])
            ->where('status', 'active')
            ->where('featured', true)
            ->where('featured_until', '>', now())
            ->orderBy('created_at', 'desc')
            ->take(30)
            ->get();

        return response()->json([
            'data' => AdResource::collection($ads),
        ]);
    }

    // ==========================================
    // SHOW — detalj jednog oglasa
    // GET /api/ads/{slug}
    // ==========================================
    public function show(string $slug): JsonResponse
    {
        $query = Ad::with([
            'city',
            'make',
            'vehicleModel',
            'category',
            'images',
            'equipment',
            'user.profile',
            'favorites',
        ])->where('slug', $slug);

        $ad = $query->where(function ($q) {
            $q->where('status', 'active')
                ->orWhere(function ($q2) {
                    if (auth()->check()) {
                        $q2->where('user_id', auth()->id());
                    }
                });
        })->firstOrFail();

        $ad->increment('views_count');

        return response()->json([
            'data' => new AdDetailResource($ad),
        ]);
    }

    // ==========================================
    // STORE — kreiraj novi oglas
    // POST /api/ads
    // ==========================================
    public function store(StoreAdRequest $request): JsonResponse
    {
        $user = auth()->user();

        // Provjeri limit oglasa prema aktivnom account paketu
        $activePackage = UserPackage::with('package')
            ->where('user_id', $user->id)
            ->whereHas('package', fn($q) => $q->where('type', 'account'))
            ->where('expires_at', '>', now())
            ->orderByDesc('created_at')
            ->first();

        $maxAds = $activePackage?->package?->max_active_ads ?? 3; // default FREE = 3

        $currentAds = Ad::where('user_id', $user->id)
            ->whereIn('status', ['active', 'pending'])
            ->count();

        if ($currentAds >= $maxAds) {
            return response()->json([
                'message' => "Dostigli ste maksimalan broj aktivnih oglasa ({$maxAds}) za vaš trenutni paket. Nadogradite paket za više oglasa.",
            ], 422);
        }

        // Limit broja slika — GALERIJA paket podiže limit
        $maxImages = $this->maxImagesForUser($user->id);
        if ($request->hasFile('images') && count($request->file('images')) > $maxImages) {
            return response()->json([
                'message' => "Vaš paket dozvoljava najviše {$maxImages} slika po oglasu. Kupite GALERIJA paket za više slika.",
            ], 422);
        }

        $ad = DB::transaction(function () use ($request) {

            $ad = Ad::create([
                ...$request->safe()->except(['images', 'equipment']),
                'user_id'    => auth()->id(),
                'status'     => 'pending',
                'expires_at' => now()->addDays(30),
                'currency'   => 'EUR',
            ]);

            if ($request->filled('equipment')) {
                $ad->equipment()->sync($request->equipment);
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store("ads/{$ad->id}", 'public');

                    AdImage::create([
                        'ad_id'      => $ad->id,
                        'path'       => $path,
                        'is_primary' => $index === 0,
                        'order'      => $index + 1,
                    ]);
                }
            }

            return $ad;
        });

        $ad->load(['city', 'make', 'vehicleModel', 'images', 'equipment', 'user']);

        return response()->json([
            'message' => 'Oglas je uspješno kreiran i čeka moderaciju.',
            'data'    => new AdDetailResource($ad),
        ], 201);
    }

    // ==========================================
    // UPDATE — izmijeni oglas
    // PUT /api/ads/{ad}
    // ==========================================
    public function update(UpdateAdRequest $request, Ad $ad): JsonResponse
    {
        // Limit broja slika (postojeće - obrisane + nove) — GALERIJA paket podiže limit
        if ($request->hasFile('images')) {
            $maxImages = $this->maxImagesForUser($ad->user_id);
            $existing  = AdImage::where('ad_id', $ad->id)->count();
            $deleting  = $request->filled('delete_images') ? count($request->delete_images) : 0;
            $adding    = count($request->file('images'));

            if ($existing - $deleting + $adding > $maxImages) {
                return response()->json([
                    'message' => "Vaš paket dozvoljava najviše {$maxImages} slika po oglasu. Kupite GALERIJA paket za više slika.",
                ], 422);
            }
        }

        DB::transaction(function () use ($request, $ad) {

            $ad->update($request->safe()->except([
                'images',
                'equipment',
                'delete_images',
                'primary_image_id',
            ]));

            if ($request->has('equipment')) {
                $ad->equipment()->sync($request->equipment);
            }

            if ($request->filled('delete_images')) {
                $imagesToDelete = AdImage::where('ad_id', $ad->id)
                    ->whereIn('id', $request->delete_images)
                    ->get();

                foreach ($imagesToDelete as $image) {
                    Storage::disk('public')->delete($image->path);
                    $image->delete();
                }
            }

            if ($request->filled('primary_image_id')) {
                AdImage::where('ad_id', $ad->id)->update(['is_primary' => false]);
                AdImage::where('id', $request->primary_image_id)->update(['is_primary' => true]);
            }

            if ($request->hasFile('images')) {
                $lastOrder = AdImage::where('ad_id', $ad->id)->max('order') ?? 0;

                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store("ads/{$ad->id}", 'public');

                    AdImage::create([
                        'ad_id'      => $ad->id,
                        'path'       => $path,
                        'is_primary' => false,
                        'order'      => $lastOrder + $index + 1,
                    ]);
                }
            }
        });

        $ad->load(['city', 'make', 'vehicleModel', 'images', 'equipment', 'user']);

        return response()->json([
            'message' => 'Oglas je uspješno izmijenjen.',
        ]);
    }

    public function edit(Request $request, $id): JsonResponse
    {
        $ad = Ad::with(['city', 'make', 'vehicleModel', 'images', 'equipment', 'category'])
            ->findOrFail($id);

        if ($ad->user_id !== $request->user()->id && !in_array($request->user()->role, ['admin', 'moderator'])) {
            return response()->json(['message' => 'Nemate dozvolu.'], 403);
        }

        return response()->json(['data' => new AdDetailResource($ad)]);
    }

    // ==========================================
    // DESTROY — obriši oglas
    // DELETE /api/ads/{id}
    // ==========================================
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $ad   = Ad::findOrFail($id);

        if ($ad->user_id !== $user->id && !in_array($user->role, ['admin', 'moderator'])) {
            return response()->json(['message' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        foreach ($ad->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $ad->load('favorites.user');
        foreach ($ad->favorites as $favorite) {
            $favorite->user->notify(new \App\Notifications\FavoriteAdRemoved($ad));
        }

        $ad->delete();

        return response()->json(['message' => 'Oglas obrisan.']);
    }

    // ==========================================
    // MY ADS
    // GET /api/my-ads
    // ==========================================
    public function myAds(Request $request): JsonResponse
    {
        $ads = Ad::with(['city', 'make', 'vehicleModel', 'primaryImage'])
            ->where('user_id', auth()->id())
            ->when(
                $request->filled('status'),
                fn($q) => $q->where('status', $request->status)
            )
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => AdResource::collection($ads),
            'meta' => [
                'current_page' => $ads->currentPage(),
                'last_page'    => $ads->lastPage(),
                'total'        => $ads->total(),
            ],
        ]);
    }

    // ==========================================
    // MARK AS SOLD
    // POST /api/ads/{ad}/mark-sold
    // ==========================================
    public function markAsSold(Ad $ad): JsonResponse
    {
        if ($ad->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $ad->update(['status' => 'sold']);

        return response()->json([
            'message' => 'Oglas je označen kao prodat.',
        ]);
    }

    // ==========================================
    // REFRESH — obnovi oglas (skoči na vrh pretrage)
    // POST /api/ads/{ad}/refresh
    // Troši 1 kredit iz aktivnog refresh paketa, cooldown 48h po oglasu
    // ==========================================
    public function refresh(Ad $ad): JsonResponse
    {
        if ($ad->user_id !== auth()->id()) {
            return response()->json(['message' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        if ($ad->status !== 'active') {
            return response()->json(['message' => 'Samo aktivni oglasi se mogu obnoviti.'], 422);
        }

        if ($ad->last_refreshed_at && $ad->last_refreshed_at->gt(now()->subHours(48))) {
            $nextAt = $ad->last_refreshed_at->addHours(48);
            return response()->json([
                'message'  => 'Oglas se može obnoviti svakih 48 sati. Sljedeće obnavljanje: ' . $nextAt->format('d.m.Y H:i'),
                'next_refresh_at' => $nextAt,
            ], 422);
        }

        // Limit iz aktivnog REFREŠ paketa: koliko oglasa smije da se obnovi u 48h
        $limit = $this->refreshLimit();

        if ($limit === 0) {
            return response()->json([
                'message'      => 'Za obnavljanje oglasa potreban je aktivan REFREŠ paket.',
                'needs_package'=> true,
            ], 422);
        }

        // Koliko je oglasa već obnovljeno u posljednjih 48h
        $usedLast48h = Ad::where('user_id', auth()->id())
            ->where('last_refreshed_at', '>', now()->subHours(48))
            ->count();

        if ($usedLast48h >= $limit) {
            return response()->json([
                'message' => "Vaš paket dozvoljava obnavljanje {$limit} oglasa svakih 48 sati. Limit je trenutno iskorišćen.",
            ], 422);
        }

        // Bump na vrh — lista je sortirana po created_at
        $ad->forceFill([
            'created_at'        => now(),
            'last_refreshed_at' => now(),
        ])->save();

        return response()->json([
            'message'   => 'Oglas je obnovljen i sada je na vrhu pretrage.',
            'remaining' => max(0, $limit - $usedLast48h - 1),
        ]);
    }

    // ==========================================
    // PAUSE / RESUME
    // POST /api/ads/{ad}/pause  |  POST /api/ads/{ad}/resume
    // ==========================================
    public function pause(Ad $ad): JsonResponse
    {
        if ($ad->user_id !== auth()->id()) {
            return response()->json(['message' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        if ($ad->status !== 'active') {
            return response()->json(['message' => 'Samo aktivni oglasi se mogu pauzirati.'], 422);
        }

        $ad->update(['status' => 'paused']);

        return response()->json(['message' => 'Oglas je pauziran. Možete ga nastaviti kad god želite.']);
    }

    public function resume(Ad $ad): JsonResponse
    {
        if ($ad->user_id !== auth()->id()) {
            return response()->json(['message' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        if ($ad->status !== 'paused') {
            return response()->json(['message' => 'Samo pauzirani oglasi se mogu nastaviti.'], 422);
        }

        if ($ad->expires_at && $ad->expires_at->isPast()) {
            return response()->json(['message' => 'Oglas je istekao. Obnovite ga kroz novi paket.'], 422);
        }

        $ad->update(['status' => 'active']);

        return response()->json(['message' => 'Oglas je ponovo aktivan.']);
    }

    // ==========================================
    // AUTO-REFRESH TOGGLE
    // POST /api/ads/{ad}/auto-refresh
    // Zahtijeva aktivan AUTO-REFRESH paket
    // ==========================================
    public function toggleAutoRefresh(Ad $ad): JsonResponse
    {
        if ($ad->user_id !== auth()->id()) {
            return response()->json(['message' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        if (!$ad->auto_refresh) {
            $hasAutoPackage = UserPackage::where('user_id', auth()->id())
                ->whereNotNull('paid_at')
                ->where('expires_at', '>', now())
                ->whereHas('package', fn($q) => $q->where('type', 'refresh')->where('auto_refresh', true))
                ->exists();

            if (!$hasAutoPackage) {
                return response()->json([
                    'message'       => 'Za automatsko obnavljanje potreban je aktivan AUTO-REFRESH paket.',
                    'needs_package' => true,
                ], 422);
            }
        }

        $ad->update(['auto_refresh' => !$ad->auto_refresh]);

        return response()->json([
            'message'      => $ad->auto_refresh ? 'Automatsko obnavljanje uključeno.' : 'Automatsko obnavljanje isključeno.',
            'auto_refresh' => $ad->auto_refresh,
        ]);
    }

    // ==========================================
    // REFRESH STATUS — stanje refresh paketa korisnika
    // GET /api/refresh-credits
    // ==========================================
    public function refreshCredits(): JsonResponse
    {
        $limit = $this->refreshLimit();

        $usedLast48h = $limit > 0
            ? Ad::where('user_id', auth()->id())
                ->where('last_refreshed_at', '>', now()->subHours(48))
                ->count()
            : 0;

        return response()->json([
            'has_package'      => $limit > 0,
            'limit'            => $limit,
            'used_last_48h'    => $usedLast48h,
            'remaining'        => max(0, $limit - $usedLast48h),
            'has_auto_refresh' => UserPackage::where('user_id', auth()->id())
                ->whereNotNull('paid_at')
                ->where('expires_at', '>', now())
                ->whereHas('package', fn($q) => $q->where('type', 'refresh')->where('auto_refresh', true))
                ->exists(),
        ]);
    }

    // Maksimalan broj slika po oglasu za korisnika:
    // aktivan GALERIJA paket > account paket max_images > default 10
    private function maxImagesForUser(int $userId): int
    {
        $galleryMax = UserPackage::with('package')
            ->where('user_id', $userId)
            ->whereNotNull('paid_at')
            ->where('expires_at', '>', now())
            ->whereHas('package', fn($q) => $q->where('type', 'gallery'))
            ->get()
            ->max(fn($up) => $up->package->max_images);

        $accountMax = UserPackage::with('package')
            ->where('user_id', $userId)
            ->whereNotNull('paid_at')
            ->where('expires_at', '>', now())
            ->whereHas('package', fn($q) => $q->where('type', 'account'))
            ->get()
            ->max(fn($up) => $up->package->max_images);

        return max($galleryMax ?? 0, $accountMax ?? 0, 10);
    }

    // Najveći limit obnavljanja (broj oglasa u 48h) iz aktivnih REFREŠ paketa; 0 = nema paketa
    private function refreshLimit(): int
    {
        return (int) (UserPackage::with('package')
            ->where('user_id', auth()->id())
            ->whereNotNull('paid_at')
            ->where('expires_at', '>', now())
            ->whereHas('package', fn($q) => $q->where('type', 'refresh')->whereNotNull('refresh_count'))
            ->get()
            ->max(fn($up) => $up->package->refresh_count) ?? 0);
    }
}
