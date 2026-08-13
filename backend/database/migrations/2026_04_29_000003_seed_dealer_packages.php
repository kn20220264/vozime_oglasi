<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('packages')->insert([
            [
                'name'               => 'Free Trial',
                'type'               => 'dealer',
                'price'              => 0.00,
                'duration_days'      => 30,
                'max_images'         => 20,
                'max_active_ads'     => 25,
                'gratis_premium_ads' => 2,
                'refresh_days'       => null,
                'premium_seller'     => false,
                'featured'           => false,
                'description'        => 'Besplatan probni period 30 dana. Uključuje Bronze funkcionalnosti: 25 aktivnih oglasa, 2 gratis plasiranih oglasa.',
                'is_active'          => true,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'name'               => 'Bronze',
                'type'               => 'dealer',
                'price'              => 50.00,
                'duration_days'      => 30,
                'max_images'         => 20,
                'max_active_ads'     => 25,
                'gratis_premium_ads' => 2,
                'refresh_days'       => null,
                'premium_seller'     => false,
                'featured'           => false,
                'description'        => 'Do 25 aktivnih oglasa. 2 gratis plasiranih oglasa (vrijednost 24€).',
                'is_active'          => true,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'name'               => 'Silver',
                'type'               => 'dealer',
                'price'              => 70.00,
                'duration_days'      => 30,
                'max_images'         => 20,
                'max_active_ads'     => 50,
                'gratis_premium_ads' => 4,
                'refresh_days'       => null,
                'premium_seller'     => false,
                'featured'           => false,
                'description'        => 'Do 50 aktivnih oglasa. 4 gratis plasiranih oglasa (vrijednost 48€).',
                'is_active'          => true,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'name'               => 'Gold',
                'type'               => 'dealer',
                'price'              => 90.00,
                'duration_days'      => 30,
                'max_images'         => 20,
                'max_active_ads'     => 75,
                'gratis_premium_ads' => 5,
                'refresh_days'       => null,
                'premium_seller'     => true,
                'featured'           => true,
                'description'        => 'Do 75 aktivnih oglasa. 5 gratis plasiranih oglasa (vrijednost 60€). Najpopularniji izbor!',
                'is_active'          => true,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'name'               => 'Platinum',
                'type'               => 'dealer',
                'price'              => 110.00,
                'duration_days'      => 30,
                'max_images'         => 30,
                'max_active_ads'     => 200,
                'gratis_premium_ads' => 6,
                'refresh_days'       => null,
                'premium_seller'     => true,
                'featured'           => true,
                'description'        => 'Do 200 aktivnih oglasa. 6 gratis plasiranih oglasa (vrijednost 72€).',
                'is_active'          => true,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('packages')
            ->where('type', 'dealer')
            ->delete();
    }
};
