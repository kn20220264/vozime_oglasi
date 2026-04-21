<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\UserPackage;
use App\Models\Payment;
use App\Models\Ad;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

    // GET /api/bank-settings — javni endpoint za instrukcije uplatnice
    public function bankSettings()
    {
        return response()->json([
            'naziv'   => Setting::get('bank_naziv', 'BEBOLD DOO BAR'),
            'racun'   => Setting::get('bank_racun', 'XXX-XXXX-XXXX'),
            'banka'   => Setting::get('bank_banka', 'CKB banka'),
            'info'    => Setting::get('bank_info',  'Molimo navedite svrhu uplate kako bismo identifikovali uplatu.'),
        ]);
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

        // Provjeri free_listing privilegiju
        $isFree = $user->hasPrivilege('free_listing') || $user->hasPrivilege('featured_bypass');

        $ad = null;

        // ad_boost paket zahtijeva ad_id koji pripada korisniku
        if ($package->type === 'ad_boost') {
            if (!$request->ad_id) {
                return response()->json(['message' => 'Morate odabrati oglas za ovaj paket.'], 422);
            }
            $ad = Ad::where('id', $request->ad_id)->where('user_id', $user->id)->firstOrFail();
        }

        // Generiši referencu za uplatu
        // Za ad_boost koristimo ad_code, za account generišemo ACC- kod
        if ($package->type === 'ad_boost' && $ad && $ad->ad_code) {
            $reference = $ad->ad_code;
        } else {
            $reference = 'ACC-' . strtoupper(Str::random(9));
        }

        // Kreiraj user_package
        $isBankPending = $request->gateway === 'bank_transfer' && !$isFree;
        $userPackage = UserPackage::create([
            'user_id'    => $user->id,
            'ad_id'      => $request->ad_id,
            'package_id' => $package->id,
            'paid_at'    => $isBankPending ? null : now(),
            'expires_at' => $isBankPending ? null : now()->addDays($package->duration_days),
        ]);

        // Kreiraj payment zapis
        $payment = Payment::create([
            'user_id'         => $user->id,
            'user_package_id' => $userPackage->id,
            'amount'          => $isFree ? 0 : $package->price,
            'currency'        => 'EUR',
            'gateway'         => $request->gateway,
            'payment_method'  => $isFree ? 'free' : $request->gateway,
            'reference'       => $reference,
            'status'          => 'pending',
        ]);

        // Aktivacija odmah: WSPay ili korisnik ima free privilegiju
        if ($request->gateway === 'wspay' || $isFree) {
            $this->activatePackage($userPackage, $package);
            $payment->update(['status' => 'completed']);
        }

        $response = [
            'message'      => $isBankPending
                ? 'Narudžba primljena. Aktiviraćemo paket nakon potvrde uplate.'
                : 'Paket uspješno aktiviran.',
            'user_package' => $userPackage->load('package'),
            'payment'      => $payment,
            'reference'    => $reference,
        ];

        // Instrukcije za uplatnicu iz baze settings
        if ($isBankPending) {
            $response['bank_details'] = [
                'naziv_korisnika' => Setting::get('bank_naziv', 'BEBOLD DOO BAR'),
                'banka'           => Setting::get('bank_banka', 'CKB banka'),
                'ziro_racun'      => Setting::get('bank_racun', 'XXX-XXXX-XXXX'),
                'iznos'           => $package->price . ' EUR',
                'svrha_uplate'    => $reference,
                'info'            => Setting::get('bank_info', 'Navedite svrhu uplate kako bismo identifikovali uplatu.'),
            ];
        }

        return response()->json($response, 201);
    }

    // GET /api/my-packages
    public function myPackages(Request $request)
    {
        $packages = UserPackage::with(['package', 'ad'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($up) {
                $up->is_active = $up->isActive();
                return $up;
            });

        return response()->json($packages);
    }

    // GET /api/my-payments
    public function myPayments(Request $request)
    {
        $payments = Payment::with(['userPackage.package'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($payments);
    }

    // Privatna metoda za aktivaciju paketa
    private function activatePackage(UserPackage $userPackage, Package $package): void
    {
        $userPackage->update([
            'paid_at'    => now(),
            'expires_at' => now()->addDays($package->duration_days),
        ]);

        if ($package->type === 'ad_boost' && $userPackage->ad_id) {
            Ad::where('id', $userPackage->ad_id)->update([
                'featured'       => true,
                'featured_until' => now()->addDays($package->duration_days),
                'status'         => 'active',
            ]);
        }
    }
}
