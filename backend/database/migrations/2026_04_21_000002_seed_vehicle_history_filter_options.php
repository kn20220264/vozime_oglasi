<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $options = [
            ['prvi_vlasnik',          'Prvi vlasnik',                    0],
            ['kupljen_nov_cg',        'Kupljen nov u Crnoj Gori',        1],
            ['servisna_knjiga',       'Servisna knjiga',                 2],
            ['restauriran',           'Restauriran',                     3],
            ['oldtimer',              'Old timer',                       4],
            ['u_garanciji',           'U garanciji',                     5],
            ['garaziran',             'Garažiran',                       6],
            ['prilagodjen_invalidima','Prilagođen invalidima',           7],
            ['tuning',                'Tuning',                          8],
        ];

        $rows = array_map(fn($o) => [
            'parent_id'   => null,
            'category'    => 'auto',
            'filter_type' => 'vehicle_history',
            'value'       => $o[0],
            'label'       => $o[1],
            'sort_order'  => $o[2],
            'metadata'    => null,
            'is_active'   => true,
            'created_at'  => $now,
            'updated_at'  => $now,
        ], $options);

        DB::table('filter_options')->insert($rows);
    }

    public function down(): void
    {
        DB::table('filter_options')
            ->where('filter_type', 'vehicle_history')
            ->delete();
    }
};