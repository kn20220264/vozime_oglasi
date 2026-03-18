<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Make extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'logo',
        'country',
        'is_active',
    ];

    // Relacija: jedna marka ima mnogo modela
    // npr. BMW → Serija 3, Serija 5, X5...
    public function models()
    {
        return $this->hasMany(VehicleModel::class);
    }

    // Relacija: jedna marka ima mnogo oglasa
    public function ads()
    {
        return $this->hasMany(Ad::class);
    }
}