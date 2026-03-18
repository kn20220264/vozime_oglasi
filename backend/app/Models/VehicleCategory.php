<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'icon',
        'parent_id',
        'is_active',
        'order',
    ];

    // Relacija: kategorija može imati podkategorije
    // npr. "Vozila" → "Automobili", "Motocikli"
    public function children()
    {
        return $this->hasMany(VehicleCategory::class, 'parent_id');
    }

    // Relacija: podkategorija pripada roditeljskoj kategoriji
    public function parent()
    {
        return $this->belongsTo(VehicleCategory::class, 'parent_id');
    }

    // Relacija: kategorija ima mnogo oglasa
    public function ads()
    {
        return $this->hasMany(Ad::class, 'category_id');
    }
}
