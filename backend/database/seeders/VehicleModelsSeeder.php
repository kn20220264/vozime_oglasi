<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VehicleModelsSeeder extends Seeder
{
    public function run(): void
    {
        // Dohvati make ID-jeve po imenu
        $makes = DB::table('makes')->pluck('id', 'name');

        $models = [
            // Volkswagen
            ['make' => 'Volkswagen', 'name' => 'Golf',      'year_from' => 1974, 'year_to' => null],
            ['make' => 'Volkswagen', 'name' => 'Passat',    'year_from' => 1973, 'year_to' => null],
            ['make' => 'Volkswagen', 'name' => 'Polo',      'year_from' => 1975, 'year_to' => null],
            ['make' => 'Volkswagen', 'name' => 'Tiguan',    'year_from' => 2007, 'year_to' => null],
            ['make' => 'Volkswagen', 'name' => 'Touareg',   'year_from' => 2002, 'year_to' => null],
            ['make' => 'Volkswagen', 'name' => 'T-Roc',     'year_from' => 2017, 'year_to' => null],
            // BMW
            ['make' => 'BMW', 'name' => '3 Serija', 'year_from' => 1975, 'year_to' => null],
            ['make' => 'BMW', 'name' => '5 Serija', 'year_from' => 1972, 'year_to' => null],
            ['make' => 'BMW', 'name' => 'X5',       'year_from' => 1999, 'year_to' => null],
            ['make' => 'BMW', 'name' => 'X3',       'year_from' => 2003, 'year_to' => null],
            ['make' => 'BMW', 'name' => '1 Serija', 'year_from' => 2004, 'year_to' => null],
            // Mercedes-Benz
            ['make' => 'Mercedes-Benz', 'name' => 'C-Klasa',  'year_from' => 1993, 'year_to' => null],
            ['make' => 'Mercedes-Benz', 'name' => 'E-Klasa',  'year_from' => 1993, 'year_to' => null],
            ['make' => 'Mercedes-Benz', 'name' => 'S-Klasa',  'year_from' => 1972, 'year_to' => null],
            ['make' => 'Mercedes-Benz', 'name' => 'GLE',      'year_from' => 2015, 'year_to' => null],
            ['make' => 'Mercedes-Benz', 'name' => 'GLC',      'year_from' => 2015, 'year_to' => null],
            // Audi
            ['make' => 'Audi', 'name' => 'A3',  'year_from' => 1996, 'year_to' => null],
            ['make' => 'Audi', 'name' => 'A4',  'year_from' => 1994, 'year_to' => null],
            ['make' => 'Audi', 'name' => 'A6',  'year_from' => 1994, 'year_to' => null],
            ['make' => 'Audi', 'name' => 'Q5',  'year_from' => 2008, 'year_to' => null],
            ['make' => 'Audi', 'name' => 'Q7',  'year_from' => 2005, 'year_to' => null],
            // Opel
            ['make' => 'Opel', 'name' => 'Astra',    'year_from' => 1991, 'year_to' => null],
            ['make' => 'Opel', 'name' => 'Insignia',  'year_from' => 2008, 'year_to' => null],
            ['make' => 'Opel', 'name' => 'Corsa',    'year_from' => 1982, 'year_to' => null],
            ['make' => 'Opel', 'name' => 'Zafira',   'year_from' => 1999, 'year_to' => null],
            // Ford
            ['make' => 'Ford', 'name' => 'Focus',   'year_from' => 1998, 'year_to' => null],
            ['make' => 'Ford', 'name' => 'Fiesta',  'year_from' => 1976, 'year_to' => 2023],
            ['make' => 'Ford', 'name' => 'Kuga',    'year_from' => 2008, 'year_to' => null],
            ['make' => 'Ford', 'name' => 'Mondeo',  'year_from' => 1993, 'year_to' => 2022],
            // Toyota
            ['make' => 'Toyota', 'name' => 'Corolla', 'year_from' => 1966, 'year_to' => null],
            ['make' => 'Toyota', 'name' => 'Yaris',   'year_from' => 1999, 'year_to' => null],
            ['make' => 'Toyota', 'name' => 'RAV4',    'year_from' => 1994, 'year_to' => null],
            ['make' => 'Toyota', 'name' => 'Camry',   'year_from' => 1982, 'year_to' => null],
            // Renault
            ['make' => 'Renault', 'name' => 'Clio',   'year_from' => 1990, 'year_to' => null],
            ['make' => 'Renault', 'name' => 'Megane',  'year_from' => 1995, 'year_to' => null],
            ['make' => 'Renault', 'name' => 'Kadjar',  'year_from' => 2015, 'year_to' => null],
            ['make' => 'Renault', 'name' => 'Duster',  'year_from' => 2010, 'year_to' => null],
            // Škoda
            ['make' => 'Škoda', 'name' => 'Octavia',  'year_from' => 1996, 'year_to' => null],
            ['make' => 'Škoda', 'name' => 'Fabia',    'year_from' => 1999, 'year_to' => null],
            ['make' => 'Škoda', 'name' => 'Superb',   'year_from' => 2001, 'year_to' => null],
            ['make' => 'Škoda', 'name' => 'Kodiaq',   'year_from' => 2016, 'year_to' => null],
            // Hyundai
            ['make' => 'Hyundai', 'name' => 'i30',    'year_from' => 2007, 'year_to' => null],
            ['make' => 'Hyundai', 'name' => 'Tucson',  'year_from' => 2004, 'year_to' => null],
            ['make' => 'Hyundai', 'name' => 'ix35',   'year_from' => 2009, 'year_to' => 2015],
            // Kia
            ['make' => 'Kia', 'name' => 'Sportage', 'year_from' => 1993, 'year_to' => null],
            ['make' => 'Kia', 'name' => 'Ceed',     'year_from' => 2006, 'year_to' => null],
            ['make' => 'Kia', 'name' => 'Sorento',  'year_from' => 2002, 'year_to' => null],
            // Dacia
            ['make' => 'Dacia', 'name' => 'Sandero', 'year_from' => 2008, 'year_to' => null],
            ['make' => 'Dacia', 'name' => 'Logan',   'year_from' => 2004, 'year_to' => null],
            ['make' => 'Dacia', 'name' => 'Duster',  'year_from' => 2010, 'year_to' => null],
        ];

        foreach ($models as $model) {
            if (!isset($makes[$model['make']])) continue;

            DB::table('vehicle_models')->insert([
                'make_id'    => $makes[$model['make']],
                'name'       => $model['name'],
                'slug'       => Str::slug($model['make'] . '-' . $model['name']),
                'year_from'  => $model['year_from'],
                'year_to'    => $model['year_to'],
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
