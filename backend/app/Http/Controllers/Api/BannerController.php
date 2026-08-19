<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class BannerController extends Controller
{
    // ── JAVNO ────────────────────────────────────────────────

    // GET /banners?position=popup|sidebar|homepage — aktivni baneri
    public function index(Request $request)
    {
        $banners = Banner::live()
            ->when($request->position, fn($q) => $q->where('position', $request->position))
            ->latest()
            ->get()
            ->map(fn($b) => [
                'id'       => $b->id,
                'title'    => $b->title,
                'image'    => asset('storage/' . $b->image_path),
                'link_url' => $b->link_url,
                'position' => $b->position,
            ]);

        return response()->json(['data' => $banners]);
    }

    // POST /banners/{id}/click — brojanje klikova
    public function click(int $id)
    {
        Banner::where('id', $id)->increment('clicks_count');
        return response()->json(['ok' => true]);
    }

    // POST /banners/{id}/view — brojanje prikaza
    public function view(int $id)
    {
        Banner::where('id', $id)->increment('views_count');
        return response()->json(['ok' => true]);
    }

    // ── ADMIN ────────────────────────────────────────────────

    private function requireAdmin(Request $request): void
    {
        if (!$request->user()?->isAdmin()) {
            abort(403, 'Samo admin može izvršiti ovu akciju.');
        }
    }

    // GET /admin/banners — svi baneri (i neaktivni)
    public function adminIndex(Request $request)
    {
        $this->requireAdmin($request);

        $banners = Banner::latest()->get()->map(fn($b) => [
            'id'           => $b->id,
            'title'        => $b->title,
            'image'        => asset('storage/' . $b->image_path),
            'link_url'     => $b->link_url,
            'position'     => $b->position,
            'is_active'    => $b->is_active,
            'starts_at'    => $b->starts_at,
            'ends_at'      => $b->ends_at,
            'clicks_count' => $b->clicks_count,
            'views_count'  => $b->views_count,
            'created_at'   => $b->created_at,
        ]);

        return response()->json(['data' => $banners]);
    }

    // POST /admin/banners
    public function store(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'title'     => 'required|string|max:255',
            'image'     => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:4096',
            'link_url'  => 'nullable|url|max:500',
            'position'  => ['required', Rule::in(['popup', 'sidebar', 'homepage'])],
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at'   => 'nullable|date|after:starts_at',
        ]);

        $path = $request->file('image')->store('banners', 'public');

        $banner = Banner::create([
            'title'     => $request->title,
            'image_path'=> $path,
            'link_url'  => $request->link_url,
            'position'  => $request->position,
            'is_active' => $request->boolean('is_active', true),
            'starts_at' => $request->starts_at,
            'ends_at'   => $request->ends_at,
        ]);

        return response()->json(['message' => 'Baner kreiran.', 'data' => $banner], 201);
    }

    // PUT /admin/banners/{id}
    public function update(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $banner = Banner::findOrFail($id);

        $request->validate([
            'title'     => 'sometimes|string|max:255',
            'image'     => 'sometimes|image|mimes:jpg,jpeg,png,webp,gif|max:4096',
            'link_url'  => 'sometimes|nullable|url|max:500',
            'position'  => ['sometimes', Rule::in(['popup', 'sidebar', 'homepage'])],
            'is_active' => 'sometimes|boolean',
            'starts_at' => 'sometimes|nullable|date',
            'ends_at'   => 'sometimes|nullable|date',
        ]);

        $data = $request->only(['title', 'link_url', 'position', 'starts_at', 'ends_at']);
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($banner->image_path);
            $data['image_path'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);

        return response()->json(['message' => 'Baner ažuriran.', 'data' => $banner]);
    }

    // DELETE /admin/banners/{id}
    public function destroy(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $banner = Banner::findOrFail($id);
        Storage::disk('public')->delete($banner->image_path);
        $banner->delete();

        return response()->json(['message' => 'Baner obrisan.']);
    }
}
