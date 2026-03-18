<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedSearch extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'filters',
        'notify',
    ];

    protected $casts = [
        // filters se čuva kao JSON u bazi
        // Laravel ga automatski konvertuje u PHP array
        'filters' => 'array',
        'notify' => 'boolean',
    ];

    // Sačuvana pretraga pripada jednom korisniku
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}