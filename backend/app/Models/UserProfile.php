<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'pib',
        'address',
        'city_id',
        'description',
        'logo',
        'banner',
        'website',
        'working_hours',
    ];

    // Relacija: profil pripada jednom korisniku
    // npr. profil auto placa pripada korisniku "Marko"
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relacija: profil pripada jednom gradu
    // npr. auto plac se nalazi u Podgorici
    public function city()
    {
        return $this->belongsTo(City::class);
    }
}