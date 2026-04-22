<?php

namespace App\Console\Commands;

use App\Models\Ad;
use App\Models\UserPackage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RefreshFeaturedAds extends Command
{
    protected $signature   = 'ads:refresh-featured';
    protected $description = 'Osvježava istaknute oglase prema refresh_days logici paketa';

    public function handle(): void
    {
        $now = now();

        // Dohvati sve aktivne ad_boost user_packages s refresh_days
        $packages = UserPackage::with(['package', 'ad'])
            ->whereHas('package', fn($q) => $q->whereNotNull('refresh_days'))
            ->where('expires_at', '>', $now)
            ->whereNotNull('ad_id')
            ->get();

        $count = 0;

        foreach ($packages as $userPackage) {
            $ad      = $userPackage->ad;
            $package = $userPackage->package;

            if (!$ad || !$package->refresh_days) continue;

            // Provjeri da li je prošlo refresh_days dana od posljednjeg refresha
            $lastRefresh = $ad->updated_at ?? $ad->created_at;
            $daysSince   = $lastRefresh->diffInDays($now);

            if ($daysSince >= $package->refresh_days) {
                DB::table('ads')->where('id', $ad->id)->update([
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $count++;
            }
        }

        $this->info("Osvježeno {$count} oglasa.");
    }
}