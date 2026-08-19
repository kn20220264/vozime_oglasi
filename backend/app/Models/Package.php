<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'type',
        'price',
        'duration_days',
        'max_images',
        'max_active_ads',
        'refresh_days',
        'refresh_count',
        'auto_refresh',
        'featured',
        'premium_seller',
        'description',
        'is_active',
    ];

    protected $casts = [
        'featured'       => 'boolean',
        'is_active'      => 'boolean',
        'premium_seller' => 'boolean',
        'auto_refresh'   => 'boolean',
    ];

    public function userPackages()
    {
        return $this->hasMany(UserPackage::class);
    }
}