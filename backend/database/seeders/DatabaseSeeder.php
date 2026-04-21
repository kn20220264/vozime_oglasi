<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            VehicleCategoriesSeeder::class,
            CitiesSeeder::class,
            MakesSeeder::class,
            VehicleModelsSeeder::class,
            EquipmentSeeder::class,
            PackagesSeeder::class,
            FilterOptionsSeeder::class,   // <-- novo
            UsersSeeder::class,
            AdsSeeder::class,
        ]);
    }
}