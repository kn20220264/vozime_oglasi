<?php
 
namespace App\Http\Resources;
 
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
 
class AdDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // ==========================================
            // OSNOVNI PODACI
            // ==========================================
            'id'               => $this->id,
            'ad_code'          => $this->ad_code,
            'slug'             => $this->slug,
            'title'            => $this->title,
            'description'      => $this->description,
            'price'            => $this->price,
            'price_negotiable' => $this->price_negotiable,
            'currency'         => $this->currency,
            'status'           => $this->status,
            'featured'         => $this->featured,
            'views_count'      => $this->views_count,
            'expires_at'       => $this->expires_at?->format('d.m.Y'),
            'created_at'       => $this->created_at->format('d.m.Y'),
            'created_ago'      => $this->created_at->diffForHumans(),
 
            // ==========================================
            // TEHNIČKI PODACI
            // ==========================================
            'year'             => $this->year,
            'mileage'          => $this->mileage,
            'fuel_type'        => $this->fuel_type,
            'transmission'     => $this->transmission,
            'body_type'        => $this->body_type,
            'power_kw'         => $this->power_kw,
            'engine_cc'        => $this->engine_cc,
            'drive_type'       => $this->drive_type,
            'doors'            => $this->doors,
            'seats'            => $this->seats,
            'emission_class'   => $this->emission_class,
            'color_exterior'   => $this->color_exterior,
            'color_interior'   => $this->color_interior,
 
            // ==========================================
            // STANJE VOZILA
            // ==========================================
            'condition'        => $this->condition,
            'damage'           => $this->damage,
            'owners_count'     => $this->owners_count,
            'registered_until' => $this->registered_until?->format('d.m.Y'),
            'has_service_book' => $this->has_service_book,
            'has_warranty'     => $this->has_warranty,
            'accepts_exchange' => $this->accepts_exchange,
            'import'           => $this->import,
            'vin'              => $this->vin,
 
            // ==========================================
            // RELACIJE
            // ==========================================
            'city' => $this->whenLoaded('city', fn() => [
                'id'        => $this->city->id,
                'name'      => $this->city->name,
                'region'    => $this->city->region,
                'latitude'  => $this->city->latitude,
                'longitude' => $this->city->longitude,
            ]),
 
            'make' => $this->whenLoaded('make', fn() => [
                'id'   => $this->make->id,
                'name' => $this->make->name,
                'slug' => $this->make->slug,
            ]),
 
            'model' => $this->whenLoaded('vehicleModel', fn() => [
                'id'   => $this->vehicleModel->id,
                'name' => $this->vehicleModel->name,
                'slug' => $this->vehicleModel->slug,
            ]),
 
            'category' => $this->whenLoaded('category', fn() => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
 
            'images' => $this->whenLoaded('images', fn() =>
                $this->images->map(fn($image) => [
                    'id'         => $image->id,
                    'url'        => asset('storage/' . $image->path),
                    'is_primary' => $image->is_primary,
                    'order'      => $image->order,
                ])
            ),
 
            'equipment' => $this->whenLoaded('equipment', fn() =>
                $this->equipment
                    ->groupBy('category')
                    ->map(fn($items) => $items->pluck('name'))
            ),
 
            'seller' => $this->whenLoaded('user', fn() => [
                'id'             => $this->user->id,
                'name'           => $this->user->name,
                'phone'          => $this->user->phone,
                'role'           => $this->user->role,
                'premium_seller' => $this->user->isPremiumSeller(),
                'avatar'         => $this->user->avatar
                    ? asset('storage/' . $this->user->avatar)
                    : null,
                'member_since'   => $this->user->created_at->format('Y'),
                'company'        => $this->user->role === 'dealer' && $this->user->relationLoaded('profile')
                    ? [
                        'name'          => $this->user->profile?->company_name,
                        'logo'          => $this->user->profile?->logo
                            ? asset('storage/' . $this->user->profile->logo)
                            : null,
                        'address'       => $this->user->profile?->address,
                        'website'       => $this->user->profile?->website,
                        'working_hours' => $this->user->profile?->working_hours,
                        'description'   => $this->user->profile?->description,
                    ]
                    : null,
            ]),
 
            'is_favorited' => $this->whenLoaded('favorites', fn() =>
                $this->favorites->contains('user_id', auth()->id())
            ),
        ];
    }
}