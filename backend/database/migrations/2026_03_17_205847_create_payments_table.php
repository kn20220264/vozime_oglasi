<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->foreignId('user_package_id')
                  ->constrained('user_packages')
                  ->cascadeOnDelete();
            $table->decimal('amount', 8, 2);
            $table->string('currency')->default('EUR');
            $table->enum('gateway', ['stripe', 'paypal', 'cash'])
                  ->default('cash');
            $table->enum('status', ['pending', 'completed', 'failed'])
                  ->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};