<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VehicleCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Putnička vozila',  'icon' => 'car',         'order' => 1],
            ['name' => 'Motocikli',        'icon' => 'motorcycle',  'order' => 2],
            ['name' => 'Dostavna vozila',  'icon' => 'truck',       'order' => 3],
            ['name' => 'Kamioni',          'icon' => 'truck-heavy', 'order' => 4],
            ['name' => 'Autobusi',         'icon' => 'bus',         'order' => 5],
            ['name' => 'Radne mašine',     'icon' => 'tractor',     'order' => 6],
            ['name' => 'Prikolice',        'icon' => 'trailer',     'order' => 7],
            ['name' => 'Vodena vozila',    'icon' => 'boat',        'order' => 8],
        ];

        foreach ($categories as $cat) {
            DB::table('vehicle_categories')->insert([
                'name'       => $cat['name'],
                'slug'       => Str::slug($cat['name']),
                'icon'       => $cat['icon'],
                'parent_id'  => null,
                'is_active'  => true,
                'order'      => $cat['order'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
