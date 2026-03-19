<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleCategory;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = VehicleCategory::where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        return response()->json(['data' => $categories]);
    }
}