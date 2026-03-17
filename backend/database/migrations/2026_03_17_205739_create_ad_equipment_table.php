<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_equipment', function (Blueprint $table) {
            $table->foreignId('ad_id')
                  ->constrained('ads')
                  ->cascadeOnDelete();
            $table->foreignId('equipment_id')
                  ->constrained('equipment')
                  ->cascadeOnDelete();
            $table->primary(['ad_id', 'equipment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_equipment');
    }
};