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
        'ad_code',
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
        'vehicle_history',
        'trailer_coupling',
        'status',
        'views_count',
        'featured',
        'featured_until',
        'expires_at',
        'last_refreshed_at',
        'auto_refresh',
    ];

    protected $casts = [
        'price_negotiable' => 'boolean',
        'has_service_book' => 'boolean',
        'has_warranty'     => 'boolean',
        'accepts_exchange' => 'boolean',
        'import'           => 'boolean',
        'vehicle_history'  => 'array',
        'featured'         => 'boolean',
        'auto_refresh'     => 'boolean',
        'registered_until' => 'date',
        'featured_until'   => 'datetime',
        'expires_at'       => 'datetime',
        'last_refreshed_at'=> 'datetime',
    ];
 
    protected static function boot()
    {
        parent::boot();
 
        static::creating(function ($ad) {
            $ad->slug    = Str::slug($ad->title) . '-' . uniqid();
            $ad->ad_code = 'VM-' . strtoupper(Str::random(6));
        });
    }
 
    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function category()
    {
        return $this->belongsTo(VehicleCategory::class, 'category_id');
    }
 
    public function make()
    {
        return $this->belongsTo(Make::class);
    }
 
    public function vehicleModel()
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }
 
    public function city()
    {
        return $this->belongsTo(City::class);
    }
 
    public function images()
    {
        return $this->hasMany(AdImage::class);
    }
 
    public function primaryImage()
    {
        return $this->hasOne(AdImage::class)->where('is_primary', true);
    }
 
    public function equipment()
    {
        return $this->belongsToMany(Equipment::class, 'ad_equipment');
    }
 
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }
 
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
 
    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}