<?php

namespace App\Http\Requests\Ad;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdRequest extends FormRequest
{
    // Samo prijavljeni korisnici mogu objaviti oglas
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            // Osnovni podaci
            'title'            => ['required', 'string', 'min:10', 'max:100'],
            'description'      => ['required', 'string', 'min:30'],
            'price'            => ['required', 'numeric', 'min:1'],
            'price_negotiable' => ['boolean'],

            // Kategorija, marka, model
            'category_id'      => ['required', 'exists:vehicle_categories,id'],
            'make_id'          => ['required', 'exists:makes,id'],
            'model_id'         => ['required', 'exists:vehicle_models,id'],
            'city_id'          => ['required', 'exists:cities,id'],

            // Tehnički podaci
            'year'             => ['required', 'integer', 'min:1900', 'max:' . date('Y')],
            'mileage'          => ['required', 'integer', 'min:0'],
            'fuel_type'        => ['required', 'in:benzin,dizel,hibrid,elektro,plin,benzin+plin'],
            'transmission'     => ['required', 'in:manuelni,automatik,poluautomatik'],
            'body_type'        => ['required', 'in:sedan,karavan,suv,hatchback,coupe,kabrio,van,pickup'],
            'power_kw'         => ['required', 'integer', 'min:1'],
            'engine_cc'        => ['nullable', 'integer', 'min:0'],
            'drive_type'       => ['required', 'in:prednji,zadnji,4x4'],
            'doors'            => ['required', 'integer', 'in:2,3,4,5'],
            'seats'            => ['required', 'integer', 'min:1', 'max:9'],

            // Stanje
            'condition'        => ['required', 'in:novo,polovnjak'],
            'damage'           => ['required', 'in:neosteceno,osteceno,nije_vozno'],
            'emission_class'   => ['nullable', 'in:euro3,euro4,euro5,euro6'],
            'color_exterior'   => ['required', 'string', 'max:50'],
            'color_interior'   => ['nullable', 'string', 'max:50'],

            // Dodatne informacije
            'owners_count'        => ['nullable', 'integer', 'min:1'],
            'registered_until'    => ['nullable', 'date', 'after:today'],
            'vin'                 => ['nullable', 'string', 'size:17'],
            'has_service_book'    => ['boolean'],
            'has_warranty'        => ['boolean'],
            'accepts_exchange'    => ['boolean'],
            'import'              => ['boolean'],

            // Oprema (lista ID-jeva)
            'equipment'           => ['nullable', 'array'],
            'equipment.*'         => ['integer', 'exists:equipment,id'],

            // Slike (upload)
            'images'              => ['nullable', 'array', 'max:20'],
            'images.*'            => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'         => 'Naslov oglasa je obavezan.',
            'title.min'              => 'Naslov mora imati najmanje 10 karaktera.',
            'title.max'              => 'Naslov ne smije biti duži od 100 karaktera.',
            'description.required'   => 'Opis vozila je obavezan.',
            'description.min'        => 'Opis mora imati najmanje 30 karaktera.',
            'price.required'         => 'Cijena je obavezna.',
            'price.min'              => 'Cijena mora biti veća od 0.',
            'category_id.required'   => 'Kategorija vozila je obavezna.',
            'category_id.exists'     => 'Odabrana kategorija ne postoji.',
            'make_id.required'       => 'Marka vozila je obavezna.',
            'make_id.exists'         => 'Odabrana marka ne postoji.',
            'model_id.required'      => 'Model vozila je obavezan.',
            'model_id.exists'        => 'Odabrani model ne postoji.',
            'city_id.required'       => 'Grad je obavezan.',
            'city_id.exists'         => 'Odabrani grad ne postoji.',
            'year.required'          => 'Godište vozila je obavezno.',
            'year.min'               => 'Godište ne može biti prije 1900.',
            'year.max'               => 'Godište ne može biti u budućnosti.',
            'mileage.required'       => 'Kilometraža je obavezna.',
            'fuel_type.required'     => 'Vrsta goriva je obavezna.',
            'fuel_type.in'           => 'Odabrana vrsta goriva nije ispravna.',
            'transmission.required'  => 'Vrsta mjenjača je obavezna.',
            'transmission.in'        => 'Odabrana vrsta mjenjača nije ispravna.',
            'body_type.required'     => 'Tip karoserije je obavezan.',
            'body_type.in'           => 'Odabrani tip karoserije nije ispravan.',
            'power_kw.required'      => 'Snaga motora je obavezna.',
            'drive_type.required'    => 'Pogon vozila je obavezan.',
            'drive_type.in'          => 'Odabrani pogon nije ispravan.',
            'doors.required'         => 'Broj vrata je obavezan.',
            'doors.in'               => 'Broj vrata mora biti 2, 3, 4 ili 5.',
            'seats.required'         => 'Broj sjedišta je obavezan.',
            'condition.required'     => 'Stanje vozila je obavezno.',
            'condition.in'           => 'Stanje mora biti "novo" ili "polovnjak".',
            'damage.required'        => 'Oštećenje vozila je obavezno.',
            'damage.in'              => 'Odabrana vrijednost oštećenja nije ispravna.',
            'color_exterior.required'=> 'Boja karoserije je obavezna.',
            'vin.size'               => 'VIN broj mora imati tačno 17 karaktera.',
            'registered_until.after' => 'Datum registracije mora biti u budućnosti.',
            'images.max'             => 'Možete uploadovati najviše 20 slika.',
            'images.*.image'         => 'Svaki fajl mora biti slika.',
            'images.*.mimes'         => 'Dozvoljeni formati su: JPG, PNG, WEBP.',
            'images.*.max'           => 'Svaka slika ne smije biti veća od 5MB.',
            'equipment.*.exists'     => 'Jedna od odabranih stavki opreme ne postoji.',
        ];
    }
}
