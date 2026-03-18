<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $podgoricaId = DB::table('cities')->where('name', 'Podgorica')->value('id');
        $barId       = DB::table('cities')->where('name', 'Bar')->value('id');
        $budvaId     = DB::table('cities')->where('name', 'Budva')->value('id');

        $users = [
            [
                'name'              => 'Admin VozIme',
                'email'             => 'admin@vozime.me',
                'phone'             => '+38267100001',
                'role'              => 'admin',
                'password'          => Hash::make('Admin1234!'),
                'email_verified_at' => now(),
                'is_active'         => true,
            ],
            [
                'name'              => 'Moderator Test',
                'email'             => 'moderator@vozime.me',
                'phone'             => '+38267100002',
                'role'              => 'moderator',
                'password'          => Hash::make('Mod1234!'),
                'email_verified_at' => now(),
                'is_active'         => true,
            ],
            [
                'name'              => 'AutoPlac Podgorica',
                'email'             => 'dealer@vozime.me',
                'phone'             => '+38267100003',
                'role'              => 'dealer',
                'password'          => Hash::make('Dealer1234!'),
                'email_verified_at' => now(),
                'is_active'         => true,
            ],
            [
                'name'              => 'Marko Nikolić',
                'email'             => 'marko@test.me',
                'phone'             => '+38267100004',
                'role'              => 'user',
                'password'          => Hash::make('User1234!'),
                'email_verified_at' => now(),
                'is_active'         => true,
            ],
            [
                'name'              => 'Ana Perović',
                'email'             => 'ana@test.me',
                'phone'             => '+38267100005',
                'role'              => 'user',
                'password'          => Hash::make('User1234!'),
                'email_verified_at' => now(),
                'is_active'         => true,
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->insert(array_merge($user, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // User profiles za dealera
        $dealerId = DB::table('users')->where('email', 'dealer@vozime.me')->value('id');
        DB::table('user_profiles')->insert([
            'user_id'      => $dealerId,
            'company_name' => 'AutoPlac Podgorica d.o.o.',
            'pib'          => '02345678',
            'address'      => 'Bulevar Džordža Vašingtona 15',
            'city_id'      => $podgoricaId,
            'description'  => 'Prodaja novih i polovnih vozila. U poslovanju od 2005. godine.',
            'website'      => 'https://autoplac-pg.me',
            'working_hours'=> 'Pon-Pet: 08-18h, Sub: 09-15h',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
    }
}