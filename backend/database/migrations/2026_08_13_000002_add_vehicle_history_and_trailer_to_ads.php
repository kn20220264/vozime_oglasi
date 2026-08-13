<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            // Istorija vozila — lista vrijednosti iz filter_options (filter_type = vehicle_history)
            $table->json('vehicle_history')->nullable()->after('import');
            // Kuka za prikolicu — tip (Fiksna, Odvojna, Okretna) ili null ako nema
            $table->string('trailer_coupling', 50)->nullable()->after('vehicle_history');
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn(['vehicle_history', 'trailer_coupling']);
        });
    }
};
