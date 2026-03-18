<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdResource extends JsonResource
{
    // Ova klasa se koristi za LISTU oglasa (/api/ads)
    // Vraća samo podatke koji su potrebni za karticu oglasa
    // NE vraća sve detalje — to radi AdDetailResource
    // Razlog: ako lista ima 50 oglasa, ne trebamo slati 50x cijeli oglas sa svom opremom i slikama

    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'slug'         => $this->slug,
            'title'        => $this->title,
            'price'        => $this->price,
            'price_negotiable' => $this->price_negotiable,
            'currency'     => $this->currency,
            'year'         => $this->year,
            'mileage'      => $this->mileage,
            'fuel_type'    => $this->fuel_type,
            'transmission' => $this->transmission,
            'body_type'    => $this->body_type,
            'power_kw'     => $this->power_kw,
            'condition'    => $this->condition,
            'damage'       => $this->damage,
            'featured'     => $this->featured,
            'views_count'  => $this->views_count,
            'created_at'   => $this->created_at->diffForHumans(), // "prije 2 dana"

            // Samo ime grada — ne trebamo koordinate u listi
            'city' => $this->whenLoaded('city', fn() => [
                'id'   => $this->city->id,
                'name' => $this->city->name,
            ]),

            // Samo ime marke
            'make' => $this->whenLoaded('make', fn() => [
                'id'   => $this->make->id,
                'name' => $this->make->name,
            ]),

            // Samo ime modela
            'model' => $this->whenLoaded('vehicleModel', fn() => [
                'id'   => $this->vehicleModel->id,
                'name' => $this->vehicleModel->name,
            ]),

            // Samo naslovna slika — jedna, ne cijeli niz
            'primary_image' => $this->whenLoaded('primaryImage', fn() =>
                $this->primaryImage
                    ? asset('storage/' . $this->primaryImage->path)
                    : null
            ),

            // Ime i avatar prodavca — kupac treba znati ko prodaje
            'seller' => $this->whenLoaded('user', fn() => [
                'id'     => $this->user->id,
                'name'   => $this->user->name,
                'role'   => $this->user->role,
                'avatar' => $this->user->avatar
                    ? asset('storage/' . $this->user->avatar)
                    : null,
            ]),
        ];
    }
}