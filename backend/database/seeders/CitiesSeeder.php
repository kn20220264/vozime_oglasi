<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitiesSeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['name' => 'Podgorica',  'region' => 'Centralna Crna Gora', 'latitude' => 42.4304, 'longitude' => 19.2594],
            ['name' => 'Nikšić',     'region' => 'Centralna Crna Gora', 'latitude' => 42.7731, 'longitude' => 18.9442],
            ['name' => 'Bar',        'region' => 'Primorje',            'latitude' => 42.0937, 'longitude' => 19.1003],
            ['name' => 'Budva',      'region' => 'Primorje',            'latitude' => 42.2864, 'longitude' => 18.8400],
            ['name' => 'Kotor',      'region' => 'Primorje',            'latitude' => 42.4247, 'longitude' => 18.7712],
            ['name' => 'Herceg Novi','region' => 'Primorje',            'latitude' => 42.4531, 'longitude' => 18.5375],
            ['name' => 'Ulcinj',     'region' => 'Primorje',            'latitude' => 41.9254, 'longitude' => 19.2227],
            ['name' => 'Tivat',      'region' => 'Primorje',            'latitude' => 42.4344, 'longitude' => 18.6966],
            ['name' => 'Bijelo Polje','region' => 'Sjeverna Crna Gora', 'latitude' => 43.0381, 'longitude' => 19.7469],
            ['name' => 'Berane',     'region' => 'Sjeverna Crna Gora', 'latitude' => 42.8459, 'longitude' => 19.8733],
            ['name' => 'Rožaje',     'region' => 'Sjeverna Crna Gora', 'latitude' => 42.8408, 'longitude' => 20.1675],
            ['name' => 'Pljevlja',   'region' => 'Sjeverna Crna Gora', 'latitude' => 43.3567, 'longitude' => 19.3583],
            ['name' => 'Cetinje',    'region' => 'Centralna Crna Gora', 'latitude' => 42.3931, 'longitude' => 18.9142],
            ['name' => 'Danilovgrad','region' => 'Centralna Crna Gora', 'latitude' => 42.5533, 'longitude' => 19.1122],
            ['name' => 'Plav',       'region' => 'Sjeverna Crna Gora', 'latitude' => 42.5972, 'longitude' => 19.9436],
            ['name' => 'Žabljak',    'region' => 'Sjeverna Crna Gora', 'latitude' => 43.1553, 'longitude' => 19.1228],
            ['name' => 'Kolašin',    'region' => 'Centralna Crna Gora', 'latitude' => 42.8233, 'longitude' => 19.5183],
            ['name' => 'Mojkovac',   'region' => 'Centralna Crna Gora', 'latitude' => 42.9686, 'longitude' => 19.5853],
        ];

        foreach ($cities as $city) {
            DB::table('cities')->insert([
                'name'      => $city['name'],
                'region'    => $city['region'],
                'country'   => 'ME',
                'latitude'  => $city['latitude'],
                'longitude' => $city['longitude'],
                'is_active' => true,
                'created_at'=> now(),
                'updated_at'=> now(),
            ]);
        }
    }
}
