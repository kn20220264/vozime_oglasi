<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FilterOption;
use Illuminate\Http\Request;

class FilterOptionController extends Controller
{
    // ═══════════════════════════════════════
    // JAVNI ENDPOINT — frontend čita odavde
    // GET /filter-options?category=auto&type=fuel_type
    // GET /filter-options?type=transmission
    // ═══════════════════════════════════════
    public function index(Request $request)
    {
        $query = FilterOption::active()
            ->root() // samo root opcije
            ->with(['children' => fn($q) => $q->active()->orderBy('sort_order')])
            ->orderBy('sort_order');

        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        if ($request->filled('category')) {
            $query->forCategory($request->category);
        }

        return response()->json($query->get());
    }

    // GET /filter-options/all — svi tipovi za sve kategorije (za admin pregled)
    public function allGrouped(Request $request)
    {
        $this->requireAdmin($request);

        $options = FilterOption::with(['children' => fn($q) => $q->orderBy('sort_order')])
            ->root()
            ->orderBy('filter_type')
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get();

        // Grupiramo po filter_type pa category
        $grouped = $options->groupBy('filter_type')->map(function ($items) {
            return $items->groupBy(fn($item) => $item->category ?? 'all');
        });

        return response()->json($grouped);
    }

    // ═══════════════════════════════════════
    // ADMIN CRUD
    // ═══════════════════════════════════════

    // GET /admin/filter-options — lista sa filterima
    public function adminIndex(Request $request)
    {
        $this->requireAdmin($request);

        $query = FilterOption::with(['children' => fn($q) => $q->orderBy('sort_order')])
            ->root()
            ->orderBy('sort_order');

        if ($request->filled('filter_type')) {
            $query->where('filter_type', $request->filter_type);
        }

        if ($request->filled('category')) {
            $query->where(function ($q) use ($request) {
                $q->where('category', $request->category)
                  ->orWhereNull('category');
            });
        }

        return response()->json($query->get());
    }

    // POST /admin/filter-options
    public function store(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'parent_id'   => 'nullable|exists:filter_options,id',
            'category'    => 'nullable|string|max:50',
            'filter_type' => 'required|string|max:80',
            'value'       => 'required|string|max:100',
            'label'       => 'required|string|max:150',
            'sort_order'  => 'integer|min:0',
            'is_active'   => 'boolean',
            'metadata'    => 'nullable|array',
        ]);

        // Provjeri duplikat
        $exists = FilterOption::where('filter_type', $request->filter_type)
            ->where('value', $request->value)
            ->where('category', $request->category)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ova opcija već postoji za ovaj tip i kategoriju.'], 422);
        }

        $option = FilterOption::create([
            'parent_id'   => $request->parent_id,
            'category'    => $request->category,
            'filter_type' => $request->filter_type,
            'value'       => $request->value,
            'label'       => $request->label,
            'sort_order'  => $request->sort_order ?? 0,
            'is_active'   => $request->boolean('is_active', true),
            'metadata'    => $request->metadata,
        ]);

        return response()->json(['message' => 'Opcija dodana.', 'option' => $option->load('children')], 201);
    }

    // PUT /admin/filter-options/{id}
    public function update(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $request->validate([
            'parent_id'   => 'nullable|exists:filter_options,id',
            'category'    => 'nullable|string|max:50',
            'filter_type' => 'required|string|max:80',
            'value'       => 'required|string|max:100',
            'label'       => 'required|string|max:150',
            'sort_order'  => 'integer|min:0',
            'is_active'   => 'boolean',
            'metadata'    => 'nullable|array',
        ]);

        $option = FilterOption::findOrFail($id);
        $option->update([
            'parent_id'   => $request->parent_id,
            'category'    => $request->category,
            'filter_type' => $request->filter_type,
            'value'       => $request->value,
            'label'       => $request->label,
            'sort_order'  => $request->sort_order ?? $option->sort_order,
            'is_active'   => $request->boolean('is_active', $option->is_active),
            'metadata'    => $request->metadata ?? $option->metadata,
        ]);

        return response()->json(['message' => 'Opcija ažurirana.', 'option' => $option->fresh('children')]);
    }

    // DELETE /admin/filter-options/{id}
    public function destroy(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $option = FilterOption::findOrFail($id);

        // Provjeri ima li podvrijednosti
        if ($option->children()->count() > 0) {
            return response()->json([
                'message' => 'Ne možete obrisati opciju koja ima podvrijednosti. Prvo obrišite podvrijednosti.'
            ], 422);
        }

        $option->delete();
        return response()->json(['message' => 'Opcija obrisana.']);
    }

    // PUT /admin/filter-options/reorder — drag & drop redoslijed
    // Body: { items: [{id: 1, sort_order: 0}, {id: 2, sort_order: 1}, ...] }
    public function reorder(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'items'             => 'required|array',
            'items.*.id'        => 'required|integer|exists:filter_options,id',
            'items.*.sort_order'=> 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            FilterOption::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Redoslijed sačuvan.']);
    }

    // ═══════════════════════════════════════
    // HELPER
    // ═══════════════════════════════════════
    private function requireAdmin(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            abort(403, 'Samo admin može upravljati filter opcijama.');
        }
    }
}