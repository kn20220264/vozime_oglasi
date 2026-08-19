<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $equipment = [
            // safety
            ['name' => 'ABS',                    'category' => 'safety'],
            ['name' => 'ESP',                    'category' => 'safety'],
            ['name' => 'Airbag vozač',           'category' => 'safety'],
            ['name' => 'Airbag suvozač',         'category' => 'safety'],
            ['name' => 'Bočni airbazi',          'category' => 'safety'],
            ['name' => 'Kamera za vožnju unatrag','category' => 'safety'],
            ['name' => 'Parking senzori prednji','category' => 'safety'],
            ['name' => 'Parking senzori zadnji', 'category' => 'safety'],
            ['name' => 'Upozorenje na mrtvi ugao','category'=> 'safety'],
            ['name' => 'Prepoznavanje traka',    'category' => 'safety'],

            // comfort
            ['name' => 'Klimatizacija',          'category' => 'comfort'],
            ['name' => 'Automatska klima',       'category' => 'comfort'],
            ['name' => 'Grijanje sjedišta',      'category' => 'comfort'],
            ['name' => 'Električni prozori',     'category' => 'comfort'],
            ['name' => 'Električna ogledala',    'category' => 'comfort'],
            ['name' => 'Tempomat',               'category' => 'comfort'],
            ['name' => 'Adaptivni tempomat',     'category' => 'comfort'],
            ['name' => 'Elektro podešavanje sjedišta','category' => 'comfort'],
            ['name' => 'Panoramski krov',        'category' => 'comfort'],
            ['name' => 'Ambijentalno osvjetljenje','category'=> 'comfort'],
            ['name' => 'Keyless start',          'category' => 'comfort'],

            // multimedia
            ['name' => 'Radio/CD',               'category' => 'multimedia'],
            ['name' => 'Navigacija',             'category' => 'multimedia'],
            ['name' => 'Bluetooth',              'category' => 'multimedia'],
            ['name' => 'Apple CarPlay',          'category' => 'multimedia'],
            ['name' => 'Android Auto',           'category' => 'multimedia'],
            ['name' => 'USB priključak',         'category' => 'multimedia'],
            ['name' => 'Bežično punjenje',       'category' => 'multimedia'],
            ['name' => 'Head-up displej',        'category' => 'multimedia'],

            // exterior
            ['name' => 'Alu felge',              'category' => 'exterior'],
            ['name' => 'Krovni nosač',           'category' => 'exterior'],
            ['name' => 'Vuča (kuka)',            'category' => 'exterior'],
            ['name' => 'Električni gepek',       'category' => 'exterior'],
            ['name' => 'Xenon/LED farovi',       'category' => 'exterior'],
            ['name' => 'Dnevna LED svjetla',     'category' => 'exterior'],
            ['name' => 'Električni panoramski krov','category'=> 'exterior'],

            // assistance
            ['name' => 'Automatsko parkiranje',  'category' => 'assistance'],
            ['name' => 'Automatsko kočenje',     'category' => 'assistance'],
            ['name' => 'Start/stop sistem',      'category' => 'assistance'],
            ['name' => 'Hill holder',            'category' => 'assistance'],
            ['name' => 'Kontrola trakcije',      'category' => 'assistance'],
        ];

        foreach ($equipment as $item) {
            DB::table('equipment')->insert([
                'name'       => $item['name'],
                'category'   => $item['category'],
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}