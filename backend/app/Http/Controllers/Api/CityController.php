<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;

class CityController extends Controller
{
    // Svi gradovi CG — koristi se za dropdown u formi pretrage i objavi oglasa
    public function index(): JsonResponse
    {
        $cities = City::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'region', 'latitude', 'longitude']);

        return response()->json(['data' => $cities]);
    }
}
