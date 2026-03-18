<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedSearch;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    // GET /api/saved-searches
    public function index(Request $request)
    {
        $searches = SavedSearch::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($searches);
    }

    // POST /api/saved-searches
    public function store(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:100',
            'filters' => 'required|array',
            'notify'  => 'boolean',
        ]);

        $search = SavedSearch::create([
            'user_id' => $request->user()->id,
            'name'    => $request->name,
            'filters' => $request->filters,
            'notify'  => $request->notify ?? false,
        ]);

        return response()->json([
            'message' => 'Pretraga sačuvana.',
            'search'  => $search,
        ], 201);
    }

    // DELETE /api/saved-searches/{id}
    public function destroy(Request $request, int $id)
    {
        SavedSearch::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail()
            ->delete();

        return response()->json(['message' => 'Sačuvana pretraga obrisana.']);
    }
}