<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdResource;
use App\Models\Make;
use App\Models\User;
use App\Models\Ad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function show(int $id): JsonResponse
    {
        $user = User::with('profile.city')
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'role'       => $user->role,
                'avatar'     => $user->avatar
                    ? asset('storage/' . $user->avatar)
                    : null,
                'created_at' => $user->created_at,
                'profile'    => $user->profile ? [
                    'company_name'  => $user->profile->company_name,
                    'description'   => $user->profile->description,
                    'website'       => $user->profile->website,
                    'working_hours' => $user->profile->working_hours,
                    'logo'          => $user->profile->logo,
                    'city'          => $user->profile->city?->name,
                ] : null,
                'ads_count' => Ad::where('user_id', $user->id)
                    ->where('status', 'active')
                    ->count(),
            ]
        ]);
    }

    public function ads(int $id): JsonResponse
    {
        $ads = Ad::with(['city', 'make', 'vehicleModel', 'primaryImage', 'user'])
            ->where('user_id', $id)
            ->where('status', 'active')
            ->orderBy('featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json([
            'data' => AdResource::collection($ads),
            'meta' => [
                'current_page' => $ads->currentPage(),
                'last_page'    => $ads->lastPage(),
                'total'        => $ads->total(),
            ]
        ]);
    }

    // Dileri/autoplaci — javni endpoint sa filterima
    public function dealers(Request $request): JsonResponse
    {
        $dealers = User::with(['profile.city'])
            ->where('role', 'dealer')
            ->where('is_active', true)
            ->get()
            ->map(function ($user) {
                $adsCount = Ad::where('user_id', $user->id)
                    ->where('status', 'active')
                    ->count();

                // Kategorije iz aktivnih oglasa
                $profileCats = $user->profile?->dealer_categories;
                if (!is_null($profileCats)) {
                    $categoryIds = is_array($profileCats)
                        ? $profileCats
                        : json_decode($profileCats, true) ?? [];
                } else {
                    $categoryIds = Ad::where('user_id', $user->id)
                        ->where('status', 'active')
                        ->distinct()
                        ->pluck('category_id')
                        ->toArray();
                }

                // Brendovi zastupnika
                $brandsRepresented = [];
                if ($user->profile?->is_brand_representative && $user->profile->brands_represented) {
                    $brandIds = is_array($user->profile->brands_represented)
                        ? $user->profile->brands_represented
                        : json_decode($user->profile->brands_represented, true) ?? [];

                    $brandsRepresented = Make::whereIn('id', $brandIds)
                        ->get(['id', 'name', 'logo'])
                        ->map(fn($m) => [
                            'id'   => $m->id,
                            'name' => $m->name,
                            'logo' => $m->logo ? asset('storage/' . $m->logo) : null,
                        ])
                        ->toArray();
                }

                return [
                    'id'                      => $user->id,
                    'name'                    => $user->name,
                    'logo'                    => $user->profile?->logo
                        ? asset('storage/' . $user->profile->logo)
                        : null,
                    'company_name'            => $user->profile?->company_name ?? $user->name,
                    'city'                    => $user->profile?->city?->name,
                    'city_id'                 => $user->profile?->city_id,
                    'phone'                   => $user->phone,
                    'ads_count'               => $adsCount,
                    'premium_addon'           => $user->profile?->premium_addon ?? 'none',
                    'is_brand_representative' => $user->profile?->is_brand_representative ?? false,
                    'brands_represented'      => $brandsRepresented,
                    'category_ids'            => $categoryIds,
                ];
            })
            ->sortBy(function ($d) {
                $order = ['premium2' => 0, 'premium1' => 1, 'none' => 2];
                return $order[$d['premium_addon']] ?? 2;
            })
            ->values();

        return response()->json(['data' => $dealers]);
    }
}
