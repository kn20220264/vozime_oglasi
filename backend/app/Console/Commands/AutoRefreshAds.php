<?php

namespace App\Console\Commands;

use App\Models\Ad;
use App\Models\UserPackage;
use Illuminate\Console\Command;

class AutoRefreshAds extends Command
{
    protected $signature   = 'ads:auto-refresh';
    protected $description = 'Automatski obnavlja oglase (bump na vrh) korisnicima sa aktivnim AUTO-REFRESH paketom, svakih 48h po oglasu';

    public function handle(): int
    {
        // Korisnici sa aktivnim auto-refresh paketom
        $userIds = UserPackage::whereNotNull('paid_at')
            ->where('expires_at', '>', now())
            ->whereHas('package', fn($q) => $q->where('type', 'refresh')->where('auto_refresh', true))
            ->pluck('user_id')
            ->unique();

        if ($userIds->isEmpty()) {
            $this->info('Nema korisnika sa aktivnim AUTO-REFRESH paketom.');
            return self::SUCCESS;
        }

        $ads = Ad::whereIn('user_id', $userIds)
            ->where('status', 'active')
            ->where('auto_refresh', true)
            ->where(function ($q) {
                $q->whereNull('last_refreshed_at')
                  ->orWhere('last_refreshed_at', '<=', now()->subHours(48));
            })
            ->get();

        foreach ($ads as $ad) {
            $ad->forceFill([
                'created_at'        => now(),
                'last_refreshed_at' => now(),
            ])->save();
        }

        $this->info("Obnovljeno oglasa: {$ads->count()}.");
        return self::SUCCESS;
    }
}
