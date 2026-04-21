<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FilterOption;

class FilterOptionsSeeder extends Seeder
{
    public function run(): void
    {
        FilterOption::truncate();

        $options = [];

        // ═══════════════════════════════════════
        // GORIVO
        // ═══════════════════════════════════════
        $fuels = [
            ['category' => 'auto', 'items' => [
                ['benzin',       'Benzin',        0],
                ['dizel',        'Dizel',         1],
                ['elektricno',   'Električno',    2],
                ['hibrid_benz',  'Hibrid Benzin', 3],
                ['hibrid_diz',   'Hibrid Dizel',  4],
                ['plin',         'Plin (LPG)',    5],
                ['metan',        'Metan (CNG)',   6],
                ['benzin_plin',  'Benzin+Plin',   7],
                ['vodik',        'Vodik',         8],
            ]],
            ['category' => 'motocikl', 'items' => [
                ['benzin',       'Benzin',        0],
                ['elektricno',   'Električno',    1],
            ]],
            ['category' => 'nautika', 'items' => [
                ['benzin',       'Benzin',        0],
                ['dizel',        'Dizel',         1],
                ['elektricno',   'Električno',    2],
            ]],
            ['category' => 'transport', 'items' => [
                ['benzin',       'Benzin',        0],
                ['dizel',        'Dizel',         1],
                ['benzin_plin',  'Benzin+Plin',   2],
                ['metan',        'Metan',         3],
                ['elektricno',   'Električno',    4],
                ['hibrid_benz',  'Hibrid Benzin', 5],
                ['hibrid_diz',   'Hibrid Dizel',  6],
            ]],
        ];
        foreach ($fuels as $group) {
            foreach ($group['items'] as [$value, $label, $sort]) {
                $options[] = ['category' => $group['category'], 'filter_type' => 'fuel_type', 'value' => $value, 'label' => $label, 'sort_order' => $sort];
            }
        }

        // ═══════════════════════════════════════
        // KAROSERIJA
        // ═══════════════════════════════════════
        $bodyTypes = [
            ['category' => 'auto', 'items' => [
                ['sedan',      'Sedan',       0],
                ['karavan',    'Karavan',     1],
                ['suv',        'SUV',         2],
                ['hatchback',  'Hatchback',   3],
                ['coupe',      'Kupe',        4],
                ['kabrio',     'Kabrio',      5],
                ['van',        'Van/Minivan', 6],
                ['pickup',     'Pickup',      7],
                ['limuzina',   'Limuzina',    8],
                ['crossover',  'Crossover',   9],
                ['terenac',    'Terenac',     10],
                ['kompakt',    'Kompakt',     11],
                ['roadster',   'Roadster',    12],
                ['targa',      'Targa',       13],
                ['kombibus',   'Kombibus',    14],
            ]],
            ['category' => 'motocikl', 'items' => [
                ['chopper',    'Chopper/Cruiser',       0],
                ['sport',      'Sport',                 1],
                ['touring',    'Touring',               2],
                ['naked',      'Naked Bike',            3],
                ['enduro',     'Enduro',                4],
                ['cross',      'Cross',                 5],
                ['skuter',     'Skuter',                6],
                ['quad',       'Quad/ATV',              7],
                ['moped',      'Moped',                 8],
                ['trial',      'Trial',                 9],
                ['trike',      'Trike',                 10],
                ['supermoto',  'Supermoto',             11],
            ]],
            ['category' => 'nautika', 'items' => [
                ['jedrilica',  'Jedrilica',     0],
                ['motorni',    'Motorni čamac', 1],
                ['gumenjak',   'Gumenjak',      2],
                ['katamaran',  'Katamaran',     3],
                ['skuter',     'Jet Ski/Skuter',4],
                ['jahta',      'Jahta',         5],
                ['ribolov',    'Ribolovni čamac',6],
                ['splavarenje','Splav',         7],
            ]],
            ['category' => 'transport', 'items' => [
                ['kamion',     'Kamion',        0],
                ['kombi',      'Kombi',         1],
                ['prikolica',  'Prikolica',     2],
                ['poluprik',   'Poluprikolica', 3],
                ['autobus',    'Autobus',       4],
                ['minibus',    'Minibus',       5],
                ['cistacica',  'Čistačica',     6],
                ['dizalica',   'Dizalica',      7],
                ['specijal',   'Specijalno vozilo',8],
                ['tegljac',    'Tegljač',       9],
            ]],
        ];
        foreach ($bodyTypes as $group) {
            foreach ($group['items'] as [$value, $label, $sort]) {
                $options[] = ['category' => $group['category'], 'filter_type' => 'body_type', 'value' => $value, 'label' => $label, 'sort_order' => $sort];
            }
        }

        // ═══════════════════════════════════════
        // MJENJAČ (sve kategorije)
        // ═══════════════════════════════════════
        $transmissions = [
            ['manuelni',      'Manuelni',       0],
            ['automatik',     'Automatik',      1],
            ['poluautomatik', 'Poluautomatik',  2],
            ['cvt',           'CVT',            3],
            ['dsg',           'DSG/DCT',        4],
            ['tiptronic',     'Tiptronic',      5],
        ];
        foreach ($transmissions as [$value, $label, $sort]) {
            $options[] = ['category' => null, 'filter_type' => 'transmission', 'value' => $value, 'label' => $label, 'sort_order' => $sort];
        }

        // ═══════════════════════════════════════
        // POGON
        // ═══════════════════════════════════════
        $driveTypes = [
            ['prednji', 'Prednji (FWD)', 0],
            ['zadnji',  'Zadnji (RWD)',  1],
            ['4x4',     '4x4 / AWD',    2],
            ['awd',     'AWD',          3],
        ];
        foreach ($driveTypes as [$value, $label, $sort]) {
            $options[] = ['category' => null, 'filter_type' => 'drive_type', 'value' => $value, 'label' => $label, 'sort_order' => $sort];
        }

        // ═══════════════════════════════════════
        // STANJE VOZILA
        // ═══════════════════════════════════════
        $conditions = [
            ['novo',      'Novo',      0],
            ['polovnjak', 'Polovnjak', 1],
        ];
        foreach ($conditions as [$value, $label, $sort]) {
            $options[] = ['category' => null, 'filter_type' => 'condition', 'value' => $value, 'label' => $label, 'sort_order' => $sort];
        }

        // ═══════════════════════════════════════
        // OŠTEĆENJE
        // ═══════════════════════════════════════
        $damages = [
            ['neosteceno', 'Neoštećeno', 0],
            ['osteceno',   'Oštećeno',   1],
            ['nije_vozno', 'Nije vozno', 2],
        ];
        foreach ($damages as [$value, $label, $sort]) {
            $options[] = ['category' => null, 'filter_type' => 'damage', 'value' => $value, 'label' => $label, 'sort_order' => $sort];
        }

        // ═══════════════════════════════════════
        // EURO NORMA
        // ═══════════════════════════════════════
        foreach (range(1, 7) as $i) {
            $options[] = ['category' => null, 'filter_type' => 'emission_class', 'value' => "euro{$i}", 'label' => "Euro {$i}", 'sort_order' => $i - 1];
        }

        // ═══════════════════════════════════════
        // BOJE EKSTERIJERA
        // ═══════════════════════════════════════
        $colorsExt = [
            ['bijela',    'Bijela',    '#FFFFFF', 0],
            ['crna',      'Crna',      '#1A1A1A', 1],
            ['siva',      'Siva',      '#808080', 2],
            ['srebrna',   'Srebrna',   '#C0C0C0', 3],
            ['crvena',    'Crvena',    '#CC0000', 4],
            ['plava',     'Plava',     '#0033CC', 5],
            ['zelena',    'Zelena',    '#006600', 6],
            ['zuta',      'Žuta',      '#FFCC00', 7],
            ['narandzasta','Narandžasta','#FF6600',8],
            ['braon',     'Braon',     '#663300', 9],
            ['bez',       'Bež',       '#F5F5DC', 10],
            ['bordo',     'Bordo',     '#800020', 11],
            ['ljubicasta','Ljubičasta','#800080', 12],
            ['zlatna',    'Zlatna',    '#FFD700', 13],
            ['ostale',    'Ostale',    null,      14],
        ];
        foreach ($colorsExt as [$value, $label, $hex, $sort]) {
            $options[] = [
                'category'    => null,
                'filter_type' => 'color_exterior',
                'value'       => $value,
                'label'       => $label,
                'sort_order'  => $sort,
                'metadata'    => $hex ? json_encode(['hex' => $hex]) : null,
            ];
        }

        // ═══════════════════════════════════════
        // BOJE INTERIJERA
        // ═══════════════════════════════════════
        $colorsInt = [
            ['crna',    'Crna',    '#1A1A1A', 0],
            ['siva',    'Siva',    '#808080', 1],
            ['bijela',  'Bijela',  '#FFFFFF', 2],
            ['bez',     'Bež',     '#F5F5DC', 3],
            ['crvena',  'Crvena',  '#CC0000', 4],
            ['braon',   'Braon',   '#663300', 5],
            ['plava',   'Plava',   '#0033CC', 6],
            ['ostale',  'Ostale',  null,      7],
        ];
        foreach ($colorsInt as [$value, $label, $hex, $sort]) {
            $options[] = [
                'category'    => null,
                'filter_type' => 'color_interior',
                'value'       => $value,
                'label'       => $label,
                'sort_order'  => $sort,
                'metadata'    => $hex ? json_encode(['hex' => $hex]) : null,
            ];
        }

        // ═══════════════════════════════════════
        // MATERIJAL SJEDIŠTA
        // ═══════════════════════════════════════
        $materials = [
            ['tkanina',     'Tkanina',     0],
            ['koza',        'Koža',        1],
            ['alcantara',   'Alcantara',   2],
            ['kombinovano', 'Kombinovano', 3],
            ['veganska',    'Veganska koža',4],
        ];
        foreach ($materials as [$value, $label, $sort]) {
            $options[] = ['category' => null, 'filter_type' => 'seat_material', 'value' => $value, 'label' => $label, 'sort_order' => $sort];
        }

        // ═══════════════════════════════════════
        // VALUTA
        // ═══════════════════════════════════════
        $currencies = [
            ['EUR', 'EUR (€)', 0],
            ['KM',  'KM',      1],
            ['RSD', 'RSD',     2],
        ];
        foreach ($currencies as [$value, $label, $sort]) {
            $options[] = ['category' => null, 'filter_type' => 'currency', 'value' => $value, 'label' => $label, 'sort_order' => $sort];
        }

        // ═══════════════════════════════════════
        // INSERT ALL
        // ═══════════════════════════════════════
        $now = now();
        $rows = array_map(function ($o) use ($now) {
            return array_merge([
                'parent_id'   => null,
                'category'    => null,
                'metadata'    => null,
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ], $o);
        }, $options);

        // Insert u chunkovima da ne premaši MySQL limit
        foreach (array_chunk($rows, 100) as $chunk) {
            FilterOption::insert($chunk);
        }

        $this->command->info('FilterOptionsSeeder: ' . count($rows) . ' opcija seedovano.');
    }
}