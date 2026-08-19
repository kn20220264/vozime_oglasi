<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MakesSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('vehicle_models')->truncate();
        DB::table('makes')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $cats = DB::table('vehicle_categories')->pluck('id', 'slug');
        $autoId      = $cats['automobili']      ?? null;
        $motoId      = $cats['motocikli']       ?? null;
        $nautikaId   = $cats['nautika']         ?? null;
        $transportId = $cats['transport']       ?? null;

        $now = now();

        // ─── PUTNIČKA VOZILA ──────────────────────────────────
        $autoMakes = [
            ['name' => 'Volkswagen',    'country' => 'DE'],
            ['name' => 'BMW',           'country' => 'DE'],
            ['name' => 'Mercedes-Benz', 'country' => 'DE'],
            ['name' => 'Audi',          'country' => 'DE'],
            ['name' => 'Opel',          'country' => 'DE'],
            ['name' => 'Porsche',       'country' => 'DE'],
            ['name' => 'Ford',          'country' => 'US'],
            ['name' => 'Jeep',          'country' => 'US'],
            ['name' => 'Tesla',         'country' => 'US'],
            ['name' => 'Toyota',        'country' => 'JP'],
            ['name' => 'Honda',         'country' => 'JP'],
            ['name' => 'Nissan',        'country' => 'JP'],
            ['name' => 'Mazda',         'country' => 'JP'],
            ['name' => 'Mitsubishi',    'country' => 'JP'],
            ['name' => 'Subaru',        'country' => 'JP'],
            ['name' => 'Suzuki',        'country' => 'JP'],
            ['name' => 'Lexus',         'country' => 'JP'],
            ['name' => 'Hyundai',       'country' => 'KR'],
            ['name' => 'Kia',           'country' => 'KR'],
            ['name' => 'Renault',       'country' => 'FR'],
            ['name' => 'Peugeot',       'country' => 'FR'],
            ['name' => 'Citroën',       'country' => 'FR'],
            ['name' => 'Fiat',          'country' => 'IT'],
            ['name' => 'Alfa Romeo',    'country' => 'IT'],
            ['name' => 'Škoda',         'country' => 'CZ'],
            ['name' => 'Seat',          'country' => 'ES'],
            ['name' => 'Cupra',         'country' => 'ES'],
            ['name' => 'Volvo',         'country' => 'SE'],
            ['name' => 'Dacia',         'country' => 'RO'],
            ['name' => 'Land Rover',    'country' => 'GB'],
            ['name' => 'Mini',          'country' => 'GB'],
            ['name' => 'Lada',          'country' => 'RU'],
            ['name' => 'Ostalo',        'country' => null],
        ];

        // ─── MOTOCIKLI ────────────────────────────────────────
        $motoMakes = [
            ['name' => 'Honda',           'country' => 'JP'],
            ['name' => 'Yamaha',          'country' => 'JP'],
            ['name' => 'Kawasaki',        'country' => 'JP'],
            ['name' => 'Suzuki',          'country' => 'JP'],
            ['name' => 'BMW',             'country' => 'DE'],
            ['name' => 'KTM',             'country' => 'AT'],
            ['name' => 'Ducati',          'country' => 'IT'],
            ['name' => 'Aprilia',         'country' => 'IT'],
            ['name' => 'Moto Guzzi',      'country' => 'IT'],
            ['name' => 'MV Agusta',       'country' => 'IT'],
            ['name' => 'Husqvarna',       'country' => 'AT'],
            ['name' => 'Harley-Davidson', 'country' => 'US'],
            ['name' => 'Indian',          'country' => 'US'],
            ['name' => 'Triumph',         'country' => 'GB'],
            ['name' => 'Royal Enfield',   'country' => 'IN'],
            ['name' => 'Piaggio',         'country' => 'IT'],
            ['name' => 'Vespa',           'country' => 'IT'],
            ['name' => 'CF Moto',         'country' => 'CN'],
            ['name' => 'Kymco',           'country' => 'TW'],
            ['name' => 'Beta',            'country' => 'IT'],
            ['name' => 'Gas Gas',         'country' => 'ES'],
            ['name' => 'Ostalo',          'country' => null],
        ];

        // ─── NAUTIKA ──────────────────────────────────────────
        $nautikaMakes = [
            ['name' => 'Beneteau',        'country' => 'FR'],
            ['name' => 'Bavaria',         'country' => 'DE'],
            ['name' => 'Jeanneau',        'country' => 'FR'],
            ['name' => 'Sea Ray',         'country' => 'US'],
            ['name' => 'Bayliner',        'country' => 'US'],
            ['name' => 'Sea-Doo',         'country' => 'CA'],
            ['name' => 'Yamaha Marine',   'country' => 'JP'],
            ['name' => 'Kawasaki Marine', 'country' => 'JP'],
            ['name' => 'Azimut',          'country' => 'IT'],
            ['name' => 'Sunseeker',       'country' => 'GB'],
            ['name' => 'Lagoon',          'country' => 'FR'],
            ['name' => 'Fountaine Pajot', 'country' => 'FR'],
            ['name' => 'Joker Boat',      'country' => 'NO'],
            ['name' => 'Navar',           'country' => 'HR'],
            ['name' => 'Ostalo',          'country' => null],
        ];

        // ─── TRANSPORT ────────────────────────────────────────
        $transportMakes = [
            ['name' => 'Mercedes-Benz',     'country' => 'DE'],
            ['name' => 'Volkswagen',        'country' => 'DE'],
            ['name' => 'MAN',               'country' => 'DE'],
            ['name' => 'Volvo',             'country' => 'SE'],
            ['name' => 'Scania',            'country' => 'SE'],
            ['name' => 'DAF',               'country' => 'NL'],
            ['name' => 'Iveco',             'country' => 'IT'],
            ['name' => 'Renault Trucks',    'country' => 'FR'],
            ['name' => 'Ford',              'country' => 'US'],
            ['name' => 'Fiat',              'country' => 'IT'],
            ['name' => 'Opel',              'country' => 'DE'],
            ['name' => 'Peugeot',           'country' => 'FR'],
            ['name' => 'Citroën',           'country' => 'FR'],
            ['name' => 'Toyota',            'country' => 'JP'],
            ['name' => 'Nissan',            'country' => 'JP'],
            ['name' => 'Isuzu',             'country' => 'JP'],
            ['name' => 'Schmitz Cargobull', 'country' => 'DE'],
            ['name' => 'Krone',             'country' => 'DE'],
            ['name' => 'Setra',             'country' => 'DE'],
            ['name' => 'Hymer',             'country' => 'DE'],
            ['name' => 'Knaus',             'country' => 'DE'],
            ['name' => 'Ostalo',            'country' => null],
        ];

        $groups = [
            $autoId      => $autoMakes,
            $motoId      => $motoMakes,
            $nautikaId   => $nautikaMakes,
            $transportId => $transportMakes,
        ];

        foreach ($groups as $categoryId => $makes) {
            if (!$categoryId) continue;
            foreach ($makes as $make) {
                $slug = Str::slug($make['name']) . '-' . $categoryId;
                DB::table('makes')->insert([
                    'category_id' => $categoryId,
                    'name'        => $make['name'],
                    'slug'        => $slug,
                    'logo'        => null,
                    'country'     => $make['country'],
                    'is_active'   => true,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            }
        }

        $this->command->info('MakesSeeder: marke seedovane po kategorijama.');
    }
}