<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Dodaj 'dealer' u type enum
        DB::statement("ALTER TABLE packages MODIFY type ENUM('ad_boost', 'account', 'dealer') DEFAULT 'ad_boost'");

        Schema::table('packages', function (Blueprint $table) {
            $table->integer('gratis_premium_ads')->nullable()->after('max_active_ads');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('gratis_premium_ads');
        });

        DB::statement("ALTER TABLE packages MODIFY type ENUM('ad_boost', 'account') DEFAULT 'ad_boost'");
    }
};
