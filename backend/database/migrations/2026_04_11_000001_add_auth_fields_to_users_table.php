<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ime i prezime — odvojeno pored postojećeg 'name'
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');

            // OAuth polja — za Google i Apple (implementacija naknadno)
            $table->string('google_id')->nullable()->after('avatar');
            $table->string('apple_id')->nullable()->after('google_id');

            // Kanal registracije — email je default, ostalo se dodaje naknadno
            $table->enum('auth_provider', ['email', 'phone', 'google', 'apple'])
                  ->default('email')
                  ->after('apple_id');

            // Phone unique — dodajemo index naknadno kad se aktivira phone auth
            // Za sad ostaje nullable bez unique constraint
            // TODO: $table->unique('phone'); — aktivirati kad se uvede phone registracija
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'google_id',
                'apple_id',
                'auth_provider',
            ]);
        });
    }
};