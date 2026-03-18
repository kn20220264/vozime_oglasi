<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model
{
    protected $fillable = [
        'make_id',
        'name',
        'slug',
        'year_from',
        'year_to',
        'is_active',
    ];

    // Relacija: model vozila pripada jednoj marki
    // npr. "Serija 3" pripada "BMW"
    public function make()
    {
        return $this->belongsTo(Make::class);
    }

    // Relacija: jedan model vozila ima mnogo oglasa
    // npr. svi oglasi za "Golf" su vezani za ovaj model
    public function ads()
    {
        return $this->hasMany(Ad::class, 'model_id');
    }
}