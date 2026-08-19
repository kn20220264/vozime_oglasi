<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Napomena admina pri ručnoj potvrdi
            $table->text('admin_note')->nullable()->after('status');
            // Ko je potvrdio uplatu
            $table->unsignedBigInteger('confirmed_by')->nullable()->after('admin_note');
            $table->foreign('confirmed_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable()->after('confirmed_by');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['confirmed_by']);
            $table->dropColumn(['admin_note', 'confirmed_by', 'confirmed_at']);
        });
    }
};