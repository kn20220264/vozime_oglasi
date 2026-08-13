<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\UserPackage;
use App\Models\Payment;
use App\Models\Ad;
use App\Models\Setting;
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

        // ad_boost paket zahtijeva ad_id koji pripada korisniku
        if ($package->type === 'ad_boost') {
            if (!$request->ad_id) {
                return response()->json(['message' => 'Morate odabrati oglas za ovaj paket.'], 422);
            }
            Ad::where('id', $request->ad_id)->where('user_id', $user->id)->firstOrFail();
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

        // Kreiraj payment zapis — referenca je kratka: VM-{id uplate}
        $payment = Payment::create([
            'user_id'         => $user->id,
            'user_package_id' => $userPackage->id,
            'amount'          => $isFree ? 0 : $package->price,
            'currency'        => 'EUR',
            'gateway'         => $request->gateway,
            'payment_method'  => $isFree ? 'free' : $request->gateway,
            'status'          => 'pending',
        ]);

        $reference = 'VM-' . $payment->id;
        $payment->update(['reference' => $reference]);

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
                'svrha_uplate'    => $reference . ' - ' . $package->name,
                'info'            => Setting::get('bank_info', 'Navedite svrhu uplate kako bismo identifikovali uplatu.'),
                'payment_id'      => $payment->id,
            ];
        }

        return response()->json($response, 201);
    }

    // GET /api/my-pending-payments — uplatnice na čekanju, za ponovni prikaz podataka
    public function myPendingPayments(Request $request)
    {
        $payments = Payment::with(['userPackage.package'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->where('gateway', 'bank_transfer')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($p) {
                $pkg     = $p->userPackage?->package;
                $isAddon = str_starts_with($p->admin_note ?? '', 'dealer_addon:');
                $label   = $pkg?->name
                    ?? ($isAddon
                        ? (DealerAddonController::ADDON_LABELS[str_replace('dealer_addon:', '', $p->admin_note)] ?? 'Premium doplata')
                        : 'Uplata');

                return [
                    'payment_id'      => $p->id,
                    'user_package_id' => $p->user_package_id,
                    'reference'       => $p->reference,
                    'amount'          => $p->amount,
                    'package_name'    => $label,
                    'package_type'    => $pkg?->type,
                    'ad_id'           => $p->userPackage?->ad_id,
                    'created_at'      => $p->created_at,
                    'bank_details'    => [
                        'naziv_korisnika' => Setting::get('bank_naziv', 'BEBOLD DOO BAR'),
                        'banka'           => Setting::get('bank_banka', 'CKB banka'),
                        'ziro_racun'      => Setting::get('bank_racun', 'XXX-XXXX-XXXX'),
                        'iznos'           => number_format($p->amount, 2) . ' EUR',
                        'svrha_uplate'    => $p->reference . ' - ' . $label,
                        'info'            => Setting::get('bank_info', 'Navedite svrhu uplate kako bismo identifikovali uplatu.'),
                        'payment_id'      => $p->id,
                    ],
                ];
            });

        return response()->json(['data' => $payments]);
    }

    // POST /api/payments/{id}/cancel — korisnik odustaje od uplate prije plaćanja
    public function cancelPayment(Request $request, int $id)
    {
        $payment = Payment::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'Ova uplata se ne može poništiti.'], 422);
        }

        // Obriši i vezani user_package (nije plaćen, pa ne smije ostati)
        if ($payment->user_package_id) {
            UserPackage::where('id', $payment->user_package_id)
                ->whereNull('paid_at')
                ->delete();
        }

        $payment->delete();

        return response()->json(['message' => 'Narudžba je poništena.']);
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
