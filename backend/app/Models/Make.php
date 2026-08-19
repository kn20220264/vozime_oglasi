<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Make extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'logo',
        'country',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(VehicleCategory::class);
    }

    public function models()
    {
        return $this->hasMany(VehicleModel::class);
    }

    // Samo root modeli (bez parenta) — serije ili direktni modeli
    public function rootModels()
    {
        return $this->hasMany(VehicleModel::class)->whereNull('parent_id')->orderBy('name');
    }
}