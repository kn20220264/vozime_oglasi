<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'ad_id',
        'body',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    // Poruka ima pošiljaoca (korisnik koji šalje)
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Poruka ima primaoca (korisnik koji prima)
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    // Poruka je vezana za oglas
    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }

    // Provjera da li je poruka pročitana
    public function isRead()
    {
        return $this->read_at !== null;
    }
}