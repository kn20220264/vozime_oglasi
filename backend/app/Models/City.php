<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    // Kolone u koje smijemo upisivati podatke
    protected $fillable = [
        'name',
        'region',
        'country',
        'latitude',
        'longitude',
        'is_active',
    ];

    // Relacija: grad ima mnogo oglasa
    public function ads()
    {
        return $this->hasMany(Ad::class);
    }

    // Relacija: grad ima mnogo korisničkih profila
    public function userProfiles()
    {
        return $this->hasMany(UserProfile::class);
    }
}
