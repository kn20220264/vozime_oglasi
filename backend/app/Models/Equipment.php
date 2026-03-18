<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    protected $fillable = [
        'name',
        'category',
        'is_active',
    ];

    public function ads()
    {
        return $this->belongsToMany(Ad::class, 'ad_equipment');
    }
}