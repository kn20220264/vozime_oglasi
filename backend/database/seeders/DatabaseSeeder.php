<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CitiesSeeder::class,
            VehicleCategoriesSeeder::class,
            MakesSeeder::class,
            VehicleModelsSeeder::class,
            EquipmentSeeder::class,
            PackagesSeeder::class,
            UsersSeeder::class,
            AdsSeeder::class,
        ]);
    }
}