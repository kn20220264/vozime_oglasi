<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdResource;
use App\Models\User;
use App\Models\Ad;
use Illuminate\Http\JsonResponse;

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

    // Oglasi korisnika — koristi AdResource da bi AdCard dobio ispravan primary_image
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

    // Dileri/autoplaci za slider na homepageu
    public function dealers(): JsonResponse
    {
        $dealers = User::with('profile.city')
            ->where('role', 'dealer')
            ->where('is_active', true)
            ->get()
            ->map(function ($user) {
                $adsCount = Ad::where('user_id', $user->id)
                              ->where('status', 'active')
                              ->count();

                return [
                    'id'           => $user->id,
                    'name'         => $user->name,
                    'logo'         => $user->profile?->logo
                                        ? asset('storage/' . $user->profile->logo)
                                        : null,
                    'company_name' => $user->profile?->company_name ?? $user->name,
                    'city'         => $user->profile?->city?->name,
                    'ads_count'    => $adsCount,
                    'featured'     => $user->profile?->featured ?? false,
                ];
            })
            ->sortByDesc('featured')
            ->sortByDesc('ads_count')
            ->values();

        return response()->json(['data' => $dealers]);
    }
}