<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\UserPackage;
use App\Models\Payment;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    // GET /api/packages — javno, svi paketi
    public function index()
    {
        $packages = Package::where('is_active', true)
            ->orderBy('price')
            ->get();

        return response()->json($packages);
    }

    // POST /api/packages/purchase
    public function purchase(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'ad_id'      => 'required|exists:ads,id',
            'gateway'    => 'required|in:stripe,paypal,cash',
        ]);

        $package = Package::findOrFail($request->package_id);

        // Kreiraj user_package
        $userPackage = UserPackage::create([
            'user_id'    => $request->user()->id,
            'ad_id'      => $request->ad_id,
            'package_id' => $package->id,
            'paid_at'    => now(),
            'expires_at' => now()->addDays($package->duration_days),
        ]);

        // Kreiraj payment zapis
        Payment::create([
            'user_id'         => $request->user()->id,
            'user_package_id' => $userPackage->id,
            'amount'          => $package->price,
            'currency'        => 'EUR',
            'gateway'         => $request->gateway,
            'status'          => 'completed', // u produkciji: 'pending' dok Stripe ne potvrdi
        ]);

        // Ako je featured paket, ažuriraj oglas
        if ($package->featured) {
            \App\Models\Ad::where('id', $request->ad_id)
                ->where('user_id', $request->user()->id)
                ->update([
                    'featured'       => true,
                    'featured_until' => now()->addDays($package->duration_days),
                    'status'         => 'active',
                ]);
        }

        return response()->json([
            'message'      => 'Paket uspješno aktiviran.',
            'user_package' => $userPackage->load('package'),
        ], 201);
    }

    // GET /api/my-packages — aktivni paketi korisnika
    public function myPackages(Request $request)
    {
        $packages = UserPackage::with(['package', 'ad.primaryImage'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($up) {
                $up->is_active = $up->isActive();
                return $up;
            });

        return response()->json($packages);
    }
}