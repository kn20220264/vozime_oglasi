<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackagesSeeder extends Seeder
{
    public function run(): void
    {
        Package::query()->delete();

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
    }
}