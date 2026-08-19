<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use Illuminate\Http\JsonResponse;

class EquipmentController extends Controller
{
    // Sva oprema grupirana po kategoriji
    // Frontend dobija { "safety": [...], "comfort": [...] }
    // i može prikazati checkboxe po grupama kao na polovniautomobili
    public function index(): JsonResponse
    {
        $equipment = Equipment::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'category'])
            ->groupBy('category');

        return response()->json(['data' => $equipment]);
    }
}