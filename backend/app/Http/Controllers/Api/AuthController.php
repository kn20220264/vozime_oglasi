<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Payment;
use App\Models\User;
use App\Models\UserPackage;
use App\Models\UserProfile;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    // ═══════════════════════════════════════════════════════
    // REGISTRACIJA — email + lozinka
    // ═══════════════════════════════════════════════════════

    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:8|confirmed',
            'phone'      => 'nullable|string|max:20',
        ]);

        $fullName = trim($request->first_name . ' ' . $request->last_name);

        $user = User::create([
            'name'          => $fullName,
            'first_name'    => $request->first_name,
            'last_name'     => $request->last_name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'phone'         => $request->phone,
            'role'          => 'user',
            'is_active'     => true,
            'auth_provider' => 'email',
        ]);

        UserProfile::create(['user_id' => $user->id]);
        $this->assignFreePackage($user);

        event(new Registered($user));

        return response()->json([
            'message' => 'Registracija uspješna. Provjerite email i potvrdite nalog.',
            'user'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
                'role'       => $user->role,
            ],
        ], 201);
    }

    // ═══════════════════════════════════════════════════════
    // LOGIN — email + lozinka
    // ═══════════════════════════════════════════════════════

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Pogrešan email ili lozinka.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Vaš nalog je deaktiviran. Kontaktirajte podršku.',
            ], 403);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message'          => 'Email adresa nije verifikovana. Provjerite inbox.',
                'email_unverified' => true,
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Uspješno ste se prijavili.',
            'user'    => $user->load('profile'),
            'token'   => $token,
        ]);
    }

    // ═══════════════════════════════════════════════════════
    // EMAIL VERIFIKACIJA
    // ═══════════════════════════════════════════════════════

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), (string) $hash)) {
            return response()->json(['message' => 'Nevažeći verifikacioni link.'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email je već verifikovan.'], 200);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email uspješno verifikovan. Možete se prijaviti.']);
    }

    public function resendVerification(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Ako nalog postoji, poslali smo novi link.']);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email je već verifikovan.'], 422);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Novi verifikacioni email je poslan.']);
    }

    // ═══════════════════════════════════════════════════════
    // GOOGLE OAUTH
    // ═══════════════════════════════════════════════════════

    // GET /api/auth/google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    // GET /api/auth/google/callback
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=google_failed');
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            if (!$user->google_id) {
                $user->update([
                    'google_id'     => $googleUser->getId(),
                    'auth_provider' => 'google',
                ]);
            }

            if (!$user->is_active) {
                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=account_disabled');
            }

            if (!$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }
        } else {
            $nameParts = explode(' ', $googleUser->getName(), 2);
            $firstName = $nameParts[0] ?? '';
            $lastName  = $nameParts[1] ?? '';

            $user = User::create([
                'name'              => $googleUser->getName(),
                'first_name'        => $firstName,
                'last_name'         => $lastName,
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'avatar'            => $googleUser->getAvatar(),
                'password'          => Hash::make(Str::random(32)),
                'role'              => 'user',
                'is_active'         => true,
                'auth_provider'     => 'google',
                'email_verified_at' => now(),
            ]);

            UserProfile::create(['user_id' => $user->id]);
            $this->assignFreePackage($user);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        return redirect("{$frontendUrl}/auth/google/callback?token={$token}");
    }

    // ═══════════════════════════════════════════════════════
    // HELPER — dodjeli FREE paket novom korisniku
    // ═══════════════════════════════════════════════════════

    private function assignFreePackage(User $user): void
    {
        $free = Package::where('type', 'account')
                       ->where('name', 'FREE')
                       ->where('is_active', true)
                       ->first();

        if (!$free) return;

        $userPackage = UserPackage::create([
            'user_id'    => $user->id,
            'ad_id'      => null,
            'package_id' => $free->id,
            'paid_at'    => now(),
            'expires_at' => now()->addDays($free->duration_days),
        ]);

        Payment::create([
            'user_id'         => $user->id,
            'user_package_id' => $userPackage->id,
            'amount'          => 0,
            'currency'        => 'EUR',
            'gateway'         => 'admin_grant',
            'payment_method'  => 'admin_grant',
            'reference'       => 'FREE-' . strtoupper(Str::random(6)),
            'status'          => 'completed',
        ]);
    }

    // ═══════════════════════════════════════════════════════
    // LOGOUT
    // ═══════════════════════════════════════════════════════

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Uspješno ste se odjavili.']);
    }

    // ═══════════════════════════════════════════════════════
    // ME
    // ═══════════════════════════════════════════════════════

    public function me(Request $request)
    {
        return response()->json($request->user()->load('profile.city'));
    }

    // ═══════════════════════════════════════════════════════
    // TODO: PHONE AUTH — implementirati uz Infobip
    // public function registerWithPhone(Request $request) { ... }
    // public function loginWithPhone(Request $request) { ... }
    // public function verifyPhone(Request $request) { ... }

    // TODO: APPLE OAUTH — potreban Apple Developer account
    // public function redirectToApple() { ... }
    // public function handleAppleCallback() { ... }

    // TODO: DEALER AUTH — implementirati naknadno
    // public function registerDealer(Request $request) { ... }
    // public function loginDealer(Request $request) { ... }
    // ═══════════════════════════════════════════════════════
}