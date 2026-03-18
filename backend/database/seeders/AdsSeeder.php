<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdsSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = DB::table('vehicle_categories')->where('name', 'Putnička vozila')->value('id');
        $cities     = DB::table('cities')->pluck('id', 'name');
        $users      = DB::table('users')->pluck('id', 'email');
        $equipment  = DB::table('equipment')->pluck('id')->toArray();

        // Dohvati make+model parove
        $golf    = $this->getMakeModel('Volkswagen', 'Golf');
        $passat  = $this->getMakeModel('Volkswagen', 'Passat');
        $audi_a4 = $this->getMakeModel('Audi', 'A4');
        $bmw_3   = $this->getMakeModel('BMW', '3 Serija');
        $octavia = $this->getMakeModel('Škoda', 'Octavia');
        $clio    = $this->getMakeModel('Renault', 'Clio');

        $ads = [
            [
                'user_id'        => $users['marko@test.me'],
                'make'           => $golf,
                'city'           => $cities['Podgorica'],
                'title'          => 'VW Golf 7 1.6 TDI 2016',
                'description'    => 'Odlično stanje, redovno servisan, jedan vlasnik. Full oprema. Moguća zamjena.',
                'price'          => 11500,
                'year'           => 2016,
                'mileage'        => 142000,
                'fuel_type'      => 'dizel',
                'transmission'   => 'manuelni',
                'body_type'      => 'hatchback',
                'power_kw'       => 85,
                'engine_cc'      => 1598,
                'color_exterior' => 'Crna',
                'drive_type'     => 'prednji',
                'doors'          => 5,
                'seats'          => 5,
                'condition'      => 'polovnjak',
                'damage'         => 'neosteceno',
                'emission_class' => 'euro6',
                'owners_count'   => 1,
                'registered_until'=> '2025-12-01',
                'status'         => 'active',
                'featured'       => false,
            ],
            [
                'user_id'        => $users['dealer@vozime.me'],
                'make'           => $audi_a4,
                'city'           => $cities['Podgorica'],
                'title'          => 'Audi A4 2.0 TDI S-Line 2019',
                'description'    => 'Kupljen nov u Crnoj Gori. Servisna knjiga kompletna. Panoramski krov, navigacija, kamera.',
                'price'          => 24900,
                'year'           => 2019,
                'mileage'        => 87000,
                'fuel_type'      => 'dizel',
                'transmission'   => 'automatik',
                'body_type'      => 'sedan',
                'power_kw'       => 140,
                'engine_cc'      => 1968,
                'color_exterior' => 'Siva',
                'drive_type'     => 'prednji',
                'doors'          => 4,
                'seats'          => 5,
                'condition'      => 'polovnjak',
                'damage'         => 'neosteceno',
                'emission_class' => 'euro6',
                'owners_count'   => 1,
                'registered_until'=> '2026-03-01',
                'status'         => 'active',
                'featured'       => true,
            ],
            [
                'user_id'        => $users['ana@test.me'],
                'make'           => $clio,
                'city'           => $cities['Bar'],
                'title'          => 'Renault Clio 1.2 16V 2013',
                'description'    => 'Mali gradski auto, štedljiv, tek registrovan. Idealan za grad.',
                'price'          => 5900,
                'year'           => 2013,
                'mileage'        => 195000,
                'fuel_type'      => 'benzin',
                'transmission'   => 'manuelni',
                'body_type'      => 'hatchback',
                'power_kw'       => 55,
                'engine_cc'      => 1149,
                'color_exterior' => 'Bijela',
                'drive_type'     => 'prednji',
                'doors'          => 5,
                'seats'          => 5,
                'condition'      => 'polovnjak',
                'damage'         => 'neosteceno',
                'emission_class' => 'euro5',
                'owners_count'   => 2,
                'registered_until'=> '2026-01-01',
                'status'         => 'active',
                'featured'       => false,
            ],
            [
                'user_id'        => $users['dealer@vozime.me'],
                'make'           => $bmw_3,
                'city'           => $cities['Budva'],
                'title'          => 'BMW 320d xDrive 2020',
                'description'    => 'Sportski paket, full LED, head-up display. U odličnom stanju. Cijena fiksna.',
                'price'          => 32500,
                'year'           => 2020,
                'mileage'        => 61000,
                'fuel_type'      => 'dizel',
                'transmission'   => 'automatik',
                'body_type'      => 'sedan',
                'power_kw'       => 140,
                'engine_cc'      => 1995,
                'color_exterior' => 'Plava',
                'drive_type'     => '4x4',
                'doors'          => 4,
                'seats'          => 5,
                'condition'      => 'polovnjak',
                'damage'         => 'neosteceno',
                'emission_class' => 'euro6',
                'owners_count'   => 1,
                'registered_until'=> '2026-06-01',
                'status'         => 'active',
                'featured'       => true,
            ],
            [
                'user_id'        => $users['marko@test.me'],
                'make'           => $passat,
                'city'           => $cities['Nikšić'],
                'title'          => 'VW Passat B6 2.0 TDI 2008',
                'description'    => 'Karavan, idealan za porodicu. Kuka, alu felge 17". Cijena po dogovoru.',
                'price'          => 6200,
                'year'           => 2008,
                'mileage'        => 268000,
                'fuel_type'      => 'dizel',
                'transmission'   => 'manuelni',
                'body_type'      => 'karavan',
                'power_kw'       => 103,
                'engine_cc'      => 1968,
                'color_exterior' => 'Srebrna',
                'drive_type'     => 'prednji',
                'doors'          => 5,
                'seats'          => 5,
                'condition'      => 'polovnjak',
                'damage'         => 'neosteceno',
                'emission_class' => 'euro4',
                'owners_count'   => 3,
                'registered_until'=> '2025-09-01',
                'status'         => 'active',
                'featured'       => false,
                'price_negotiable'=> true,
            ],
            [
                'user_id'        => $users['dealer@vozime.me'],
                'make'           => $octavia,
                'city'           => $cities['Podgorica'],
                'title'          => 'Škoda Octavia 1.6 TDI Elegance 2017',
                'description'    => 'Jedan vlasnik, garažiran, servisna knjiga, nove zimske gume. Bez ulaganja.',
                'price'          => 13800,
                'year'           => 2017,
                'mileage'        => 118000,
                'fuel_type'      => 'dizel',
                'transmission'   => 'manuelni',
                'body_type'      => 'karavan',
                'power_kw'       => 85,
                'engine_cc'      => 1598,
                'color_exterior' => 'Crvena',
                'drive_type'     => 'prednji',
                'doors'          => 5,
                'seats'          => 5,
                'condition'      => 'polovnjak',
                'damage'         => 'neosteceno',
                'emission_class' => 'euro6',
                'owners_count'   => 1,
                'registered_until'=> '2026-02-01',
                'status'         => 'active',
                'featured'       => false,
            ],
        ];

        foreach ($ads as $ad) {
            $make    = $ad['make'];
            $title   = $ad['title'];
            $cityId  = $ad['city'];
            unset($ad['make']);
            unset($ad['city']);

            $adId = DB::table('ads')->insertGetId(array_merge($ad, [
                'city_id'         => $cityId, 
                'category_id'     => $categoryId,
                'make_id'         => $make['make_id'],
                'model_id'        => $make['model_id'],
                'slug'            => Str::slug($title) . '-' . uniqid(),
                'title'           => $title,
                'currency'        => 'EUR',
                'price_negotiable'=> $ad['price_negotiable'] ?? false,
                'has_service_book'=> true,
                'has_warranty'    => false,
                'accepts_exchange'=> false,
                'import'          => false,
                'views_count'     => rand(10, 500),
                'featured_until'  => ($ad['featured'] ?? false) ? now()->addDays(30) : null,
                'expires_at'      => now()->addDays(60),
                'vin'             => strtoupper(Str::random(17)),
                'created_at'      => now()->subDays(rand(1, 30)),
                'updated_at'      => now(),
            ]));

            // Dodaj opremu (random 5-10 stavki)
            $randomEquipment = array_rand(array_flip($equipment), rand(5, 10));
            foreach ((array)$randomEquipment as $equipId) {
                DB::table('ad_equipment')->insert([
                    'ad_id'        => $adId,
                    'equipment_id' => $equipId,
                ]);
            }

            // Dodaj placeholder sliku
            DB::table('ad_images')->insert([
                'ad_id'      => $adId,
                'path'       => 'images/placeholder.jpg',
                'is_primary' => true,
                'order'      => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Dodaj par favorita i poruka za test
        $adIds  = DB::table('ads')->pluck('id')->toArray();
        $userId = $users['ana@test.me'];

        DB::table('favorites')->insert([
            'user_id'    => $userId,
            'ad_id'      => $adIds[0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('messages')->insert([
            'sender_id'   => $users['marko@test.me'],
            'receiver_id' => $users['dealer@vozime.me'],
            'ad_id'       => $adIds[1],
            'body'        => 'Pozdrav, da li je vozilo još uvijek dostupno? Mogu li doći na probu?',
            'read_at'     => null,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }

    private function getMakeModel(string $makeName, string $modelName): array
    {
        $makeId  = DB::table('makes')->where('name', $makeName)->value('id');
        $modelId = DB::table('vehicle_models')
            ->where('make_id', $makeId)
            ->where('name', $modelName)
            ->value('id');

        return ['make_id' => $makeId, 'model_id' => $modelId];
    }
}
