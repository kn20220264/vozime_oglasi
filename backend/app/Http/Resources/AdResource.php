<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AdResource extends JsonResource
{
    public function toArray($request): array
    {
        // Provjeri da li fajl stvarno postoji na disku
        $primaryImage = null;
        if ($this->primaryImage) {
            $path = $this->primaryImage->path;
            if (Storage::disk('public')->exists($path)) {
                $primaryImage = '/storage/' . $path;
            }
        }

        return [
            'id'               => $this->id,
            'ad_code'          => $this->ad_code,
            'title'            => $this->title,
            'slug'             => $this->slug,
            'price'            => $this->price,
            'currency'         => $this->currency,
            'price_negotiable' => $this->price_negotiable,
            'year'             => $this->year,
            'mileage'          => $this->mileage,
            'fuel_type'        => $this->fuel_type,
            'transmission'     => $this->transmission,
            'body_type'        => $this->body_type,
            'power_kw'         => $this->power_kw,
            'engine_cc'        => $this->engine_cc,
            'condition'        => $this->condition,
            'damage'           => $this->damage,
            'status'           => $this->status,
            'views_count'      => $this->views_count,
            'featured'         => $this->featured,
            'featured_until'   => $this->featured_until,
            'primary_image'    => $primaryImage,
            'make'             => $this->make?->name,
            'model'            => $this->vehicleModel?->name,
            'city'             => $this->city ? ['name' => $this->city->name] : null,
            'user'             => [
                'id'             => $this->user?->id,
                'name'           => $this->user?->name,
                'premium_seller' => $this->user?->isPremiumSeller() ?? false,
            ],
            'created_at'       => $this->created_at,
            'last_refreshed_at'=> $this->last_refreshed_at,
            'auto_refresh'     => $this->auto_refresh,
        ];
    }
}