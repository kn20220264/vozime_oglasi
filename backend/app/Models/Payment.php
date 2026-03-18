<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'user_package_id',
        'amount',
        'currency',
        'gateway',
        'status',
    ];

    // Plaćanje pripada korisniku
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Plaćanje je vezano za kupljeni paket
    public function userPackage()
    {
        return $this->belongsTo(UserPackage::class);
    }

    // Provjera da li je plaćanje uspješno
    public function isCompleted()
    {
        return $this->status === 'completed';
    }
}