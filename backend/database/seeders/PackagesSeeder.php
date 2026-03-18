<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackagesSeeder extends Seeder
{
    public function run(): void
    {
       $packages = [
    [
        'name'         => 'Bronze',
        'price'        => 0,
        'duration_days'=> 30,
        'max_images'   => 5,
        'featured'     => false,
        'description'  => 'Besplatno oglašavanje, do 5 slika, 30 dana trajanja',
        'is_active'    => true,
    ],
    [
        'name'         => 'Silver',
        'price'        => 4.99,
        'duration_days'=> 60,
        'max_images'   => 15,
        'featured'     => false,
        'description'  => 'Do 15 slika, 60 dana trajanja oglasa',
        'is_active'    => true,
    ],
    [
        'name'         => 'Gold',
        'price'        => 9.99,
        'duration_days'=> 90,
        'max_images'   => 30,
        'featured'     => false,
        'description'  => 'Do 30 slika, 90 dana trajanja oglasa',
        'is_active'    => true,
    ],
    [
        'name'         => 'Premium',
        'price'        => 19.99,
        'duration_days'=> 90,
        'max_images'   => 50,
        'featured'     => true,
        'description'  => 'Istaknuti oglas na vrhu pretrage, do 50 slika, 90 dana trajanja',
        'is_active'    => true,
    ],
];

        foreach ($packages as $pkg) {
            DB::table('packages')->insert(array_merge($pkg, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}