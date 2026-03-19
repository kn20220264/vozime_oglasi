<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
                'avatar'     => $user->avatar,
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
        $ads = Ad::with(['city', 'make', 'vehicleModel', 'primaryImage'])
            ->where('user_id', $id)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json([
            'data' => $ads->items(),
            'meta' => [
                'current_page' => $ads->currentPage(),
                'last_page'    => $ads->lastPage(),
                'total'        => $ads->total(),
            ]
        ]);
    }
}