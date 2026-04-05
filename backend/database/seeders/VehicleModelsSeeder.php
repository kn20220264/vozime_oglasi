<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VehicleModelsSeeder extends Seeder
{
    public function run(): void
    {
        $makes = DB::table('makes')->pluck('id', 'name');

        // Format: ['make', 'serija/klasa (parent)', 'konkretni modeli...']
        // parent_name => null znaci da je sam sebi root (nema podmodele)
        $data = [

            // ── VOLKSWAGEN ──────────────────────────────────────
            'Volkswagen' => [
                'Golf'    => ['Golf IV', 'Golf V', 'Golf VI', 'Golf VII', 'Golf VIII'],
                'Passat'  => ['Passat B5', 'Passat B6', 'Passat B7', 'Passat B8'],
                'Polo'    => ['Polo IV', 'Polo V', 'Polo VI'],
                'Tiguan'  => ['Tiguan I', 'Tiguan II'],
                'Touareg' => ['Touareg I', 'Touareg II', 'Touareg III'],
                'T-Roc'   => [],
                'Arteon'  => [],
                'ID.4'    => [],
            ],

            // ── BMW ─────────────────────────────────────────────
            'BMW' => [
                '1 Serija' => ['116i', '118i', '120i', '116d', '118d', '120d', '125i', '130i'],
                '2 Serija' => ['218i', '220i', '220d', '225i', 'M235i'],
                '3 Serija' => ['316i', '318i', '320i', '325i', '328i', '330i', '316d', '318d', '320d', '325d', '330d', 'M3'],
                '4 Serija' => ['418i', '420i', '430i', '418d', '420d', 'M4'],
                '5 Serija' => ['518i', '520i', '523i', '525i', '528i', '530i', '518d', '520d', '525d', '530d', 'M5'],
                '6 Serija' => ['630i', '640i', '630d', '640d', 'M6'],
                '7 Serija' => ['730i', '740i', '750i', '730d', '740d', '750d', 'M760'],
                'X1'       => ['X1 sDrive18i', 'X1 xDrive20i', 'X1 sDrive18d', 'X1 xDrive20d'],
                'X3'       => ['X3 xDrive20i', 'X3 xDrive30i', 'X3 xDrive20d', 'X3 xDrive30d', 'X3 M'],
                'X4'       => ['X4 xDrive20i', 'X4 xDrive30i', 'X4 xDrive20d', 'X4 M'],
                'X5'       => ['X5 xDrive30i', 'X5 xDrive40i', 'X5 xDrive30d', 'X5 xDrive40d', 'X5 M'],
                'X6'       => ['X6 xDrive30i', 'X6 xDrive40i', 'X6 xDrive30d', 'X6 M'],
                'X7'       => ['X7 xDrive40i', 'X7 xDrive40d', 'X7 M60i'],
            ],

            // ── MERCEDES-BENZ ────────────────────────────────────
            'Mercedes-Benz' => [
                'A-Klasa'  => ['A 160', 'A 180', 'A 200', 'A 220', 'A 160d', 'A 180d', 'A 200d', 'A 45 AMG'],
                'B-Klasa'  => ['B 160', 'B 180', 'B 200', 'B 160d', 'B 180d', 'B 200d'],
                'C-Klasa'  => ['C 180', 'C 200', 'C 220', 'C 250', 'C 300', 'C 180d', 'C 200d', 'C 220d', 'C 250d', 'C 63 AMG'],
                'E-Klasa'  => ['E 200', 'E 220', 'E 250', 'E 300', 'E 350', 'E 200d', 'E 220d', 'E 250d', 'E 350d', 'E 63 AMG'],
                'S-Klasa'  => ['S 350', 'S 400', 'S 450', 'S 500', 'S 350d', 'S 400d', 'S 63 AMG', 'S 65 AMG'],
                'GLA'      => ['GLA 180', 'GLA 200', 'GLA 220', 'GLA 180d', 'GLA 200d', 'GLA 220d', 'GLA 45 AMG'],
                'GLC'      => ['GLC 200', 'GLC 220', 'GLC 250', 'GLC 300', 'GLC 200d', 'GLC 220d', 'GLC 250d', 'GLC 63 AMG'],
                'GLE'      => ['GLE 300', 'GLE 350', 'GLE 400', 'GLE 300d', 'GLE 350d', 'GLE 53 AMG', 'GLE 63 AMG'],
                'GLS'      => ['GLS 350d', 'GLS 400d', 'GLS 580', 'GLS 63 AMG'],
                'Sprinter' => ['Sprinter 211', 'Sprinter 213', 'Sprinter 216', 'Sprinter 311', 'Sprinter 316', 'Sprinter 319'],
                'Vito'     => ['Vito 109', 'Vito 111', 'Vito 114', 'Vito 116', 'Vito 119'],
            ],

            // ── AUDI ─────────────────────────────────────────────
            'Audi' => [
                'A1' => ['A1 1.0 TFSI', 'A1 1.4 TFSI', 'A1 1.6 TDI', 'S1'],
                'A3' => ['A3 1.2 TFSI', 'A3 1.4 TFSI', 'A3 1.8 TFSI', 'A3 2.0 TFSI', 'A3 1.6 TDI', 'A3 2.0 TDI', 'S3', 'RS3'],
                'A4' => ['A4 1.4 TFSI', 'A4 1.8 TFSI', 'A4 2.0 TFSI', 'A4 2.0 TDI', 'A4 3.0 TDI', 'S4', 'RS4'],
                'A5' => ['A5 1.8 TFSI', 'A5 2.0 TFSI', 'A5 3.0 TFSI', 'A5 2.0 TDI', 'A5 3.0 TDI', 'S5', 'RS5'],
                'A6' => ['A6 2.0 TFSI', 'A6 3.0 TFSI', 'A6 2.0 TDI', 'A6 3.0 TDI', 'S6', 'RS6'],
                'A7' => ['A7 2.0 TFSI', 'A7 3.0 TFSI', 'A7 3.0 TDI', 'S7', 'RS7'],
                'A8' => ['A8 3.0 TFSI', 'A8 4.0 TFSI', 'A8 3.0 TDI', 'A8 4.2 TDI', 'S8'],
                'Q3' => ['Q3 1.4 TFSI', 'Q3 2.0 TFSI', 'Q3 2.0 TDI', 'RS Q3'],
                'Q5' => ['Q5 2.0 TFSI', 'Q5 3.0 TFSI', 'Q5 2.0 TDI', 'Q5 3.0 TDI', 'SQ5'],
                'Q7' => ['Q7 2.0 TFSI', 'Q7 3.0 TFSI', 'Q7 3.0 TDI', 'Q7 4.2 TDI', 'SQ7'],
                'Q8' => ['Q8 3.0 TFSI', 'Q8 4.0 TFSI', 'Q8 3.0 TDI', 'SQ8', 'RS Q8'],
                'TT' => ['TT 1.8 TFSI', 'TT 2.0 TFSI', 'TT 2.0 TDI', 'TTS', 'TT RS'],
            ],

            // ── OPEL ─────────────────────────────────────────────
            'Opel' => [
                'Astra'    => ['Astra G', 'Astra H', 'Astra J', 'Astra K'],
                'Corsa'    => ['Corsa C', 'Corsa D', 'Corsa E', 'Corsa F'],
                'Insignia' => ['Insignia A', 'Insignia B', 'Insignia GSi'],
                'Zafira'   => ['Zafira A', 'Zafira B', 'Zafira C'],
                'Mokka'    => ['Mokka', 'Mokka X', 'Mokka-e'],
                'Grandland' => [],
                'Crossland' => [],
            ],

            // ── FORD ─────────────────────────────────────────────
            'Ford' => [
                'Fiesta'   => ['Fiesta V', 'Fiesta VI', 'Fiesta VII'],
                'Focus'    => ['Focus I', 'Focus II', 'Focus III', 'Focus IV'],
                'Mondeo'   => ['Mondeo III', 'Mondeo IV', 'Mondeo V'],
                'Kuga'     => ['Kuga I', 'Kuga II', 'Kuga III'],
                'Puma'     => [],
                'Mustang'  => ['Mustang GT', 'Mustang EcoBoost', 'Mustang Mach-E'],
                'Explorer' => [],
                'Ranger'   => ['Ranger III', 'Ranger IV'],
            ],

            // ── TOYOTA ───────────────────────────────────────────
            'Toyota' => [
                'Yaris'   => ['Yaris I', 'Yaris II', 'Yaris III', 'Yaris IV'],
                'Corolla' => ['Corolla E12', 'Corolla E14', 'Corolla E21'],
                'Camry'   => ['Camry VII', 'Camry VIII'],
                'RAV4'    => ['RAV4 III', 'RAV4 IV', 'RAV4 V'],
                'Land Cruiser' => ['Land Cruiser 100', 'Land Cruiser 200', 'Land Cruiser 300'],
                'Hilux'   => ['Hilux VII', 'Hilux VIII'],
                'Prius'   => ['Prius III', 'Prius IV'],
                'C-HR'    => [],
                'Aygo'    => ['Aygo I', 'Aygo II'],
            ],

            // ── HONDA ────────────────────────────────────────────
            'Honda' => [
                'Civic'   => ['Civic VII', 'Civic VIII', 'Civic IX', 'Civic X', 'Civic XI'],
                'Accord'  => ['Accord VII', 'Accord VIII', 'Accord IX'],
                'CR-V'    => ['CR-V II', 'CR-V III', 'CR-V IV', 'CR-V V'],
                'HR-V'    => ['HR-V I', 'HR-V II'],
                'Jazz'    => ['Jazz I', 'Jazz II', 'Jazz III', 'Jazz IV'],
            ],

            // ── RENAULT ──────────────────────────────────────────
            'Renault' => [
                'Clio'    => ['Clio II', 'Clio III', 'Clio IV', 'Clio V'],
                'Megane'  => ['Megane II', 'Megane III', 'Megane IV'],
                'Laguna'  => ['Laguna II', 'Laguna III'],
                'Kadjar'  => [],
                'Duster'  => ['Duster I', 'Duster II'],
                'Koleos'  => ['Koleos I', 'Koleos II'],
                'Captur'  => ['Captur I', 'Captur II'],
                'Twingo'  => ['Twingo II', 'Twingo III'],
                'Trafic'  => ['Trafic II', 'Trafic III'],
                'Master'  => ['Master II', 'Master III'],
            ],

            // ── ŠKODA ────────────────────────────────────────────
            'Škoda' => [
                'Fabia'   => ['Fabia I', 'Fabia II', 'Fabia III', 'Fabia IV'],
                'Octavia' => ['Octavia I', 'Octavia II', 'Octavia III', 'Octavia IV'],
                'Superb'  => ['Superb I', 'Superb II', 'Superb III'],
                'Kodiaq'  => [],
                'Karoq'   => [],
                'Rapid'   => [],
                'Scala'   => [],
            ],

            // ── SEAT ─────────────────────────────────────────────
            'Seat' => [
                'Ibiza'   => ['Ibiza III', 'Ibiza IV', 'Ibiza V'],
                'Leon'    => ['Leon I', 'Leon II', 'Leon III', 'Leon IV'],
                'Ateca'   => [],
                'Arona'   => [],
                'Tarraco' => [],
            ],

            // ── HYUNDAI ──────────────────────────────────────────
            'Hyundai' => [
                'i20'    => ['i20 I', 'i20 II', 'i20 III'],
                'i30'    => ['i30 I', 'i30 II', 'i30 III'],
                'i40'    => [],
                'Tucson' => ['Tucson I', 'Tucson II', 'Tucson III', 'Tucson IV'],
                'Santa Fe' => ['Santa Fe II', 'Santa Fe III', 'Santa Fe IV'],
                'ix35'   => [],
                'Kona'   => ['Kona I', 'Kona Electric'],
            ],

            // ── KIA ──────────────────────────────────────────────
            'Kia' => [
                'Picanto'  => ['Picanto I', 'Picanto II', 'Picanto III'],
                'Rio'      => ['Rio II', 'Rio III', 'Rio IV'],
                'Ceed'     => ['Ceed I', 'Ceed II', 'Ceed III'],
                'Sportage' => ['Sportage II', 'Sportage III', 'Sportage IV', 'Sportage V'],
                'Sorento'  => ['Sorento I', 'Sorento II', 'Sorento III', 'Sorento IV'],
                'Stinger'  => [],
                'EV6'      => [],
            ],

            // ── MAZDA ────────────────────────────────────────────
            'Mazda' => [
                'Mazda2' => [],
                'Mazda3' => ['Mazda3 BK', 'Mazda3 BL', 'Mazda3 BM', 'Mazda3 BP'],
                'Mazda6' => ['Mazda6 GG', 'Mazda6 GH', 'Mazda6 GJ'],
                'CX-3'   => [],
                'CX-5'   => ['CX-5 I', 'CX-5 II'],
                'CX-30'  => [],
                'MX-5'   => ['MX-5 NA', 'MX-5 NB', 'MX-5 NC', 'MX-5 ND'],
            ],

            // ── NISSAN ───────────────────────────────────────────
            'Nissan' => [
                'Micra'   => ['Micra K11', 'Micra K12', 'Micra K13', 'Micra K14'],
                'Juke'    => ['Juke I', 'Juke II'],
                'Qashqai' => ['Qashqai I', 'Qashqai II', 'Qashqai III'],
                'X-Trail' => ['X-Trail T30', 'X-Trail T31', 'X-Trail T32'],
                'Navara'  => ['Navara D22', 'Navara D40', 'Navara D23'],
                'GT-R'    => [],
                'Leaf'    => ['Leaf I', 'Leaf II'],
            ],

            // ── FIAT ─────────────────────────────────────────────
            'Fiat' => [
                'Punto'   => ['Punto I', 'Punto II', 'Grande Punto', 'Punto Evo'],
                'Panda'   => ['Panda II', 'Panda III'],
                'Tipo'    => ['Tipo I', 'Tipo II'],
                '500'     => ['500 (2007)', '500X', '500L', '500e'],
                'Bravo'   => [],
                'Ducato'  => ['Ducato II', 'Ducato III'],
                'Doblo'   => ['Doblo I', 'Doblo II'],
            ],

            // ── ALFA ROMEO ───────────────────────────────────────
            'Alfa Romeo' => [
                'Giulia'  => ['Giulia 2.0T', 'Giulia 2.2d', 'Giulia Quadrifoglio'],
                'Stelvio' => ['Stelvio 2.0T', 'Stelvio 2.2d', 'Stelvio Quadrifoglio'],
                'Giulietta' => ['Giulietta 1.4T', 'Giulietta 1.6d', 'Giulietta 1.8T'],
                '159'     => ['159 1.8', '159 2.2', '159 1.9d', '159 2.4d'],
                '147'     => [],
                'Mito'    => [],
                'Tonale'  => [],
            ],

            // ── PEUGEOT ──────────────────────────────────────────
            'Peugeot' => [
                '207'   => [],
                '208'   => ['208 I', '208 II'],
                '307'   => [],
                '308'   => ['308 I', '308 II', '308 III'],
                '407'   => [],
                '508'   => ['508 I', '508 II'],
                '2008'  => ['2008 I', '2008 II'],
                '3008'  => ['3008 I', '3008 II'],
                '5008'  => ['5008 I', '5008 II'],
                'Boxer' => ['Boxer II', 'Boxer III'],
                'Expert'=> ['Expert II', 'Expert III'],
            ],

            // ── CITROEN ──────────────────────────────────────────
            'Citroën' => [
                'C1'     => ['C1 I', 'C1 II'],
                'C2'     => [],
                'C3'     => ['C3 I', 'C3 II', 'C3 III'],
                'C4'     => ['C4 I', 'C4 II', 'C4 III'],
                'C5'     => ['C5 I', 'C5 II', 'C5 X'],
                'Berlingo' => ['Berlingo I', 'Berlingo II', 'Berlingo III'],
                'Jumper' => ['Jumper II', 'Jumper III'],
                'SpaceTourer' => [],
            ],

            // ── VOLVO ────────────────────────────────────────────
            'Volvo' => [
                'S40'  => ['S40 I', 'S40 II'],
                'S60'  => ['S60 I', 'S60 II', 'S60 III'],
                'S80'  => ['S80 I', 'S80 II'],
                'S90'  => [],
                'V40'  => [],
                'V60'  => ['V60 I', 'V60 II'],
                'V70'  => ['V70 II', 'V70 III'],
                'V90'  => [],
                'XC40' => [],
                'XC60' => ['XC60 I', 'XC60 II'],
                'XC90' => ['XC90 I', 'XC90 II'],
            ],

            // ── SUBARU ───────────────────────────────────────────
            'Subaru' => [
                'Impreza'  => ['Impreza GC', 'Impreza GD', 'Impreza GE', 'Impreza GJ', 'WRX STI'],
                'Forester' => ['Forester II', 'Forester III', 'Forester IV', 'Forester V'],
                'Outback'  => ['Outback III', 'Outback IV', 'Outback V', 'Outback VI'],
                'Legacy'   => ['Legacy IV', 'Legacy V', 'Legacy VI'],
                'XV'       => ['XV I', 'XV II'],
                'BRZ'      => [],
            ],

            // ── MITSUBISHI ───────────────────────────────────────
            'Mitsubishi' => [
                'Lancer'  => ['Lancer VIII', 'Lancer IX', 'Lancer X', 'Lancer Evolution'],
                'Outlander' => ['Outlander I', 'Outlander II', 'Outlander III', 'Outlander PHEV'],
                'ASX'     => [],
                'Pajero'  => ['Pajero II', 'Pajero III', 'Pajero IV'],
                'Eclipse Cross' => [],
                'L200'    => ['L200 III', 'L200 IV', 'L200 V'],
            ],

            // ── SUZUKI ───────────────────────────────────────────
            'Suzuki' => [
                'Swift'   => ['Swift II', 'Swift III', 'Swift IV', 'Swift V'],
                'Vitara'  => ['Vitara I', 'Vitara II', 'Grand Vitara'],
                'SX4'     => ['SX4 I', 'SX4 S-Cross'],
                'Jimny'   => ['Jimny III', 'Jimny IV'],
                'Ignis'   => [],
                'Baleno'  => [],
            ],

            // ── JEEP ─────────────────────────────────────────────
            'Jeep' => [
                'Wrangler'  => ['Wrangler TJ', 'Wrangler JK', 'Wrangler JL'],
                'Grand Cherokee' => ['Grand Cherokee WJ', 'Grand Cherokee WK', 'Grand Cherokee WK2', 'Grand Cherokee WL'],
                'Cherokee'  => ['Cherokee KJ', 'Cherokee KK', 'Cherokee KL'],
                'Compass'   => ['Compass I', 'Compass II'],
                'Renegade'  => [],
                'Gladiator' => [],
            ],

            // ── DACIA ────────────────────────────────────────────
            'Dacia' => [
                'Sandero'  => ['Sandero I', 'Sandero II', 'Sandero III', 'Sandero Stepway'],
                'Logan'    => ['Logan I', 'Logan II', 'Logan III', 'Logan MCV'],
                'Duster'   => ['Duster I', 'Duster II'],
                'Dokker'   => [],
                'Lodgy'    => [],
                'Spring'   => [],
            ],
        ];

        foreach ($data as $makeName => $series) {
            if (!isset($makes[$makeName])) continue;
            $makeId = $makes[$makeName];

            foreach ($series as $seriesName => $children) {
                // Unesi seriju/klasu kao parent
                $parentId = DB::table('vehicle_models')->insertGetId([
                    'make_id'    => $makeId,
                    'parent_id'  => null,
                    'name'       => $seriesName,
                    'slug'       => Str::slug($makeName . '-' . $seriesName) . '-' . uniqid(),
                    'year_from'  => null,
                    'year_to'    => null,
                    'is_active'  => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Unesi konkretne modele kao djecu
                foreach ($children as $childName) {
                    DB::table('vehicle_models')->insert([
                        'make_id'    => $makeId,
                        'parent_id'  => $parentId,
                        'name'       => $childName,
                        'slug'       => Str::slug($makeName . '-' . $childName) . '-' . uniqid(),
                        'year_from'  => null,
                        'year_to'    => null,
                        'is_active'  => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}