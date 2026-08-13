<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Make;
use App\Models\Package;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserPackage;
use App\Models\UserProfile;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class DealerAuthController extends Controller
{
    // POST /register/dealer
    public function register(Request $request)
    {
        $request->validate([
            // Auto plac
            'company_name'            => 'required|string|max:255',
            'address'                 => 'required|string|max:255',
            'city_id'                 => 'required|exists:cities,id',
            'phone'                   => 'required|string|max:30',
            'phone2'                  => 'nullable|string|max:30',
            'is_brand_representative' => 'boolean',
            'brands_represented'      => 'nullable|array',
            'brands_represented.*'    => 'integer|exists:makes,id',
            'dealer_categories' => 'nullable|array',
            'dealer_categories.*' => 'integer|between:1,4',

            // Obračun
            'billing_type'             => ['required', Rule::in(['company', 'personal'])],
            'billing_company_name'     => 'required_if:billing_type,company|nullable|string|max:255',
            'billing_account_number'   => 'required_if:billing_type,company|nullable|string|max:50',
            'billing_pib'              => 'required_if:billing_type,company|nullable|string|max:50',
            'billing_vat_number'       => 'nullable|string|max:50',
            'billing_company_address'  => 'required_if:billing_type,company|nullable|string|max:255',
            'billing_company_city'     => 'nullable|string|max:100',
            'billing_company_phone'    => 'nullable|string|max:30',
            'billing_company_email'    => 'nullable|email|max:255',
            'billing_invoice_email'    => 'nullable|email|max:255',
            'billing_personal_name'    => 'required_if:billing_type,personal|nullable|string|max:100',
            'billing_personal_surname' => 'required_if:billing_type,personal|nullable|string|max:100',
            'billing_jmbg'             => 'required_if:billing_type,personal|nullable|string|max:20',
            'billing_personal_address' => 'required_if:billing_type,personal|nullable|string|max:255',
            'billing_personal_city'    => 'nullable|string|max:100',

            // Kontakt + nalog
            'contact_name'    => 'required|string|max:100',
            'contact_surname' => 'required|string|max:100',
            'contact_phone'   => 'required|string|max:30',
            'contact_whatsapp' => 'boolean',
            'contact_viber'    => 'boolean',
            'contact_email'    => 'required|email|max:255|unique:users,email',

            // Metod plaćanja
            'payment_method' => ['required', Rule::in(['virman', 'card'])],

            // Paket
            'package_id' => 'nullable|integer|exists:packages,id',

            // Lozinka
            'password' => 'required|string|min:8|confirmed',
        ]);

        $package = $request->package_id
            ? Package::where('id', $request->package_id)->where('type', 'dealer')->where('is_active', true)->firstOrFail()
            : Package::where('type', 'dealer')->where('is_active', true)->where('price', 0)->firstOrFail();
            
        $user = null;
        $reference = null;

        DB::transaction(function () use ($request, $package, &$user, &$reference) {
        $user = User::create([
            'name'          => trim($request->contact_name . ' ' . $request->contact_surname),
            'first_name'    => $request->contact_name,
            'last_name'     => $request->contact_surname,
            'email'         => $request->contact_email,
            'password'      => Hash::make($request->password),
            'phone'         => $request->phone,
            'role'          => 'dealer',
            'is_active'     => true,
            'auth_provider' => 'email',
        ]);

        UserProfile::create([
            'user_id'                  => $user->id,
            'company_name'             => $request->company_name,
            'address'                  => $request->address,
            'city_id'                  => $request->city_id,
            'phone2'                   => $request->phone2,
            'is_brand_representative'  => $request->boolean('is_brand_representative'),
            'brands_represented'       => $request->is_brand_representative
                ? $request->brands_represented
                : null,
            'dealer_categories' => !empty($request->dealer_categories) ? $request->dealer_categories : [1, 2, 3, 4],
            'premium_addon'            => 'none',

            'billing_type'             => $request->billing_type,
            'billing_company_name'     => $request->billing_company_name,
            'billing_account_number'   => $request->billing_account_number,
            'billing_pib'              => $request->billing_pib,
            'billing_vat_number'       => $request->billing_vat_number,
            'billing_company_address'  => $request->billing_company_address,
            'billing_company_city'     => $request->billing_company_city,
            'billing_company_phone'    => $request->billing_company_phone,
            'billing_company_email'    => $request->billing_company_email,
            'billing_invoice_email'    => $request->billing_invoice_email,
            'billing_personal_name'    => $request->billing_personal_name,
            'billing_personal_surname' => $request->billing_personal_surname,
            'billing_jmbg'             => $request->billing_jmbg,
            'billing_personal_address' => $request->billing_personal_address,
            'billing_personal_city'    => $request->billing_personal_city,

            'contact_name'    => $request->contact_name,
            'contact_surname' => $request->contact_surname,
            'contact_phone'   => $request->contact_phone,
            'contact_whatsapp' => $request->boolean('contact_whatsapp'),
            'contact_viber'    => $request->boolean('contact_viber'),
            'contact_email'    => $request->contact_email,

            'payment_method' => $request->payment_method,
        ]);

        $reference = $this->assignPackage($user, $package, $request->payment_method);
        });

        event(new Registered($user));

        $isFree = $package->price == 0;

        $response = [
            'message' => 'Registracija uspješna! Provjerite email i potvrdite nalog.',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
            'is_free'   => $isFree,
            'package'   => [
                'name'  => $package->name,
                'price' => $package->price,
            ],
            'reference' => $reference,
        ];

        if (!$isFree) {
            $response['bank_details'] = [
                'naziv_korisnika' => Setting::get('bank_naziv', 'BEBOLD DOO BAR'),
                'banka'           => Setting::get('bank_banka', 'CKB banka'),
                'ziro_racun'      => Setting::get('bank_racun', 'XXX-XXXX-XXXX'),
                'iznos'           => number_format($package->price, 2) . ' EUR',
                'svrha_uplate'    => $reference . ' - ' . $package->name,
                'info'            => Setting::get('bank_info', 'Molimo navedite svrhu uplate kako bismo identifikovali uplatu.'),
            ];
        }

        return response()->json($response, 201);
    }

    // GET /dealer-packages — vraća dostupne dealer pakete za formu
    public function packages()
    {
        $packages = Package::where('type', 'dealer')
            ->where('is_active', true)
            ->orderBy('price')
            ->get();

        return response()->json(['data' => $packages]);
    }

    // Vraća referencu plaćanja
    private function assignPackage(User $user, Package $package, string $paymentMethod): string
    {
        $isFree = $package->price == 0;

        $userPackage = UserPackage::create([
            'user_id'    => $user->id,
            'ad_id'      => null,
            'package_id' => $package->id,
            'paid_at'    => $isFree ? now() : null,
            'expires_at' => now()->addDays($package->duration_days),
        ]);

        $payment = Payment::create([
            'user_id'         => $user->id,
            'user_package_id' => $userPackage->id,
            'amount'          => $package->price,
            'currency'        => 'EUR',
            'gateway'         => $isFree ? 'admin_grant' : 'bank_transfer',
            'payment_method'  => $isFree ? 'admin_grant' : $paymentMethod,
            'status'          => $isFree ? 'completed' : 'pending',
        ]);

        $reference = 'VM-' . $payment->id;
        $payment->update(['reference' => $reference]);

        return $reference;
    }
}
