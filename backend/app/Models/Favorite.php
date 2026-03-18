<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $fillable = [
        'user_id',
        'ad_id',
    ];

    // Favorit pripada jednom korisniku
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Favorit pripada jednom oglasu
    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }
}
