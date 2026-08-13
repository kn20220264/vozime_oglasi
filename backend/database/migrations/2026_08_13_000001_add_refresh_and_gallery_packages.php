<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Novi tipovi paketa: refresh (ručno obnavljanje) i gallery (više slika)
        DB::statement("ALTER TABLE packages MODIFY type ENUM('ad_boost', 'account', 'dealer', 'refresh', 'gallery') DEFAULT 'ad_boost'");

        Schema::table('packages', function (Blueprint $table) {
            $table->integer('refresh_count')->nullable()->after('refresh_days');
            $table->boolean('auto_refresh')->default(false)->after('refresh_count');
        });

        Schema::table('ads', function (Blueprint $table) {
            $table->timestamp('last_refreshed_at')->nullable()->after('expires_at');
            $table->boolean('auto_refresh')->default(false)->after('last_refreshed_at');
        });

        // Seed paketa za postojeće baze (svježe baze ih dobijaju i kroz PackagesSeeder)
        $now = now();
        $packages = [
            ['REFREŠ 3',     'refresh',  5.00, 30, 0,  3,    false, 'Mogućnost ručnog obnavljanja 3 oglasa svakih 48 sati.'],
            ['REFREŠ 5',     'refresh',  8.00, 30, 0,  5,    false, 'Mogućnost ručnog obnavljanja 5 oglasa svakih 48 sati.'],
            ['REFREŠ 10',    'refresh', 10.00, 30, 0,  10,   false, 'Mogućnost ručnog obnavljanja 10 oglasa svakih 48 sati.'],
            ['REFREŠ 15',    'refresh', 13.00, 30, 0,  15,   false, 'Mogućnost ručnog obnavljanja 15 oglasa svakih 48 sati.'],
            ['REFREŠ 20',    'refresh', 15.00, 30, 0,  20,   false, 'Mogućnost ručnog obnavljanja 20 oglasa svakih 48 sati.'],
            ['AUTO-REFRESH', 'refresh',  5.00,  30, 0,  null, true,  'Automatsko obnavljanje odabranih oglasa svakih 48 sati, 30 dana.'],
            ['GALERIJA 20',  'gallery',  3.00,  30, 20, null, false, 'Mogućnost postavljanja do 20 fotografija u oglasu.'],
            ['GALERIJA 50',  'gallery',  8.00,  30, 50, null, false, 'Mogućnost postavljanja do 50 fotografija u oglasu.'],
        ];

        foreach ($packages as [$name, $type, $price, $days, $maxImages, $refreshCount, $autoRefresh, $desc]) {
            $exists = DB::table('packages')->where('name', $name)->where('type', $type)->exists();
            if (!$exists) {
                DB::table('packages')->insert([
                    'name'          => $name,
                    'type'          => $type,
                    'price'         => $price,
                    'duration_days' => $days,
                    'max_images'    => $maxImages,
                    'refresh_count' => $refreshCount,
                    'auto_refresh'  => $autoRefresh,
                    'featured'      => false,
                    'premium_seller'=> false,
                    'description'   => $desc,
                    'is_active'     => true,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn(['last_refreshed_at', 'auto_refresh']);
        });

        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['refresh_count', 'auto_refresh']);
        });

        DB::statement("ALTER TABLE packages MODIFY type ENUM('ad_boost', 'account', 'dealer') DEFAULT 'ad_boost'");
    }
};
