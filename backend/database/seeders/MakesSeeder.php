<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MakesSeeder extends Seeder
{
    public function run(): void
    {
        $makes = [
            ['name' => 'Volkswagen', 'country' => 'DE'],
            ['name' => 'BMW',        'country' => 'DE'],
            ['name' => 'Mercedes-Benz','country'=> 'DE'],
            ['name' => 'Audi',       'country' => 'DE'],
            ['name' => 'Opel',       'country' => 'DE'],
            ['name' => 'Ford',       'country' => 'US'],
            ['name' => 'Toyota',     'country' => 'JP'],
            ['name' => 'Honda',      'country' => 'JP'],
            ['name' => 'Nissan',     'country' => 'JP'],
            ['name' => 'Mazda',      'country' => 'JP'],
            ['name' => 'Hyundai',    'country' => 'KR'],
            ['name' => 'Kia',        'country' => 'KR'],
            ['name' => 'Renault',    'country' => 'FR'],
            ['name' => 'Peugeot',    'country' => 'FR'],
            ['name' => 'Citroën',    'country' => 'FR'],
            ['name' => 'Fiat',       'country' => 'IT'],
            ['name' => 'Alfa Romeo', 'country' => 'IT'],
            ['name' => 'Škoda',      'country' => 'CZ'],
            ['name' => 'Seat',       'country' => 'ES'],
            ['name' => 'Volvo',      'country' => 'SE'],
            ['name' => 'Jeep',       'country' => 'US'],
            ['name' => 'Suzuki',     'country' => 'JP'],
            ['name' => 'Mitsubishi', 'country' => 'JP'],
            ['name' => 'Subaru',     'country' => 'JP'],
            ['name' => 'Dacia',      'country' => 'RO'],
        ];

        foreach ($makes as $make) {
            DB::table('makes')->insert([
                'name'       => $make['name'],
                'slug'       => Str::slug($make['name']),
                'logo'       => null,
                'country'    => $make['country'],
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
