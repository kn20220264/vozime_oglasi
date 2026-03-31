<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ad\StoreAdRequest;
use App\Http\Requests\Ad\UpdateAdRequest;
use App\Http\Resources\AdDetailResource;
use App\Http\Resources\AdResource;
use App\Models\Ad;
use App\Models\AdImage;
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

        // FILTERI — svaki je opcionalan, dodaje se samo ako je poslan
        // Ovo je isti princip kao na polovniautomobili — filtriraš šta hoćeš

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

        // Tekstualna pretraga — pretražuje naslov i opis
        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->q . '%')
                    ->orWhere('description', 'like', '%' . $request->q . '%');
            });
        }

        // SORTIRANJE
        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('dir', 'desc');

        $allowedSorts = ['price', 'year', 'mileage', 'created_at', 'views_count'];

        if (in_array($sortBy, $allowedSorts)) {
            // Istaknuti oglasi uvijek idu prvi, bez obzira na sort
            $query->orderBy('featured', 'desc')
                ->orderBy($sortBy, $sortDir);
        }

        // PAGINACIJA — 20 oglasa po stranici, isto kao polovniautomobili
        $ads = $query->paginate(20);

        return response()->json([
            'data'  => AdResource::collection($ads),
            'meta'  => [
                'current_page' => $ads->currentPage(),
                'last_page'    => $ads->lastPage(),
                'per_page'     => $ads->perPage(),
                'total'        => $ads->total(),
            ],
        ]);
    }

    // ==========================================
    // FEATURED — istaknuti oglasi za homepage
    // GET /api/ads/featured
    // ==========================================
    public function featured(): JsonResponse
    {
        $ads = Ad::with(['city', 'make', 'vehicleModel', 'primaryImage', 'user'])
            ->where('status', 'active')
            ->where('featured', true)
            ->where('featured_until', '>', now())
            ->orderBy('created_at', 'desc')
            ->take(8)
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

        // Aktivni oglasi su vidljivi svima
        // Pending/inactive/rejected oglasi su vidljivi samo vlasniku, adminu i moderatoru
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
        // DB::transaction osigurava da ili sve bude snimljeno ili ništa
        // Ako upload slike padne, oglas se neće snimiti — nema pola-upola podataka
        $ad = DB::transaction(function () use ($request) {

            $ad = Ad::create([
                ...$request->safe()->except(['images', 'equipment']),
                'user_id'    => auth()->id(),
                'status'     => 'pending', // čeka moderaciju
                'expires_at' => now()->addDays(30),
                'currency'   => 'EUR',
            ]);

            // Snimi opremu u pivot tabelu ako je poslana
            if ($request->filled('equipment')) {
                $ad->equipment()->sync($request->equipment);
            }

            // Upload slika
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    // Snimi u storage/app/public/ads/{ad_id}/
                    $path = $image->store("ads/{$ad->id}", 'public');

                    AdImage::create([
                        'ad_id'      => $ad->id,
                        'path'       => $path,
                        'is_primary' => $index === 0, // prva slika je naslovna
                        'order'      => $index + 1,
                    ]);
                }
            }

            return $ad;
        });

        // Učitaj relacije za response
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
        DB::transaction(function () use ($request, $ad) {

            $ad->update($request->safe()->except([
                'images',
                'equipment',
                'delete_images',
                'primary_image_id',
            ]));

            // Ažuriraj opremu ako je poslana
            if ($request->has('equipment')) {
                $ad->equipment()->sync($request->equipment);
            }

            // Obriši slike koje je korisnik označio za brisanje
            if ($request->filled('delete_images')) {
                $imagesToDelete = AdImage::where('ad_id', $ad->id)
                    ->whereIn('id', $request->delete_images)
                    ->get();

                foreach ($imagesToDelete as $image) {
                    Storage::disk('public')->delete($image->path);
                    $image->delete();
                }
            }

            // Promijeni naslovnu sliku ako je traženo
            if ($request->filled('primary_image_id')) {
                // Skini is_primary sa svih slika ovog oglasa
                AdImage::where('ad_id', $ad->id)->update(['is_primary' => false]);
                // Postavi novu naslovnu
                AdImage::where('id', $request->primary_image_id)->update(['is_primary' => true]);
            }

            // Dodaj nove slike ako su poslane
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
    // DELETE /api/ads/{ad}
    // ==========================================
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $ad = Ad::findOrFail($id);

        // Samo vlasnik, admin ili moderator može obrisati
        if ($ad->user_id !== $user->id && !in_array($user->role, ['admin', 'moderator'])) {
            return response()->json(['message' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        // Obriši slike sa diska
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
    // MY ADS — oglasi prijavljenog korisnika
    // GET /api/my-ads
    // ==========================================
    public function myAds(Request $request): JsonResponse
    {
        $ads = Ad::with(['city', 'make', 'vehicleModel', 'primaryImage'])
            ->where('user_id', auth()->id())
            ->when(
                $request->filled('status'),
                fn($q) =>
                $q->where('status', $request->status)
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
    // MARK AS SOLD — označi oglas kao prodat
    // POST /api/ads/{ad}/sold
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
}
