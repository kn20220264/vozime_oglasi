<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            // Kompozitni indeks za glavni listing query (status + sortiranje po datumu)
            $table->index(['status', 'created_at'], 'ads_status_created_at_idx');

            // Kompozitni indeks za featured oglase (homepage + listing)
            $table->index(['status', 'featured', 'created_at'], 'ads_status_featured_created_at_idx');

            // Filteri — pojedinačni indeksi
            $table->index('price',        'ads_price_idx');
            $table->index('year',         'ads_year_idx');
            $table->index('mileage',      'ads_mileage_idx');
            $table->index('fuel_type',    'ads_fuel_type_idx');
            $table->index('transmission', 'ads_transmission_idx');
            $table->index('body_type',    'ads_body_type_idx');
            $table->index('condition',    'ads_condition_idx');
            $table->index('damage',       'ads_damage_idx');
            $table->index('drive_type',   'ads_drive_type_idx');
            $table->index('power_kw',     'ads_power_kw_idx');
            $table->index('views_count',  'ads_views_count_idx');
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropIndex('ads_status_created_at_idx');
            $table->dropIndex('ads_status_featured_created_at_idx');
            $table->dropIndex('ads_price_idx');
            $table->dropIndex('ads_year_idx');
            $table->dropIndex('ads_mileage_idx');
            $table->dropIndex('ads_fuel_type_idx');
            $table->dropIndex('ads_transmission_idx');
            $table->dropIndex('ads_body_type_idx');
            $table->dropIndex('ads_condition_idx');
            $table->dropIndex('ads_damage_idx');
            $table->dropIndex('ads_drive_type_idx');
            $table->dropIndex('ads_power_kw_idx');
            $table->dropIndex('ads_views_count_idx');
        });
    }
};