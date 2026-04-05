<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\UserPackage;
use App\Models\Payment;
use App\Models\Ad;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    // GET /api/packages — javno, svi aktivni paketi
    public function index(Request $request)
    {
        $packages = Package::where('is_active', true)
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->orderBy('price')
            ->get();

        return response()->json($packages);
    }

    // POST /api/packages/purchase
    public function purchase(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'ad_id'      => 'nullable|exists:ads,id',
            'gateway'    => 'required|in:wspay,bank_transfer',
        ]);

        $package = Package::findOrFail($request->package_id);
        $user    = $request->user();

        // ad_boost paket zahtijeva ad_id
        if ($package->type === 'ad_boost') {
            if (!$request->ad_id) {
                return response()->json([
                    'message' => 'Morate odabrati oglas za ovaj paket.'
                ], 422);
            }

            // Provjeri da oglas pripada korisniku
            $ad = Ad::where('id', $request->ad_id)
                ->where('user_id', $user->id)
                ->firstOrFail();
        }

        // Kreiraj user_package
        $userPackage = UserPackage::create([
            'user_id'    => $user->id,
            'ad_id'      => $request->ad_id,
            'package_id' => $package->id,
            'paid_at'    => $request->gateway === 'bank_transfer' ? null : now(),
            'expires_at' => $request->gateway === 'bank_transfer'
                ? null  // aktivira se tek kad admin potvrdi uplatu
                : now()->addDays($package->duration_days),
        ]);

        // Kreiraj payment zapis
        $payment = Payment::create([
            'user_id'         => $user->id,
            'user_package_id' => $userPackage->id,
            'amount'          => $package->price,
            'currency'        => 'EUR',
            'gateway'         => $request->gateway,
            // wspay: pending dok se ne dobije callback
            // bank_transfer: pending dok admin ne potvrdi
            'status'          => 'pending',
        ]);

        // Ako je WSPay, odmah aktiviramo (simulacija — u produkciji čekamo callback)
        // Za sada tretiramo wspay kao direktnu potvrdu u dev okruženju
        if ($request->gateway === 'wspay') {
            $this->activatePackage($userPackage, $package);
            $payment->update(['status' => 'completed']);
        }

        $response = [
            'message'      => $request->gateway === 'bank_transfer'
                ? 'Narudžba primljena. Aktiviraćemo paket nakon potvrde uplate.'
                : 'Paket uspješno aktiviran.',
            'user_package' => $userPackage->load('package'),
            'payment'      => $payment,
        ];

        // Žiro račun — dodaj instrukcije za uplatu
        if ($request->gateway === 'bank_transfer') {
            // Svrha uplate: šifra oglasa ako je ad_boost, inače šifra user_package
            $svrha = isset($ad) && $ad->ad_code
                ? $ad->ad_code
                : 'PAK-' . $userPackage->id;

            $response['bank_details'] = [
                'primalac'      => 'BEBOLD DOO BAR',
                'ziro_racun'    => '1234567890001',
                'iznos'         => $package->price . ' EUR',
                'svrha_uplate'  => $svrha,
                'poziv_na_broj' => 'PAK-' . str_pad($userPackage->id, 6, '0', STR_PAD_LEFT),
                'napomena'      => 'Molimo navedite svrhu uplate kako bismo identifikovali uplatu. Paket će biti aktiviran u roku od 1–2 radna dana.',
            ];
        }

        return response()->json($response, 201);
    }

    // GET /api/my-packages
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

    // Privatna metoda za aktivaciju paketa
    private function activatePackage(UserPackage $userPackage, Package $package): void
    {
        $userPackage->update([
            'paid_at'    => now(),
            'expires_at' => now()->addDays($package->duration_days),
        ]);

        // Ako je ad_boost — ažuriraj oglas
        if ($package->type === 'ad_boost' && $userPackage->ad_id) {
            Ad::where('id', $userPackage->ad_id)->update([
                'featured'       => true,
                'featured_until' => now()->addDays($package->duration_days),
                'status'         => 'active',
            ]);
        }
    }
}