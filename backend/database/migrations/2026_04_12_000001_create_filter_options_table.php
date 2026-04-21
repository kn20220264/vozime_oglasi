<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filter_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->foreign('parent_id')->references('id')->on('filter_options')->onDelete('cascade');

            // Kojoj kategoriji vozila pripada (null = sve kategorije)
            $table->string('category', 50)->nullable()->index();
            // Tip filtera: fuel_type, body_type, transmission, drive_type,
            //              color, seat_material, condition, emission_class,
            //              damage, currency, boat_type, transport_type, ...
            $table->string('filter_type', 80)->index();
            // Slug vrijednost koja se čuva u bazi oglasa (npr. "benzin")
            $table->string('value', 100);
            // Labela koja se prikazuje korisniku (npr. "Benzin")
            $table->string('label', 150);
            // Redoslijed prikaza (drag & drop)
            $table->unsignedSmallInteger('sort_order')->default(0);
            // Da li je aktivna opcija
            $table->boolean('is_active')->default(true);
            // Dodatni podaci: hex boja, ikonica, opis, itd.
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Sprječava duplikate iste vrijednosti u istoj kategoriji/tipu
            $table->unique(['category', 'filter_type', 'value'], 'filter_options_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filter_options');
    }
};