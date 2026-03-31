<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'price',
        'duration_days',
        'max_images',
        'featured',
        'description',
        'is_active',
    ];

    protected $casts = [
        'featured'  => 'boolean',
        'is_active' => 'boolean',
    ];

    public function userPackages()
    {
        return $this->hasMany(UserPackage::class);
    }
}
