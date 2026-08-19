<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'pib',
        'address',
        'city_id',
        'description',
        'logo',
        'banner',
        'website',
        'working_hours',

        // Dealer — osnovne info
        'phone2',
        'is_brand_representative',
        'brands_represented',
        'dealer_categories',
        'premium_addon',

        // Obračun
        'billing_type',
        'billing_company_name',
        'billing_account_number',
        'billing_pib',
        'billing_vat_number',
        'billing_company_address',
        'billing_company_city',
        'billing_company_phone',
        'billing_company_email',
        'billing_invoice_email',
        'billing_personal_name',
        'billing_personal_surname',
        'billing_jmbg',
        'billing_personal_address',
        'billing_personal_city',

        // Kontakt lice
        'contact_name',
        'contact_surname',
        'contact_phone',
        'contact_whatsapp',
        'contact_viber',
        'contact_email',

        // Plaćanje
        'payment_method',
    ];

    protected $casts = [
        'brands_represented'     => 'array',
        'dealer_categories' => 'array',
        'is_brand_representative' => 'boolean',
        'contact_whatsapp'       => 'boolean',
        'contact_viber'          => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
