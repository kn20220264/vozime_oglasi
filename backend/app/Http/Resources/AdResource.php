<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AdResource extends JsonResource
{
    public function toArray($request): array
    {
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
            'primary_image'    => $this->primaryImage
                                    ? '/storage/' . $this->primaryImage->path
                                    : null,
            'make'             => $this->make?->name,
            'model'            => $this->vehicleModel?->name,
            'city'             => $this->city?->name,
            'user'             => [
                'id'             => $this->user?->id,
                'name'           => $this->user?->name,
                'premium_seller' => $this->user?->isPremiumSeller() ?? false,
            ],
            'created_at'       => $this->created_at,
        ];
    }
}