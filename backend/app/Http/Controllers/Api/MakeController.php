<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Make;
use App\Models\VehicleModel;
use Illuminate\Http\Request;

class MakeController extends Controller
{
    // GET /makes?category_id=1
    // Javni endpoint — vraća marke po kategoriji
    public function index(Request $request)
    {
        $makes = Make::where('is_active', true)
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo', 'country', 'category_id']);

        return response()->json(['data' => $makes]);
    }

    // GET /makes/{make}/models
    // Vraća root modele (serije) sa njihovim podmodelima
    public function models(Make $make)
    {
        $models = VehicleModel::where('make_id', $make->id)
            ->whereNull('parent_id')
            ->with(['children' => fn($q) => $q->where('is_active', true)->orderBy('name')])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $models]);
    }

// GET /makes/popular
public function popular()
{
    $makes = Make::where('is_active', true)
        ->limit(10)
        ->get(['id', 'name', 'slug', 'logo', 'category_id']);

    $makes->each(function ($make) {
        $make->ads_count = \App\Models\Ad::where('make_id', $make->id)
            ->where('status', 'active')
            ->count();
    });

    return response()->json([
        'data' => $makes->sortByDesc('ads_count')->values()
    ]);
}

}