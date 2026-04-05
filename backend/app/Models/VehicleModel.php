<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model
{
    protected $fillable = [
        'make_id', 'parent_id', 'name', 'slug',
        'year_from', 'year_to', 'is_active',
    ];

    public function make()
    {
        return $this->belongsTo(Make::class);
    }

    // Podmodeli (konkretni modeli unutar serije)
    public function children()
    {
        return $this->hasMany(VehicleModel::class, 'parent_id');
    }

    // Serija/klasa kojoj pripada
    public function parent()
    {
        return $this->belongsTo(VehicleModel::class, 'parent_id');
    }

    public function ads()
    {
        return $this->hasMany(Ad::class, 'model_id');
    }
}