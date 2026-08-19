<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Default vrijednosti za uplatnicu
        $defaults = [
            ['key' => 'bank_naziv',   'label' => 'Naziv korisnika (primatelja)',  'value' => 'BEBOLD DOO BAR'],
            ['key' => 'bank_racun',   'label' => 'Žiro račun',                    'value' => 'XXX-XXXX-XXXX'],
            ['key' => 'bank_banka',   'label' => 'Naziv banke',                   'value' => 'CKB banka'],
            ['key' => 'bank_info',    'label' => 'Dodatne informacije',            'value' => 'Molimo navedite svrhu uplate kako bismo identifikovali uplatu.'],
        ];

        foreach ($defaults as $row) {
            DB::table('settings')->insert(array_merge($row, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
