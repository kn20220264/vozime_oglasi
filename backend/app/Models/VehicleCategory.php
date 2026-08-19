<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleCategory extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'icon',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Roditeljska kategorija
    public function parent()
    {
        return $this->belongsTo(VehicleCategory::class, 'parent_id');
    }

    // Podkategorije
    public function children()
    {
        return $this->hasMany(VehicleCategory::class, 'parent_id')
                    ->orderBy('sort_order');
    }

    // Aktivne podkategorije
    public function activeChildren()
    {
        return $this->hasMany(VehicleCategory::class, 'parent_id')
                    ->where('is_active', true)
                    ->orderBy('sort_order');
    }

    // Marke koje pripadaju ovoj kategoriji
    public function makes()
    {
        return $this->hasMany(Make::class, 'category_id');
    }

    // Oglasi
    public function ads()
    {
        return $this->hasMany(Ad::class, 'category_id');
    }

    // Scope: samo root kategorije
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    // Scope: samo aktivne
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Da li je ovo root kategorija
    public function isRoot(): bool
    {
        return is_null($this->parent_id);
    }
}