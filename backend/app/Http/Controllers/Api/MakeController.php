<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Make;
use App\Models\VehicleModel;
use Illuminate\Http\JsonResponse;

class MakeController extends Controller
{
    // Sve aktivne marke — koristi se za dropdown u formi pretrage
    public function index(): JsonResponse
    {
        $makes = Make::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'country']);

        return response()->json(['data' => $makes]);
    }

    // Modeli jedne marke — poziva se kada korisnik odabere marku
    // npr. odabere Volkswagen → dobija Golf, Passat, Polo...
    public function models(Make $make): JsonResponse
    {
        $models = VehicleModel::where('make_id', $make->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'year_from', 'year_to']);

        return response()->json(['data' => $models]);
    }
}