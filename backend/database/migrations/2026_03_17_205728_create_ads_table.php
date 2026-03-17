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
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->foreignId('category_id')
                  ->constrained('vehicle_categories')
                  ->cascadeOnDelete();
            $table->foreignId('make_id')
                  ->constrained('makes')
                  ->cascadeOnDelete();
            $table->foreignId('model_id')
                  ->constrained('vehicle_models')
                  ->cascadeOnDelete();
            $table->foreignId('city_id')
                  ->constrained('cities')
                  ->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->enum('currency', ['EUR', 'KM', 'RSD'])->default('EUR');
            $table->boolean('price_negotiable')->default(false);
            $table->year('year');
            $table->integer('mileage');
            $table->enum('fuel_type', [
                'benzin', 'dizel', 'hibrid', 
                'elektro', 'plin', 'benzin+plin'
            ]);
            $table->enum('transmission', [
                'manuelni', 'automatik', 'poluautomatik'
            ]);
            $table->enum('body_type', [
                'sedan', 'karavan', 'suv', 'hatchback',
                'coupe', 'kabrio', 'van', 'pickup'
            ]);
            $table->integer('power_kw')->nullable();
            $table->integer('engine_cc')->nullable();
            $table->string('color_exterior')->nullable();
            $table->string('color_interior')->nullable();
            $table->enum('drive_type', [
                'prednji', 'zadnji', '4x4'
            ])->nullable();
            $table->integer('doors')->nullable();
            $table->integer('seats')->nullable();
            $table->enum('condition', ['novo', 'polovnjak'])->default('polovnjak');
            $table->enum('damage', [
                'neosteceno', 'osteceno', 'nije_vozno'
            ])->default('neosteceno');
            $table->enum('emission_class', [
                'euro3', 'euro4', 'euro5', 'euro6'
            ])->nullable();
            $table->integer('owners_count')->nullable();
            $table->date('registered_until')->nullable();
            $table->string('vin')->nullable();
            $table->boolean('has_service_book')->default(false);
            $table->boolean('has_warranty')->default(false);
            $table->boolean('accepts_exchange')->default(false);
            $table->boolean('import')->default(false);
            $table->enum('status', [
                'pending', 'active', 
                'inactive', 'sold', 
                'rejected', 'expired'
            ])->default('pending');
            $table->unsignedInteger('views_count')->default(0);
            $table->boolean('featured')->default(false);
            $table->timestamp('featured_until')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};
