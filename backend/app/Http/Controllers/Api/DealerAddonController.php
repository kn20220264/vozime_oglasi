<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\UserProfile;
use Illuminate\Http\Request;

class DealerAddonController extends Controller
{
    // Cijene addona
    const ADDON_PRICES = [
        'premium1' => 10.00,
        'premium2' => 20.00,
    ];

    const ADDON_LABELS = [
        'premium1' => 'Premium 1 — Oznaka prodavca',
        'premium2' => 'Premium 2 — Oznaka + Početna stranica',
    ];

    // POST /dealer/addon
    public function purchase(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'dealer') {
            return response()->json(['message' => 'Samo dealer nalozi mogu kupiti addon.'], 403);
        }

        $request->validate([
            'addon' => 'required|in:premium1,premium2',
        ]);

        $addon    = $request->addon;
        $price    = self::ADDON_PRICES[$addon];
        $label    = self::ADDON_LABELS[$addon];

        // Kreiraj payment zapis (bez user_package — addon nije paket)
        $payment = Payment::create([
            'user_id'         => $user->id,
            'user_package_id' => null,
            'amount'          => $price,
            'currency'        => 'EUR',
            'gateway'         => 'bank_transfer',
            'payment_method'  => 'virman',
            'status'          => 'pending',
            'admin_note'      => 'dealer_addon:' . $addon,
        ]);

        $reference = 'VM-' . $payment->id;
        $payment->update(['reference' => $reference]);

        return response()->json([
            'message'   => 'Narudžba primljena. Addon će biti aktiviran nakon potvrde uplate.',
            'reference' => $reference,
            'addon'     => $addon,
            'bank_details' => [
                'naziv_korisnika' => Setting::get('bank_naziv', 'BEBOLD DOO BAR'),
                'banka'           => Setting::get('bank_banka', 'CKB banka'),
                'ziro_racun'      => Setting::get('bank_racun', 'XXX-XXXX-XXXX'),
                'iznos'           => number_format($price, 2) . ' EUR',
                'svrha_uplate'    => $reference . ' - ' . $label,
                'payment_id'      => $payment->id,
            ],
        ], 201);
    }

    // GET /dealer/addon/status — trenutni addon status dealera
    public function status(Request $request)
    {
        $user    = $request->user();
        $profile = $user->profile;

        // Provjeri da li postoji pending addon payment
        $pendingPayment = Payment::where('user_id', $user->id)
            ->where('status', 'pending')
            ->where('admin_note', 'like', 'dealer_addon:%')
            ->latest()
            ->first();

        $pendingAddon = null;
        if ($pendingPayment) {
            $pendingAddon = str_replace('dealer_addon:', '', $pendingPayment->admin_note);
        }

        return response()->json([
            'current_addon' => $profile?->premium_addon ?? 'none',
            'pending_addon' => $pendingAddon,
            'pending_reference' => $pendingPayment?->reference,
        ]);
    }
}