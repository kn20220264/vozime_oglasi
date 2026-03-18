<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Ad;
use App\Models\Package;

class UserPackage extends Model
{
    protected $fillable = [
        'user_id',
        'ad_id',
        'package_id',
        'paid_at',
        'expires_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Kupljeni paket pripada korisniku
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Kupljeni paket vezan za oglas
    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }

    // Kupljeni paket pripada paketu
    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    // Provjera da li je paket još aktivan
    public function isActive()
    {
        return $this->expires_at > now();
    }
}