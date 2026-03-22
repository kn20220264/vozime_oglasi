<?php

namespace App\Http\Requests\Ad;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Nakon što ruta postane {ad}, route model binding daje objekat
        $ad = $this->route('ad');
        if (!$ad) return false;

        return auth()->check() && (
            $ad->user_id === auth()->id() ||
            in_array(auth()->user()->role, ['admin', 'moderator'])
        );
    }
    public function rules(): array
    {
        // Jedina razlika od StoreAdRequest je 'sometimes'
        // 'sometimes' znaci: validiraj SAMO ako je polje poslano
        // Korisnik ne mora slati sve podatke, samo one koje mijenja
        return [
            'title'            => ['sometimes', 'string', 'min:10', 'max:100'],
            'description'      => ['sometimes', 'string', 'min:30'],
            'price'            => ['sometimes', 'numeric', 'min:1'],
            'price_negotiable' => ['sometimes', 'boolean'],

            'category_id'      => ['sometimes', 'exists:vehicle_categories,id'],
            'make_id'          => ['sometimes', 'exists:makes,id'],
            'model_id'         => ['sometimes', 'exists:vehicle_models,id'],
            'city_id'          => ['sometimes', 'exists:cities,id'],

            'year'             => ['sometimes', 'integer', 'min:1900', 'max:' . date('Y')],
            'mileage'          => ['sometimes', 'integer', 'min:0'],
            'fuel_type'        => ['sometimes', 'in:benzin,dizel,hibrid,elektro,plin,benzin+plin'],
            'transmission'     => ['sometimes', 'in:manuelni,automatik,poluautomatik'],
            'body_type'        => ['sometimes', 'in:sedan,karavan,suv,hatchback,coupe,kabrio,van,pickup'],
            'power_kw'         => ['sometimes', 'integer', 'min:1'],
            'engine_cc'        => ['sometimes', 'nullable', 'integer', 'min:0'],
            'drive_type'       => ['sometimes', 'in:prednji,zadnji,4x4'],
            'doors'            => ['sometimes', 'integer', 'in:2,3,4,5'],
            'seats'            => ['sometimes', 'integer', 'min:1', 'max:9'],

            'condition'        => ['sometimes', 'in:novo,polovnjak'],
            'damage'           => ['sometimes', 'in:neosteceno,osteceno,nije_vozno'],
            'emission_class'   => ['sometimes', 'nullable', 'in:euro3,euro4,euro5,euro6'],
            'color_exterior'   => ['sometimes', 'string', 'max:50'],
            'color_interior'   => ['sometimes', 'nullable', 'string', 'max:50'],

            'owners_count'     => ['sometimes', 'nullable', 'integer', 'min:1'],
            'registered_until' => ['sometimes', 'nullable', 'date', 'after:today'],
            'vin'              => ['sometimes', 'nullable', 'string', 'size:17'],
            'has_service_book' => ['sometimes', 'boolean'],
            'has_warranty'     => ['sometimes', 'boolean'],
            'accepts_exchange' => ['sometimes', 'boolean'],
            'import'           => ['sometimes', 'boolean'],

            'equipment'        => ['sometimes', 'array'],
            'equipment.*'      => ['integer', 'exists:equipment,id'],

            // Slike pri izmjeni — dodavanje novih
            'images'           => ['sometimes', 'array'],
            'images.*'         => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],

            // ID-jevi slika koje korisnik želi obrisati
            'delete_images'    => ['sometimes', 'array'],
            'delete_images.*'  => ['integer', 'exists:ad_images,id'],

            // Koja slika postaje naslovna
            'primary_image_id' => ['sometimes', 'integer', 'exists:ad_images,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.min'              => 'Naslov mora imati najmanje 10 karaktera.',
            'title.max'              => 'Naslov ne smije biti duži od 100 karaktera.',
            'description.min'        => 'Opis mora imati najmanje 30 karaktera.',
            'price.min'              => 'Cijena mora biti veća od 0.',
            'year.min'               => 'Godište ne može biti prije 1900.',
            'year.max'               => 'Godište ne može biti u budućnosti.',
            'fuel_type.in'           => 'Odabrana vrsta goriva nije ispravna.',
            'transmission.in'        => 'Odabrana vrsta mjenjača nije ispravna.',
            'body_type.in'           => 'Odabrani tip karoserije nije ispravan.',
            'drive_type.in'          => 'Odabrani pogon nije ispravan.',
            'doors.in'               => 'Broj vrata mora biti 2, 3, 4 ili 5.',
            'condition.in'           => 'Stanje mora biti "novo" ili "polovnjak".',
            'damage.in'              => 'Odabrana vrijednost oštećenja nije ispravna.',
            'vin.size'               => 'VIN broj mora imati tačno 17 karaktera.',
            'registered_until.after' => 'Datum registracije mora biti u budućnosti.',
            'images.*.image'         => 'Svaki fajl mora biti slika.',
            'images.*.mimes'         => 'Dozvoljeni formati su: JPG, PNG, WEBP.',
            'images.*.max'           => 'Svaka slika ne smije biti veća od 5MB.',
            'delete_images.*.exists' => 'Jedna od slika za brisanje ne postoji.',
            'primary_image_id.exists' => 'Odabrana naslovna slika ne postoji.',
        ];
    }
}
