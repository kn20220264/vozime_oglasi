<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackagesSeeder extends Seeder
{
    public function run(): void
    {
        Package::where('type', '!=', 'dealer')->delete();

        // ── Paketi za oglas (ad_boost) ──
        Package::create([
            'name'          => 'Premium 5',
            'type'          => 'ad_boost',
            'price'         => 8.00,
            'duration_days' => 6,
            'max_images'    => 10,
            'max_active_ads'=> null,
            'refresh_days'  => 3,
            'featured'      => true,
            'premium_seller'=> false,
            'description'   => 'Istaknuti oglas 6 dana, refresh svakih 3 dana.',
            'is_active'     => true,
        ]);

        Package::create([
            'name'          => 'Premium 10',
            'type'          => 'ad_boost',
            'price'         => 12.00,
            'duration_days' => 12,
            'max_images'    => 10,
            'max_active_ads'=> null,
            'refresh_days'  => 3,
            'featured'      => true,
            'premium_seller'=> false,
            'description'   => 'Istaknuti oglas 12 dana, refresh svakih 3 dana.',
            'is_active'     => true,
        ]);

        // ── Paketi za nalog (account) ──
        Package::create([
            'name'          => 'FREE',
            'type'          => 'account',
            'price'         => 0.00,
            'duration_days' => 30,
            'max_images'    => 5,
            'max_active_ads'=> 3,
            'refresh_days'  => null,
            'featured'      => false,
            'premium_seller'=> false,
            'description'   => 'Besplatno, do 3 aktivna oglasa.',
            'is_active'     => true,
        ]);

        Package::create([
            'name'          => 'STANDARD',
            'type'          => 'account',
            'price'         => 15.00,
            'duration_days' => 30,
            'max_images'    => 10,
            'max_active_ads'=> 5,
            'refresh_days'  => null,
            'featured'      => false,
            'premium_seller'=> false,
            'description'   => 'Do 5 aktivnih oglasa, 30 dana.',
            'is_active'     => true,
        ]);

        Package::create([
            'name'          => 'MAX',
            'type'          => 'account',
            'price'         => 30.00,
            'duration_days' => 30,
            'max_images'    => 20,
            'max_active_ads'=> 10,
            'refresh_days'  => null,
            'featured'      => false,
            'premium_seller'=> true,
            'description'   => 'Do 10 aktivnih oglasa, Premium prodavac oznaka, 30 dana.',
            'is_active'     => true,
        ]);

        // ── Refresh paketi (ručno obnavljanje oglasa, važe 30 dana) ──
        $refreshPackages = [
            ['REFREŠ 3',  5.00,  3],
            ['REFREŠ 5',  8.00,  5],
            ['REFREŠ 10', 10.00, 10],
            ['REFREŠ 15', 13.00, 15],
            ['REFREŠ 20', 15.00, 20],
        ];
        foreach ($refreshPackages as [$name, $price, $count]) {
            Package::create([
                'name'          => $name,
                'type'          => 'refresh',
                'price'         => $price,
                'duration_days' => 30,
                'max_images'    => 0,
                'refresh_count' => $count,
                'auto_refresh'  => false,
                'description'   => "Mogućnost ručnog obnavljanja {$count} oglasa svakih 48 sati.",
                'is_active'     => true,
            ]);
        }

        Package::create([
            'name'          => 'AUTO-REFRESH',
            'type'          => 'refresh',
            'price'         => 5.00,
            'duration_days' => 30,
            'max_images'    => 0,
            'refresh_count' => null,
            'auto_refresh'  => true,
            'description'   => 'Automatsko obnavljanje odabranih oglasa svakih 48 sati, 30 dana.',
            'is_active'     => true,
        ]);

        // ── Galerija paketi (više slika po oglasu, važe 30 dana) ──
        Package::create([
            'name'          => 'GALERIJA 20',
            'type'          => 'gallery',
            'price'         => 3.00,
            'duration_days' => 30,
            'max_images'    => 20,
            'description'   => 'Mogućnost postavljanja do 20 fotografija u oglasu.',
            'is_active'     => true,
        ]);

        Package::create([
            'name'          => 'GALERIJA 50',
            'type'          => 'gallery',
            'price'         => 8.00,
            'duration_days' => 30,
            'max_images'    => 50,
            'description'   => 'Mogućnost postavljanja do 50 fotografija u oglasu.',
            'is_active'     => true,
        ]);
    }
}