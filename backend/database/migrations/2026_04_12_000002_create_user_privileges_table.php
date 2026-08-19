<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_privileges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('granted_by')->constrained('users')->cascadeOnDelete();

            // Ključ privilegije:
            // free_listing          — besplatan oglas (bypass plaćanja)
            // featured_bypass       — istaknuti oglas bez plaćanja
            // unlimited_listings    — neograničen broj aktivnih oglasa
            // verified_badge        — verified oznaka na profilu
            // custom_max_ads        — prilagođen max broj oglasa (vidi value)
            // custom_expiry_days    — prilagođeno trajanje oglasa u danima (vidi value)
            // dealer_features       — dealer funkcionalnosti bez dealer računa
            $table->string('privilege_key', 80);

            // Opcionalna vrijednost (npr. za custom_max_ads = "10")
            $table->string('privilege_value', 255)->nullable();

            // Opcionalni rok trajanja (null = trajno)
            $table->timestamp('expires_at')->nullable();

            // Napomena admina
            $table->text('note')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'privilege_key'], 'user_privileges_unique');
            $table->index('privilege_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_privileges');
    }
};