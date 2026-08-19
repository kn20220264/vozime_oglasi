<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPrivilege extends Model
{
    protected $fillable = [
        'user_id',
        'granted_by',
        'privilege_key',
        'privilege_value',
        'expires_at',
        'note',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    // Da li je privilegija još aktivna
    public function isActive(): bool
    {
        return is_null($this->expires_at) || $this->expires_at->isFuture();
    }

    // Sve dostupne privilegije
    public static function availableKeys(): array
    {
        return [
            'free_listing'       => 'Besplatan oglas',
            'featured_bypass'    => 'Istaknuti oglas bez plaćanja',
            'unlimited_listings' => 'Neograničen broj oglasa',
            'verified_badge'     => 'Verified oznaka',
            'custom_max_ads'     => 'Prilagođen max broj oglasa',
            'custom_expiry_days' => 'Prilagođeno trajanje oglasa (dani)',
            'dealer_features'    => 'Dealer funkcionalnosti',
        ];
    }
}