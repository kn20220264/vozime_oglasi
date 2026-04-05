<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Make;
use App\Models\VehicleModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MakeController extends Controller
{
    public function index(): JsonResponse
    {
        $makes = Make::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'country', 'logo']);

        return response()->json(['data' => $makes]);
    }

    // Hijerarhijski modeli jedne marke (serije + podmodeli)
    public function models(Make $make): JsonResponse
    {
        $series = VehicleModel::where('make_id', $make->id)
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('name')
            ->with(['children' => fn($q) => $q->where('is_active', true)->orderBy('name')])
            ->get(['id', 'make_id', 'name', 'slug', 'parent_id']);

        return response()->json(['data' => $series]);
    }

    // Modeli za vise marki odjednom — GET /makes/models-multi?make_ids=1,2,3
    public function modelsMulti(Request $request): JsonResponse
    {
        $makeIds = array_filter(array_map('intval', explode(',', $request->get('make_ids', ''))));

        if (empty($makeIds)) {
            return response()->json(['data' => []]);
        }

        $series = VehicleModel::whereIn('make_id', $makeIds)
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('name')
            ->with([
                'children' => fn($q) => $q->where('is_active', true)->orderBy('name'),
                'make:id,name',
            ])
            ->get(['id', 'make_id', 'name', 'slug', 'parent_id']);

        return response()->json(['data' => $series]);
    }

    public function popular(): JsonResponse
    {
        $makes = Make::select('makes.id', 'makes.name', 'makes.slug', 'makes.logo')
            ->join('ads', 'ads.make_id', '=', 'makes.id')
            ->where('ads.status', 'active')
            ->where('makes.is_active', true)
            ->groupBy('makes.id', 'makes.name', 'makes.slug', 'makes.logo')
            ->orderByRaw('COUNT(ads.id) DESC')
            ->selectRaw('COUNT(ads.id) as ads_count')
            ->limit(5)
            ->get();

        return response()->json(['data' => $makes]);
    }
}