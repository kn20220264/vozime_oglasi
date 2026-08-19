<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VehicleCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('vehicle_categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $now = now();

        $mainCats = [
            ['name' => 'Automobili',      'slug' => 'automobili',      'icon' => 'car',         'order' => 1],
            ['name' => 'Motocikli',       'slug' => 'motocikli',       'icon' => 'motorcycle',  'order' => 2],
            ['name' => 'Nautika',         'slug' => 'nautika',         'icon' => 'boat',        'order' => 3],
            ['name' => 'Transport',       'slug' => 'transport',       'icon' => 'truck',       'order' => 4],
        ];

        foreach ($mainCats as $cat) {
            DB::table('vehicle_categories')->insert([
                'name'       => $cat['name'],
                'slug'       => $cat['slug'],
                'icon'       => $cat['icon'],
                'parent_id'  => null,
                'is_active'  => true,
                'order'      => $cat['order'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $cats    = DB::table('vehicle_categories')->pluck('id', 'order');
        $motoId      = $cats[2];
        $nautikaId   = $cats[3];
        $transportId = $cats[4];

        $motoSubs = [
            'Chopper / Cruiser', 'Dirt Bike', 'Enduro / Travel Enduro',
            'Sidecar', 'Small / Light Bike', 'Moped / Mokick', 'Motorcycle',
            'Naked Bike', 'Pocket Bike', 'Quad / ATV', 'Rally / Cross',
            'Racing', 'Roadster', 'Scooter / Roller', 'Sportbike / Superbike',
            'Sport Tourer', 'Streetfighter', 'Super Moto', 'Tourer', 'Trike', 'Ostalo',
        ];
        foreach ($motoSubs as $i => $name) {
            DB::table('vehicle_categories')->insert([
                'name' => $name, 'slug' => 'moto-' . Str::slug($name),
                'icon' => null, 'parent_id' => $motoId,
                'is_active' => true, 'order' => $i,
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        $nautikaSubs = [
            ['name' => 'Plovila',        'slug' => 'nautika-plovila',        'order' => 0],
            ['name' => 'Vodeni Skuteri', 'slug' => 'nautika-vodeni-skuteri', 'order' => 1],
        ];
        foreach ($nautikaSubs as $sub) {
            DB::table('vehicle_categories')->insert([
                'name' => $sub['name'], 'slug' => $sub['slug'],
                'icon' => null, 'parent_id' => $nautikaId,
                'is_active' => true, 'order' => $sub['order'],
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        $transportSubs = [
            ['name' => 'Kombi',                     'slug' => 'transport-kombi',       'order' => 0],
            ['name' => 'Kamioni do 7.5t',           'slug' => 'transport-kamion-do75', 'order' => 1],
            ['name' => 'Kamioni preko 7.5t',        'slug' => 'transport-kamion-75',   'order' => 2],
            ['name' => 'Prikolice i poluprikolice', 'slug' => 'transport-prikolice',   'order' => 3],
            ['name' => 'Autobusi',                  'slug' => 'transport-autobusi',    'order' => 4],
            ['name' => 'Kamperi',                   'slug' => 'transport-kamperi',     'order' => 5],
        ];
        foreach ($transportSubs as $sub) {
            DB::table('vehicle_categories')->insert([
                'name' => $sub['name'], 'slug' => $sub['slug'],
                'icon' => null, 'parent_id' => $transportId,
                'is_active' => true, 'order' => $sub['order'],
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        $this->command->info('VehicleCategoriesSeeder: kategorije i podkategorije seedovane.');
    }
}