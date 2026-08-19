php<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            // tip paketa: ad_boost = za oglas, account = za nalog
            $table->enum('type', ['ad_boost', 'account'])->default('ad_boost')->after('name');
            // max aktivnih oglasa (samo za account pakete)
            $table->integer('max_active_ads')->nullable()->after('max_images');
            // refresh interval u danima (samo za ad_boost pakete)
            $table->integer('refresh_days')->nullable()->after('max_active_ads');
            // premium prodavac oznaka (samo za account pakete)
            $table->boolean('premium_seller')->default(false)->after('refresh_days');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['type', 'max_active_ads', 'refresh_days', 'premium_seller']);
        });
    }
};