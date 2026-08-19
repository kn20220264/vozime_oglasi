<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('vehicle_categories')->cascadeOnDelete();
            $table->foreignId('make_id')->constrained('makes')->cascadeOnDelete();
            $table->foreignId('model_id')->constrained('vehicle_models')->cascadeOnDelete();
            $table->foreignId('city_id')->constrained('cities')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('currency', 10)->default('EUR');
            $table->boolean('price_negotiable')->default(false);
            $table->year('year');
            $table->integer('mileage');
            $table->string('fuel_type', 80);
            $table->string('transmission', 80);
            $table->string('body_type', 80);
            $table->integer('power_kw')->nullable();
            $table->integer('engine_cc')->nullable();
            $table->string('color_exterior', 80)->nullable();
            $table->string('color_interior', 80)->nullable();
            $table->string('drive_type', 80)->nullable();
            $table->integer('doors')->nullable();
            $table->integer('seats')->nullable();
            $table->string('condition', 80)->default('polovnjak');
            $table->string('damage', 80)->default('neosteceno');
            $table->string('emission_class', 80)->nullable();
            $table->integer('owners_count')->nullable();
            $table->date('registered_until')->nullable();
            $table->string('vin')->nullable();
            $table->boolean('has_service_book')->default(false);
            $table->boolean('has_warranty')->default(false);
            $table->boolean('accepts_exchange')->default(false);
            $table->boolean('import')->default(false);
            $table->string('status', 20)->default('pending');
            $table->unsignedInteger('views_count')->default(0);
            $table->boolean('featured')->default(false);
            $table->boolean('pinned')->default(false);
            $table->timestamp('featured_until')->nullable();
            $table->timestamp('pinned_until')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};