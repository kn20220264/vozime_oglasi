<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\Equipment;
use App\Models\AdImage;
use App\Models\User;
use App\Models\VehicleCategory;
use App\Models\Make;
use App\Models\VehicleModel;
use App\Models\City;
use App\Models\Favorite;
use App\Models\Message;
use App\Models\Report;

class Ad extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'make_id',
        'model_id',
        'city_id',
        'title',
        'slug',
        'description',
        'price',
        'currency',
        'price_negotiable',
        'year',
        'mileage',
        'fuel_type',
        'transmission',
        'body_type',
        'power_kw',
        'engine_cc',
        'color_exterior',
        'color_interior',
        'drive_type',
        'doors',
        'seats',
        'condition',
        'damage',
        'emission_class',
        'owners_count',
        'registered_until',
        'vin',
        'has_service_book',
        'has_warranty',
        'accepts_exchange',
        'import',
        'status',
        'views_count',
        'featured',
        'featured_until',
        'expires_at',
    ];

    protected $casts = [
        'price_negotiable' => 'boolean',
        'has_service_book' => 'boolean',
        'has_warranty' => 'boolean',
        'accepts_exchange' => 'boolean',
        'import' => 'boolean',
        'featured' => 'boolean',
        'registered_until' => 'date',
        'featured_until' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Automatski kreira slug od naslova
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($ad) {
            $ad->slug = Str::slug($ad->title) . '-' . uniqid();
        });
    }

    // Oglas pripada jednom korisniku
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Oglas pripada jednoj kategoriji
    public function category()
    {
        return $this->belongsTo(VehicleCategory::class, 'category_id');
    }

    // Oglas pripada jednoj marki
    public function make()
    {
        return $this->belongsTo(Make::class);
    }

    // Oglas pripada jednom modelu vozila
    public function vehicleModel()
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    // Oglas pripada jednom gradu
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    // Oglas ima mnogo slika
    public function images()
    {
        return $this->hasMany(AdImage::class);
    }

    // Oglas ima jednu primarnu sliku
    public function primaryImage()
    {
        return $this->hasOne(AdImage::class)->where('is_primary', true);
    }

    // Oglas ima mnogo opreme (Many-to-Many)
    public function equipment()
    {
        return $this->belongsToMany(Equipment::class, 'ad_equipment');
    }

    // Oglas ima mnogo favorita
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    // Oglas ima mnogo poruka
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // Oglas ima mnogo prijava
    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}