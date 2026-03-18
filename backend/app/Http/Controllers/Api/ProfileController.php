<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use Illuminate\Http\Request;

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
            'company_name'  => 'nullable|string|max:255',
            'pib'           => 'nullable|string|max:20',
            'address'       => 'nullable|string|max:255',
            'city_id'       => 'nullable|exists:cities,id',
            'description'   => 'nullable|string|max:2000',
            'website'       => 'nullable|url|max:255',
            'working_hours' => 'nullable|string|max:255',
        ]);

        $profile = UserProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->only([
                'company_name', 'pib', 'address',
                'city_id', 'description', 'website', 'working_hours',
            ])
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
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar uspješno ažuriran.',
            'avatar'  => asset('storage/' . $path),
        ]);
    }
}
