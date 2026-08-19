<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model
{
    protected $fillable = [
        'make_id',
        'parent_id',
        'name',
        'slug',
        'year_from',
        'year_to',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function make()
    {
        return $this->belongsTo(Make::class);
    }

    // Roditeljska serija (npr. Serija 3 za 320d)
    public function parent()
    {
        return $this->belongsTo(VehicleModel::class, 'parent_id');
    }

    // Podmodeli (npr. 318d, 320d, 330d unutar Serije 3)
    public function children()
    {
        return $this->hasMany(VehicleModel::class, 'parent_id')->orderBy('name');
    }

    // Scope: samo root modeli/serije
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }
}