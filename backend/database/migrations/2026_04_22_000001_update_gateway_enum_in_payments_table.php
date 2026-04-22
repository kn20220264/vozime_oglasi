<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN gateway ENUM('stripe','paypal','cash','bank_transfer','wspay','admin_grant') NOT NULL DEFAULT 'cash'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN gateway ENUM('stripe','paypal','cash') NOT NULL DEFAULT 'cash'");
    }
};