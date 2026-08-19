<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
 
class ProfileController extends Controller
{
    // GET /api/profile
    public function show(Request $request)
    {
        $profile = $request->user()->profile()->with('city')->first();
 
        return response()->json([
            'user'    => $request->user(),
            'profile' => $profile,
        ]);
    }
 
    // PUT /api/profile
    public function update(Request $request)
    {
        $request->validate([
            'name'          => 'nullable|string|max:255',
            'phone'         => 'nullable|string|max:20',
            'company_name'  => 'nullable|string|max:255',
            'pib'           => 'nullable|string|max:20',
            'address'       => 'nullable|string|max:255',
            'city_id'       => 'nullable|exists:cities,id',
            'description'   => 'nullable|string|max:2000',
            'website'       => 'nullable|url|max:255',
            'working_hours' => 'nullable|string|max:255',
        ]);
 
        $nullify = fn($v) => ($v === '' || $v === null) ? null : $v;
 
        $request->user()->update([
            'name'  => $nullify($request->input('name')),
            'phone' => $nullify($request->input('phone')),
        ]);
 
        $profile = UserProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'company_name'  => $nullify($request->input('company_name')),
                'pib'           => $nullify($request->input('pib')),
                'address'       => $nullify($request->input('address')),
                'city_id'       => $nullify($request->input('city_id')),
                'description'   => $nullify($request->input('description')),
                'website'       => $nullify($request->input('website')),
                'working_hours' => $nullify($request->input('working_hours')),
            ]
        );
 
        return response()->json([
            'message' => 'Profil uspješno ažuriran.',
            'profile' => $profile,
        ]);
    }
 
    // POST /api/profile/avatar
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);
 
        $user = $request->user();
 
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
 
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);
 
        return response()->json([
            'message' => 'Avatar ažuriran.',
            'avatar'  => $path,
        ]);
    }
 
    // POST /api/profile/logo
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);
 
        $user    = $request->user();
        $profile = UserProfile::firstOrCreate(['user_id' => $user->id]);
 
        if ($profile->logo) {
            Storage::disk('public')->delete($profile->logo);
        }
 
        $path = $request->file('logo')->store('logos', 'public');
        $profile->update(['logo' => $path]);
 
        return response()->json([
            'message' => 'Logo ažuriran.',
            'logo'    => $path,
        ]);
    }
 
    // GET /api/profile/stats
    public function stats(Request $request)
    {
        $userId = $request->user()->id;
 
        $ads = Ad::where('user_id', $userId)->get();
 
        $topAds = Ad::where('user_id', $userId)
            ->orderByDesc('views_count')
            ->take(5)
            ->get(['id', 'title', 'views_count', 'status', 'slug']);
 
        return response()->json([
            'summary' => [
                'total'       => $ads->count(),
                'active'      => $ads->where('status', 'active')->count(),
                'pending'     => $ads->where('status', 'pending')->count(),
                'sold'        => $ads->where('status', 'sold')->count(),
                'expired'     => $ads->where('status', 'expired')->count(),
                'rejected'    => $ads->where('status', 'rejected')->count(),
                'total_views' => $ads->sum('views_count'),
            ],
            'top_ads' => $topAds,
        ]);
    }
}