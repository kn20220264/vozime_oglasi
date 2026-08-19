<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('phone2')->nullable();
            $table->boolean('is_brand_representative')->default(false);
            $table->json('brands_represented')->nullable();
            $table->enum('premium_addon', ['none', 'premium1', 'premium2'])->default('none');

            // Obračun — firma
            $table->enum('billing_type', ['company', 'personal'])->nullable();
            $table->string('billing_company_name')->nullable();
            $table->string('billing_account_number')->nullable();
            $table->string('billing_pib')->nullable();
            $table->string('billing_vat_number')->nullable();
            $table->string('billing_company_address')->nullable();
            $table->string('billing_company_city')->nullable();
            $table->string('billing_company_phone')->nullable();
            $table->string('billing_company_email')->nullable();
            $table->string('billing_invoice_email')->nullable();

            // Obračun — fizičko lice
            $table->string('billing_personal_name')->nullable();
            $table->string('billing_personal_surname')->nullable();
            $table->string('billing_jmbg')->nullable();
            $table->string('billing_personal_address')->nullable();
            $table->string('billing_personal_city')->nullable();

            // Kontakt lice (za customer support)
            $table->string('contact_name')->nullable();
            $table->string('contact_surname')->nullable();
            $table->string('contact_phone')->nullable();
            $table->boolean('contact_whatsapp')->default(false);
            $table->boolean('contact_viber')->default(false);
            $table->string('contact_email')->nullable();

            // Metod plaćanja
            $table->enum('payment_method', ['virman', 'card'])->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'phone2', 'is_brand_representative', 'brands_represented', 'premium_addon',
                'billing_type', 'billing_company_name', 'billing_account_number', 'billing_pib',
                'billing_vat_number', 'billing_company_address', 'billing_company_city',
                'billing_company_phone', 'billing_company_email', 'billing_invoice_email',
                'billing_personal_name', 'billing_personal_surname', 'billing_jmbg',
                'billing_personal_address', 'billing_personal_city',
                'contact_name', 'contact_surname', 'contact_phone',
                'contact_whatsapp', 'contact_viber', 'contact_email',
                'payment_method',
            ]);
        });
    }
};
