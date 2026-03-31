<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\User;
use App\Models\Report;
use App\Models\Make;
use App\Models\VehicleModel;
use App\Models\City;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
 
class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            if (!$user || (!$user->isAdmin() && !$user->isModerator())) {
                return response()->json(['message' => 'Zabranjen pristup.'], 403);
            }
            return $next($request);
        });
    }
 
    // Provjera je li admin (za admin-only akcije)
    private function requireAdmin(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            abort(403, 'Samo admin može izvršiti ovu akciju.');
        }
    }
 
    // ═══════════════════════════════════════
    // STATISTIKE
    // ═══════════════════════════════════════
 
    public function stats()
    {
        return response()->json([
            'total_ads'       => Ad::count(),
            'active_ads'      => Ad::where('status', 'active')->count(),
            'pending_ads'     => Ad::where('status', 'pending')->count(),
            'total_users'     => User::count(),
            'total_dealers'   => User::where('role', 'dealer')->count(),
            'pending_reports' => Report::where('status', 'pending')->count(),
            'ads_by_fuel'     => Ad::where('status', 'active')
                                   ->selectRaw('fuel_type, count(*) as count')
                                   ->groupBy('fuel_type')->get(),
            'ads_by_city'     => Ad::where('status', 'active')
                                   ->selectRaw('city_id, count(*) as count')
                                   ->with('city:id,name')
                                   ->groupBy('city_id')
                                   ->orderByDesc('count')
                                   ->limit(10)->get(),
            'ads_per_month'   => Ad::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, count(*) as count')
                                   ->groupBy('month')
                                   ->orderBy('month')
                                   ->limit(12)->get(),
        ]);
    }
 
    // ═══════════════════════════════════════
    // OGLASI
    // ═══════════════════════════════════════
 
    public function ads(Request $request)
    {
        $ads = Ad::with(['user', 'make', 'vehicleModel', 'city', 'primaryImage'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(25);
 
        return response()->json($ads);
    }
 
    public function updateAdStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,rejected,pending',
        ]);
 
        $ad = Ad::findOrFail($id);
        $ad->update(['status' => $request->status]);
 
        return response()->json(['message' => 'Status oglasa ažuriran.', 'ad' => $ad]);
    }
 
    public function deleteAd(Request $request, int $id)
    {
        $this->requireAdmin($request);
        $ad = Ad::findOrFail($id);
        $ad->delete();
 
        return response()->json(['message' => 'Oglas obrisan.']);
    }
 
    // ═══════════════════════════════════════
    // KORISNICI
    // ═══════════════════════════════════════
 
    public function users(Request $request)
    {
        $this->requireAdmin($request);
 
        $users = User::with('profile')
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->orderByDesc('created_at')
            ->paginate(25);
 
        return response()->json($users);
    }
 
    public function toggleUserActive(Request $request, int $id)
    {
        $this->requireAdmin($request);
 
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
 
        return response()->json([
            'message'   => $user->is_active ? 'Korisnik aktiviran.' : 'Korisnik deaktiviran.',
            'is_active' => $user->is_active,
        ]);
    }
 
    public function updateUserRole(Request $request, int $id)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'role' => 'required|in:user,dealer,moderator,admin',
        ]);
 
        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);
 
        return response()->json(['message' => 'Uloga korisnika ažurirana.', 'user' => $user]);
    }
 
    // ═══════════════════════════════════════
    // PRIJAVE
    // ═══════════════════════════════════════
 
    public function reports(Request $request)
    {
        $reports = Report::with(['user', 'ad'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(25);
 
        return response()->json($reports);
    }
 
    public function resolveReport(int $id)
    {
        $report = Report::findOrFail($id);
        $report->update(['status' => 'resolved']);
 
        return response()->json(['message' => 'Prijava riješena.']);
    }
 
    // ═══════════════════════════════════════
    // MARKE
    // ═══════════════════════════════════════
 
    public function makes(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(Make::orderBy('name')->get());
    }
 
    public function storeMake(Request $request)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'name'    => 'required|string|max:100|unique:makes,name',
            'country' => 'nullable|string|max:100',
        ]);
 
        $make = Make::create([
            'name'      => $request->name,
            'slug'      => Str::slug($request->name),
            'country'   => $request->country,
            'is_active' => true,
        ]);
 
        return response()->json(['message' => 'Marka dodana.', 'make' => $make], 201);
    }
 
    public function updateMake(Request $request, int $id)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'name'      => 'required|string|max:100|unique:makes,name,' . $id,
            'country'   => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);
 
        $make = Make::findOrFail($id);
        $make->update([
            'name'      => $request->name,
            'slug'      => Str::slug($request->name),
            'country'   => $request->country,
            'is_active' => $request->boolean('is_active', true),
        ]);
 
        return response()->json(['message' => 'Marka ažurirana.', 'make' => $make]);
    }
 
    public function deleteMake(Request $request, int $id)
    {
        $this->requireAdmin($request);
        Make::findOrFail($id)->delete();
        return response()->json(['message' => 'Marka obrisana.']);
    }
 
    // ═══════════════════════════════════════
    // MODELI
    // ═══════════════════════════════════════
 
    public function models(Request $request)
    {
        $this->requireAdmin($request);
        $models = VehicleModel::with('make')
            ->when($request->make_id, fn($q) => $q->where('make_id', $request->make_id))
            ->orderBy('name')
            ->get();
        return response()->json($models);
    }
 
    public function storeModel(Request $request)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'make_id'   => 'required|exists:makes,id',
            'name'      => 'required|string|max:100',
            'year_from' => 'nullable|integer|min:1900|max:2100',
            'year_to'   => 'nullable|integer|min:1900|max:2100',
        ]);
 
        $model = VehicleModel::create([
            'make_id'   => $request->make_id,
            'name'      => $request->name,
            'slug'      => Str::slug($request->name . '-' . $request->make_id),
            'year_from' => $request->year_from,
            'year_to'   => $request->year_to,
            'is_active' => true,
        ]);
 
        return response()->json(['message' => 'Model dodan.', 'model' => $model], 201);
    }
 
    public function updateModel(Request $request, int $id)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'name'      => 'required|string|max:100',
            'year_from' => 'nullable|integer|min:1900|max:2100',
            'year_to'   => 'nullable|integer|min:1900|max:2100',
            'is_active' => 'boolean',
        ]);
 
        $model = VehicleModel::findOrFail($id);
        $model->update([
            'name'      => $request->name,
            'year_from' => $request->year_from,
            'year_to'   => $request->year_to,
            'is_active' => $request->boolean('is_active', true),
        ]);
 
        return response()->json(['message' => 'Model ažuriran.', 'model' => $model]);
    }
 
    public function deleteModel(Request $request, int $id)
    {
        $this->requireAdmin($request);
        VehicleModel::findOrFail($id)->delete();
        return response()->json(['message' => 'Model obrisan.']);
    }
 
    // ═══════════════════════════════════════
    // GRADOVI
    // ═══════════════════════════════════════
 
    public function cities(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(City::orderBy('name')->get());
    }
 
    public function storeCity(Request $request)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'name'      => 'required|string|max:100|unique:cities,name',
            'region'    => 'nullable|string|max:100',
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);
 
        $city = City::create([
            'name'      => $request->name,
            'region'    => $request->region,
            'country'   => 'ME',
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,
            'is_active' => true,
        ]);
 
        return response()->json(['message' => 'Grad dodan.', 'city' => $city], 201);
    }
 
    public function updateCity(Request $request, int $id)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'name'      => 'required|string|max:100|unique:cities,name,' . $id,
            'region'    => 'nullable|string|max:100',
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);
 
        $city = City::findOrFail($id);
        $city->update($request->only(['name', 'region', 'latitude', 'longitude', 'is_active']));
 
        return response()->json(['message' => 'Grad ažuriran.', 'city' => $city]);
    }
 
    public function deleteCity(Request $request, int $id)
    {
        $this->requireAdmin($request);
        City::findOrFail($id)->delete();
        return response()->json(['message' => 'Grad obrisan.']);
    }
 
    // ═══════════════════════════════════════
    // PAKETI
    // ═══════════════════════════════════════
 
    public function packages(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(Package::orderBy('price')->get());
    }
 
    public function storePackage(Request $request)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'name'          => 'required|string|max:100',
            'price'         => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'max_images'    => 'required|integer|min:1',
            'featured'      => 'boolean',
            'description'   => 'nullable|string|max:500',
        ]);
 
        $package = Package::create([
            'name'          => $request->name,
            'price'         => $request->price,
            'duration_days' => $request->duration_days,
            'max_images'    => $request->max_images,
            'featured'      => $request->boolean('featured', false),
            'description'   => $request->description,
            'is_active'     => true,
        ]);
 
        return response()->json(['message' => 'Paket dodan.', 'package' => $package], 201);
    }
 
    public function updatePackage(Request $request, int $id)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'name'          => 'required|string|max:100',
            'price'         => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'max_images'    => 'required|integer|min:1',
            'featured'      => 'boolean',
            'description'   => 'nullable|string|max:500',
            'is_active'     => 'boolean',
        ]);
 
        $package = Package::findOrFail($id);
        $package->update($request->only([
            'name', 'price', 'duration_days', 'max_images',
            'featured', 'description', 'is_active',
        ]));
 
        return response()->json(['message' => 'Paket ažuriran.', 'package' => $package]);
    }
 
    public function deletePackage(Request $request, int $id)
    {
        $this->requireAdmin($request);
        Package::findOrFail($id)->delete();
        return response()->json(['message' => 'Paket obrisan.']);
    }
}