<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Ad;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    // GET /api/favorites
    public function index(Request $request)
    {
        $favorites = Favorite::with(['ad.make', 'ad.vehicleModel', 'ad.primaryImage', 'ad.city'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($favorites);
    }

    // POST /api/favorites/{adId}
    public function toggle(Request $request, int $adId)
    {
        Ad::findOrFail($adId);

        $existing = Favorite::where('user_id', $request->user()->id)
            ->where('ad_id', $adId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['message' => 'Uklonjeno iz omiljenih.', 'favorited' => false]);
        }

        Favorite::create([
            'user_id' => $request->user()->id,
            'ad_id'   => $adId,
        ]);

        return response()->json(['message' => 'Dodano u omiljene.', 'favorited' => true]);
    }

    // GET /api/favorites/{adId}/check
    public function check(Request $request, int $adId)
    {
        $favorited = Favorite::where('user_id', $request->user()->id)
            ->where('ad_id', $adId)
            ->exists();

        return response()->json(['favorited' => $favorited]);
    }
}