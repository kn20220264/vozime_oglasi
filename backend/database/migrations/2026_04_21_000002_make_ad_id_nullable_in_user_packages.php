<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_packages', function (Blueprint $table) {
            // ad_id je opciono za account pakete (FREE/STANDARD/MAX)
            $table->foreignId('ad_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('user_packages', function (Blueprint $table) {
            $table->foreignId('ad_id')->nullable(false)->change();
        });
    }
};
