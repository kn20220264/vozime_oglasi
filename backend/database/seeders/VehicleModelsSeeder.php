<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VehicleModelsSeeder extends Seeder
{
    public function run(): void
    {
        // Putnička vozila je order=1, prva root kategorija
        $autoId = DB::table('vehicle_categories')->where('order', 1)->whereNull('parent_id')->value('id');
        $makes  = DB::table('makes')->where('category_id', $autoId)->pluck('id', 'name');

        $models = [
            ['make' => 'Volkswagen',    'name' => 'Golf'],
            ['make' => 'Volkswagen',    'name' => 'Passat'],
            ['make' => 'Volkswagen',    'name' => 'Polo'],
            ['make' => 'Volkswagen',    'name' => 'Tiguan'],
            ['make' => 'Volkswagen',    'name' => 'Touareg'],
            ['make' => 'Volkswagen',    'name' => 'T-Roc'],
            ['make' => 'BMW',           'name' => '3 Serija'],
            ['make' => 'BMW',           'name' => '5 Serija'],
            ['make' => 'BMW',           'name' => 'X5'],
            ['make' => 'BMW',           'name' => 'X3'],
            ['make' => 'BMW',           'name' => '1 Serija'],
            ['make' => 'Mercedes-Benz', 'name' => 'C-Klasa'],
            ['make' => 'Mercedes-Benz', 'name' => 'E-Klasa'],
            ['make' => 'Mercedes-Benz', 'name' => 'S-Klasa'],
            ['make' => 'Mercedes-Benz', 'name' => 'GLE'],
            ['make' => 'Mercedes-Benz', 'name' => 'GLC'],
            ['make' => 'Audi',          'name' => 'A3'],
            ['make' => 'Audi',          'name' => 'A4'],
            ['make' => 'Audi',          'name' => 'A6'],
            ['make' => 'Audi',          'name' => 'Q5'],
            ['make' => 'Audi',          'name' => 'Q7'],
            ['make' => 'Opel',          'name' => 'Astra'],
            ['make' => 'Opel',          'name' => 'Insignia'],
            ['make' => 'Opel',          'name' => 'Corsa'],
            ['make' => 'Opel',          'name' => 'Zafira'],
            ['make' => 'Ford',          'name' => 'Focus'],
            ['make' => 'Ford',          'name' => 'Fiesta'],
            ['make' => 'Ford',          'name' => 'Kuga'],
            ['make' => 'Ford',          'name' => 'Mondeo'],
            ['make' => 'Toyota',        'name' => 'Corolla'],
            ['make' => 'Toyota',        'name' => 'Yaris'],
            ['make' => 'Toyota',        'name' => 'RAV4'],
            ['make' => 'Toyota',        'name' => 'Camry'],
            ['make' => 'Renault',       'name' => 'Clio'],
            ['make' => 'Renault',       'name' => 'Megane'],
            ['make' => 'Renault',       'name' => 'Kadjar'],
            ['make' => 'Renault',       'name' => 'Duster'],
            ['make' => 'Škoda',         'name' => 'Octavia'],
            ['make' => 'Škoda',         'name' => 'Fabia'],
            ['make' => 'Škoda',         'name' => 'Superb'],
            ['make' => 'Škoda',         'name' => 'Kodiaq'],
            ['make' => 'Hyundai',       'name' => 'i30'],
            ['make' => 'Hyundai',       'name' => 'Tucson'],
            ['make' => 'Hyundai',       'name' => 'ix35'],
            ['make' => 'Kia',           'name' => 'Sportage'],
            ['make' => 'Kia',           'name' => 'Ceed'],
            ['make' => 'Kia',           'name' => 'Sorento'],
            ['make' => 'Dacia',         'name' => 'Sandero'],
            ['make' => 'Dacia',         'name' => 'Logan'],
            ['make' => 'Dacia',         'name' => 'Duster'],
        ];

        foreach ($models as $model) {
            if (!isset($makes[$model['make']])) continue;
            DB::table('vehicle_models')->insert([
                'make_id'    => $makes[$model['make']],
                'parent_id'  => null,
                'name'       => $model['name'],
                'slug'       => Str::slug($model['make'] . '-' . $model['name']),
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}