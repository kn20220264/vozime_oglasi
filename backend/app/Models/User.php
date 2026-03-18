<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar',
        'role',
        'is_active',
        'password',
    ];

    // Sakrivamo ove kolone kada vraćamo JSON
    // npr. nikad ne šaljemo password u odgovoru API-ja
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Laravel automatski konvertuje ove kolone
    // npr. email_verified_at će biti Carbon objekat umjesto stringa
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    // Relacija: korisnik ima jedan profil
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    // Relacija: korisnik ima mnogo oglasa
    public function ads()
    {
        return $this->hasMany(Ad::class);
    }

    // Relacija: korisnik ima mnogo omiljenih oglasa
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    // Relacija: korisnik ima mnogo sačuvanih pretraga
    public function savedSearches()
    {
        return $this->hasMany(SavedSearch::class);
    }

    // Relacija: korisnik je poslao mnogo poruka
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    // Relacija: korisnik je primio mnogo poruka
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    // Relacija: korisnik je dao mnogo ocjena
    public function givenReviews()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    // Relacija: korisnik je primio mnogo ocjena
    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'reviewed_id');
    }

    // Provjera da li je korisnik admin
   public function isAdmin(): bool
    {
    return $this->role === 'admin';
    }
    // Provjera da li je korisnik diler
    public function isDealer(): bool
    {
        return $this->role === 'dealer';
    }
    // Provjera da li je korisnik moderator
    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }
}