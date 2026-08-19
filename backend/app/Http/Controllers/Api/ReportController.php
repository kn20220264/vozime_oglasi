<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // POST /api/ads/{adId}/report
    public function store(Request $request, int $adId)
    {
        $request->validate([
            'reason'      => 'required|in:spam,lazno,duplikat,ostalo',
            'description' => 'nullable|string|max:500',
        ]);

        $exists = Report::where('user_id', $request->user()->id)
            ->where('ad_id', $adId)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Već ste prijavili ovaj oglas.'], 422);
        }

        Report::create([
            'user_id'     => $request->user()->id,
            'ad_id'       => $adId,
            'reason'      => $request->reason,
            'description' => $request->description,
            'status'      => 'pending',
        ]);

        return response()->json(['message' => 'Oglas uspješno prijavljen.']);
    }
}