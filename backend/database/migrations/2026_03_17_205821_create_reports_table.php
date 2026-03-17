<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->foreignId('ad_id')
                  ->constrained('ads')
                  ->cascadeOnDelete();
            $table->enum('reason', [
                'spam', 'lazno', 'duplikat', 'ostalo'
            ]);
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'resolved'])
                  ->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};