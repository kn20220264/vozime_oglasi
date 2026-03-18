<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // GET /api/users/{userId}/reviews
    public function index(int $userId)
    {
        $reviews = Review::with('reviewer')
            ->where('reviewed_id', $userId)
            ->orderByDesc('created_at')
            ->paginate(10);

        $avgRating = Review::where('reviewed_id', $userId)->avg('rating');

        return response()->json([
            'reviews'    => $reviews,
            'avg_rating' => round($avgRating, 1),
        ]);
    }

    // POST /api/users/{userId}/reviews
    public function store(Request $request, int $userId)
    {
        if ($userId === $request->user()->id) {
            return response()->json(['message' => 'Ne možete ocijeniti sami sebe.'], 422);
        }

        $exists = Review::where('reviewer_id', $request->user()->id)
            ->where('reviewed_id', $userId)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Već ste ocijenili ovog korisnika.'], 422);
        }

        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'reviewer_id' => $request->user()->id,
            'reviewed_id' => $userId,
            'rating'      => $request->rating,
            'comment'     => $request->comment,
        ]);

        return response()->json([
            'message' => 'Ocjena uspješno dodana.',
            'review'  => $review->load('reviewer'),
        ], 201);
    }
}