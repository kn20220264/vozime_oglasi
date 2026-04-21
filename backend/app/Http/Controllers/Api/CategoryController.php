<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // GET /categories
    // Vraća samo root kategorije sa podkategorijama
    public function index()
    {
        $categories = VehicleCategory::active()
            ->root()
            ->with(['activeChildren'])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    // GET /categories/{id}/subcategories
    // Vraća podkategorije jedne kategorije
    public function subcategories(int $id)
    {
        $cat = VehicleCategory::findOrFail($id);
        $subs = $cat->activeChildren()->get();
        return response()->json(['data' => $subs]);
    }

    // ─── Admin CRUD ───────────────────────────────────────────

    // GET /admin/categories
    public function adminIndex(Request $request)
    {
        $this->requireAdmin($request);

        $cats = VehicleCategory::root()
            ->with(['children' => fn($q) => $q->withCount('makes')->orderBy('sort_order')])
            ->withCount('makes')
            ->orderBy('sort_order')
            ->get();

        return response()->json($cats);
    }

    // POST /admin/categories
    public function store(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'name'       => 'required|string|max:100',
            'parent_id'  => 'nullable|exists:vehicle_categories,id',
            'icon'       => 'nullable|string|max:10',
            'sort_order' => 'integer|min:0',
            'is_active'  => 'boolean',
        ]);

        // Sprječava više od 2 nivoa dubine
        if ($request->parent_id) {
            $parent = VehicleCategory::findOrFail($request->parent_id);
            if ($parent->parent_id) {
                return response()->json(['message' => 'Maksimalna dubina kategorija su 2 nivoa.'], 422);
            }
        }

        $cat = VehicleCategory::create([
            'parent_id'  => $request->parent_id,
            'name'       => $request->name,
            'slug'       => $this->uniqueSlug($request->name, $request->parent_id),
            'icon'       => $request->icon,
            'sort_order' => $request->sort_order ?? 0,
            'is_active'  => $request->boolean('is_active', true),
        ]);

        return response()->json(['message' => 'Kategorija dodana.', 'category' => $cat], 201);
    }

    // PUT /admin/categories/{id}
    public function update(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $request->validate([
            'name'       => 'required|string|max:100',
            'icon'       => 'nullable|string|max:10',
            'sort_order' => 'integer|min:0',
            'is_active'  => 'boolean',
        ]);

        $cat = VehicleCategory::findOrFail($id);
        $cat->update([
            'name'       => $request->name,
            'icon'       => $request->icon ?? $cat->icon,
            'sort_order' => $request->sort_order ?? $cat->sort_order,
            'is_active'  => $request->boolean('is_active', $cat->is_active),
        ]);

        return response()->json(['message' => 'Kategorija ažurirana.', 'category' => $cat->fresh('children')]);
    }

    // DELETE /admin/categories/{id}
    public function destroy(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $cat = VehicleCategory::withCount(['children', 'makes'])->findOrFail($id);

        if ($cat->children_count > 0) {
            return response()->json(['message' => 'Ne možete obrisati kategoriju koja ima podkategorije.'], 422);
        }

        if ($cat->makes_count > 0) {
            return response()->json(['message' => 'Ne možete obrisati kategoriju koja ima marke. Prvo premjestite marke.'], 422);
        }

        $cat->delete();
        return response()->json(['message' => 'Kategorija obrisana.']);
    }

    // PUT /admin/categories/reorder
    public function reorder(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'items'              => 'required|array',
            'items.*.id'         => 'required|integer|exists:vehicle_categories,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            VehicleCategory::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Redoslijed sačuvan.']);
    }

    // ─── Helpers ─────────────────────────────────────────────

    private function uniqueSlug(string $name, ?int $parentId): string
    {
        $base = Str::slug($name);
        if ($parentId) {
            $parent = VehicleCategory::find($parentId);
            $base = ($parent ? $parent->slug . '-' : '') . Str::slug($name);
        }
        $slug = $base;
        $i = 1;
        while (VehicleCategory::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }

    private function requireAdmin(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            abort(403, 'Samo admin može upravljati kategorijama.');
        }
    }
}