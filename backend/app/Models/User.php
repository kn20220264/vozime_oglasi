<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'phone',
        'avatar',
        'role',
        'is_active',
        'password',
        'google_id',
        'apple_id',
        'auth_provider',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'apple_id',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active'         => 'boolean',
        'password'          => 'hashed',
    ];

    // ─── Relacije ────────────────────────────────────────

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function ads()
    {
        return $this->hasMany(Ad::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function savedSearches()
    {
        return $this->hasMany(SavedSearch::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function givenReviews()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'reviewed_id');
    }

    public function privileges()
    {
        return $this->hasMany(UserPrivilege::class);
    }

    public function userPackages()
    {
        return $this->hasMany(UserPackage::class);
    }

    // ─── Helper metode ───────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isDealer(): bool
    {
        return $this->role === 'dealer';
    }

    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    // Provjera aktivne privilegije
    public function hasPrivilege(string $key): bool
    {
        return $this->privileges()
            ->where('privilege_key', $key)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    // Dohvati vrijednost privilegije
    public function getPrivilegeValue(string $key): ?string
    {
        $priv = $this->privileges()
            ->where('privilege_key', $key)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        return $priv?->privilege_value;
    }

    // Provjeri da li korisnik ima aktivan premium_seller paket (MAX)
    public function isPremiumSeller(): bool
    {
        return $this->userPackages()
            ->whereHas('package', fn($q) => $q->where('premium_seller', true))
            ->where('expires_at', '>', now())
            ->exists();
    }

    // Puno ime iz first_name + last_name, ili fallback na name
    public function getFullNameAttribute(): string
    {
        if ($this->first_name || $this->last_name) {
            return trim("{$this->first_name} {$this->last_name}");
        }
        return $this->name ?? '';
    }
}