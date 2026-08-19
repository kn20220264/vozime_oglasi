<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Ad;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // GET /api/messages — sve konverzacije korisnika
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // Grupisano po oglasu i sagovorniku
        $messages = Message::with(['sender', 'receiver', 'ad.primaryImage'])
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($messages);
    }

    // GET /api/messages/{adId}/{userId} — konverzacija za oglas
    public function conversation(Request $request, int $adId, int $otherUserId)
    {
        $myId = $request->user()->id;

        $messages = Message::with(['sender', 'receiver'])
            ->where('ad_id', $adId)
            ->where(function ($q) use ($myId, $otherUserId) {
                $q->where(function ($q2) use ($myId, $otherUserId) {
                    $q2->where('sender_id', $myId)->where('receiver_id', $otherUserId);
                })->orWhere(function ($q2) use ($myId, $otherUserId) {
                    $q2->where('sender_id', $otherUserId)->where('receiver_id', $myId);
                });
            })
            ->orderBy('created_at')
            ->get();

        // Označi kao pročitano
        Message::where('ad_id', $adId)
            ->where('sender_id', $otherUserId)
            ->where('receiver_id', $myId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    // POST /api/messages
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id|different:' . $request->user()->id,
            'ad_id'       => 'required|exists:ads,id',
            'body'        => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'ad_id'       => $request->ad_id,
            'body'        => $request->body,
        ]);

        return response()->json([
            'message' => 'Poruka poslata.',
            'data'    => $message->load(['sender', 'receiver']),
        ], 201);
    }

    // GET /api/messages/unread-count
    public function unreadCount(Request $request)
    {
        $count = Message::where('receiver_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $count]);
    }
}