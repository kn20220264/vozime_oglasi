<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'ad_id',
        'reason',
        'description',
        'status',
    ];

    // Prijava pripada korisniku koji je prijavio
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Prijava je vezana za oglas
    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }
}