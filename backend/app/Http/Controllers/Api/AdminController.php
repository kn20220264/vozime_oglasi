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
use App\Models\Payment;
use App\Models\UserPackage;
use App\Models\UserPrivilege;
use App\Models\Equipment;
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

    private function requireAdmin(Request $request): void
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
            'total_ads'         => Ad::count(),
            'active_ads'        => Ad::where('status', 'active')->count(),
            'pending_ads'       => Ad::where('status', 'pending')->count(),
            'rejected_ads'      => Ad::where('status', 'rejected')->count(),
            'total_users'       => User::count(),
            'total_dealers'     => User::where('role', 'dealer')->count(),
            'total_moderators'  => User::where('role', 'moderator')->count(),
            'pending_reports'   => Report::where('status', 'pending')->count(),
            'pending_payments'  => Payment::where('status', 'pending')->count(),
            'ads_by_fuel'       => Ad::where('status', 'active')
                ->selectRaw('fuel_type, count(*) as count')
                ->groupBy('fuel_type')->get(),
            'ads_by_city'       => Ad::where('status', 'active')
                ->selectRaw('city_id, count(*) as count')
                ->with('city:id,name')
                ->groupBy('city_id')
                ->orderByDesc('count')
                ->limit(10)->get(),
            'ads_per_month'     => Ad::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, count(*) as count')
                ->groupBy('month')
                ->orderBy('month')
                ->limit(12)->get(),
            'revenue_per_month' => Payment::where('status', 'completed')
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as total')
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
            ->when($request->status,   fn($q) => $q->where('status', $request->status))
            ->when($request->search,   fn($q) => $q->where(function ($q2) use ($request) {
                $q2->where('title', 'like', '%' . $request->search . '%')
                   ->orWhere('ad_code', 'like', '%' . $request->search . '%');
            }))
            ->when($request->user_id,  fn($q) => $q->where('user_id', $request->user_id))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->featured, fn($q) => $q->where('featured', true))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($ads);
    }

    public function updateAdStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,rejected,pending,sold,expired',
        ]);

        $ad = Ad::findOrFail($id);
        $ad->update(['status' => $request->status]);

        return response()->json(['message' => 'Status oglasa ažuriran.', 'ad' => $ad]);
    }

    // Admin override — izmjena bilo kojeg polja oglasa
    public function updateAd(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $ad = Ad::findOrFail($id);

        $data = $request->only([
            'title', 'description', 'price', 'currency',
            'price_negotiable', 'year', 'mileage',
            'fuel_type', 'transmission', 'body_type',
            'power_kw', 'engine_cc', 'color_exterior', 'color_interior',
            'drive_type', 'doors', 'seats', 'condition', 'damage',
            'emission_class', 'owners_count', 'registered_until',
            'vin', 'has_service_book', 'has_warranty',
            'accepts_exchange', 'import', 'status',
            'featured', 'featured_until', 'pinned', 'pinned_until', 'expires_at',
        ]);

        // Admin može postaviti featured bez plaćanja
        if (isset($data['featured']) && $data['featured'] && empty($data['featured_until'])) {
            $data['featured_until'] = now()->addDays(30);
        }

        $ad->update($data);

        return response()->json(['message' => 'Oglas ažuriran.', 'ad' => $ad->fresh()]);
    }

    // Admin toggle featured (brzi shortcut)
    public function toggleAdFeatured(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $ad = Ad::findOrFail($id);
        $featured = !$ad->featured;

        $ad->update([
            'featured'       => $featured,
            'featured_until' => $featured ? now()->addDays($request->days ?? 30) : null,
        ]);

        return response()->json([
            'message'  => $featured ? 'Oglas istaknut.' : 'Istaknuto uklonjeno.',
            'featured' => $featured,
        ]);
    }

    // Admin toggle pinned (prikvači na vrh)
    public function toggleAdPinned(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $ad = Ad::findOrFail($id);
        $pinned = !$ad->pinned;

        $ad->update([
            'pinned'       => $pinned,
            'pinned_until' => $pinned ? now()->addDays($request->days ?? 7) : null,
        ]);

        return response()->json([
            'message' => $pinned ? 'Oglas prikvačen na vrh.' : 'Oglas uklonjen sa vrha.',
            'pinned'  => $pinned,
        ]);
    }

    public function deleteAd(Request $request, int $id)
    {
        $this->requireAdmin($request);
        Ad::findOrFail($id)->delete();
        return response()->json(['message' => 'Oglas obrisan.']);
    }

    // ═══════════════════════════════════════
    // KORISNICI
    // ═══════════════════════════════════════

    public function users(Request $request)
    {
        $this->requireAdmin($request);

        $users = User::with(['profile', 'privileges'])
            ->withCount('ads')
            ->when($request->role,   fn($q) => $q->where('role', $request->role))
            ->when($request->search, fn($q) => $q->where(function ($q2) use ($request) {
                $q2->where('name', 'like', '%' . $request->search . '%')
                   ->orWhere('email', 'like', '%' . $request->search . '%');
            }))
            ->when($request->is_active !== null, fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($users);
    }

    public function showUser(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $user = User::with(['profile', 'privileges.grantedBy'])
            ->withCount(['ads', 'ads as active_ads_count' => fn($q) => $q->where('status', 'active')])
            ->findOrFail($id);

        return response()->json($user);
    }

    public function toggleUserActive(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => $user->is_active ? 'Korisnik aktiviran.' : 'Korisnik blokiran.',
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

        return response()->json(['message' => 'Uloga ažurirana.', 'user' => $user]);
    }

    // ═══════════════════════════════════════
    // PRIVILEGIJE KORISNIKA
    // ═══════════════════════════════════════

    public function getUserPrivileges(Request $request, int $userId)
    {
        $this->requireAdmin($request);

        $privileges = UserPrivilege::with('grantedBy:id,name,email')
            ->where('user_id', $userId)
            ->get();

        return response()->json($privileges);
    }

    public function grantPrivilege(Request $request, int $userId)
    {
        $this->requireAdmin($request);

        $request->validate([
            'privilege_key'   => 'required|string|in:' . implode(',', array_keys(UserPrivilege::availableKeys())),
            'privilege_value' => 'nullable|string|max:255',
            'expires_at'      => 'nullable|date|after:now',
            'note'            => 'nullable|string|max:500',
        ]);

        User::findOrFail($userId);

        $privilege = UserPrivilege::updateOrCreate(
            ['user_id' => $userId, 'privilege_key' => $request->privilege_key],
            [
                'granted_by'      => $request->user()->id,
                'privilege_value' => $request->privilege_value,
                'expires_at'      => $request->expires_at,
                'note'            => $request->note,
            ]
        );

        return response()->json([
            'message'   => 'Privilegija dodijeljena.',
            'privilege' => $privilege->load('grantedBy:id,name'),
        ]);
    }

    public function revokePrivilege(Request $request, int $userId, int $privilegeId)
    {
        $this->requireAdmin($request);

        UserPrivilege::where('user_id', $userId)->where('id', $privilegeId)->firstOrFail()->delete();

        return response()->json(['message' => 'Privilegija uklonjena.']);
    }

    // Lista svih dostupnih privilegija (za frontend dropdown)
    public function availablePrivileges()
    {
        return response()->json(
            collect(UserPrivilege::availableKeys())->map(fn($label, $key) => [
                'key'   => $key,
                'label' => $label,
            ])->values()
        );
    }

    // ═══════════════════════════════════════
    // PRIJAVE
    // ═══════════════════════════════════════

    public function reports(Request $request)
    {
        $reports = Report::with(['user:id,name,email', 'ad:id,title,slug'])
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
    // PLAĆANJA
    // ═══════════════════════════════════════

    public function payments(Request $request)
    {
        $this->requireAdmin($request);

        $payments = Payment::with(['userPackage.user:id,name,email', 'userPackage.package:id,name'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->method, fn($q) => $q->where('payment_method', $request->method))
            ->when($request->search, fn($q) => $q->where('reference', 'like', '%' . $request->search . '%'))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($payments);
    }

    public function confirmPayment(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $payment = Payment::with('userPackage.package')->findOrFail($id);

        if ($payment->status === 'completed') {
            return response()->json(['message' => 'Uplata je već potvrđena.'], 422);
        }

        $payment->update([
            'status'       => 'completed',
            'admin_note'   => $request->note,
            'confirmed_by' => $request->user()->id,
            'confirmed_at' => now(),
        ]);

        $userPackage = $payment->userPackage;
        $package     = $userPackage->package;

        $userPackage->update([
            'paid_at'    => now(),
            'expires_at' => now()->addDays($package->duration_days),
        ]);

        if ($package->type === 'ad_boost' && $userPackage->ad_id) {
            Ad::where('id', $userPackage->ad_id)->update([
                'featured'       => true,
                'featured_until' => now()->addDays($package->duration_days),
                'status'         => 'active',
            ]);
        }

        return response()->json(['message' => 'Uplata potvrđena, paket aktiviran.']);
    }

    public function rejectPayment(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $payment = Payment::findOrFail($id);
        $payment->update([
            'status'       => 'failed',
            'admin_note'   => $request->note,
            'confirmed_by' => $request->user()->id,
            'confirmed_at' => now(),
        ]);

        return response()->json(['message' => 'Plaćanje odbijeno.']);
    }

    // ═══════════════════════════════════════
    // PAKETI — admin dodjela korisniku
    // ═══════════════════════════════════════

    public function grantPackage(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'user_id'    => 'required|exists:users,id',
            'package_id' => 'required|exists:packages,id',
            'ad_id'      => 'nullable|exists:ads,id',
            'note'       => 'nullable|string|max:500',
        ]);

        $package = Package::findOrFail($request->package_id);

        $userPackage = UserPackage::create([
            'user_id'    => $request->user_id,
            'package_id' => $request->package_id,
            'ad_id'      => $request->ad_id,
            'paid_at'    => now(),
            'expires_at' => now()->addDays($package->duration_days),
        ]);

        // Kreiraj payment zapis kao "admin_grant"
        Payment::create([
            'user_package_id' => $userPackage->id,
            'amount'          => 0,
            'payment_method'  => 'admin_grant',
            'status'          => 'completed',
            'admin_note'      => $request->note ?? 'Admin dodjela bez plaćanja.',
            'confirmed_by'    => $request->user()->id,
            'confirmed_at'    => now(),
        ]);

        // Ako je ad_boost paket i ima ad_id
        if ($package->type === 'ad_boost' && $request->ad_id) {
            Ad::where('id', $request->ad_id)->update([
                'featured'       => true,
                'featured_until' => now()->addDays($package->duration_days),
                'status'         => 'active',
            ]);
        }

        return response()->json([
            'message'     => 'Paket dodijeljen korisniku.',
            'userPackage' => $userPackage->load(['user:id,name', 'package:id,name']),
        ], 201);
    }

    // Lista aktivnih pretplata
    public function userPackages(Request $request)
    {
        $this->requireAdmin($request);

        $packages = UserPackage::with(['user:id,name,email', 'package:id,name,type'])
            ->when($request->user_id, fn($q) => $q->where('user_id', $request->user_id))
            ->when($request->active,  fn($q) => $q->where('expires_at', '>', now()))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($packages);
    }

    // ═══════════════════════════════════════
    // MARKE
    // ═══════════════════════════════════════

    public function makes(Request $request)
    {
        $this->requireAdmin($request);
        $makes = Make::withCount('models')
            ->with('category:id,name,slug')
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->orderBy('name')
            ->get();
        return response()->json($makes);
    }

    public function storeMake(Request $request)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'name'        => 'required|string|max:100',
            'category_id' => 'required|exists:vehicle_categories,id',
            'country'     => 'nullable|string|max:100',
            'is_active'   => 'boolean',
        ]);
 
        $slug = Str::slug($request->name) . '-' . $request->category_id;
 
        $make = Make::create([
            'category_id' => $request->category_id,
            'name'        => $request->name,
            'slug'        => $slug,
            'country'     => $request->country,
            'is_active'   => $request->boolean('is_active', true),
        ]);
 
        return response()->json(['message' => 'Marka dodana.', 'make' => $make->load('category:id,name')], 201);
    }

    public function updateMake(Request $request, int $id)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'name'        => 'required|string|max:100',
            'category_id' => 'required|exists:vehicle_categories,id',
            'country'     => 'nullable|string|max:100',
            'is_active'   => 'boolean',
        ]);
 
        $make = Make::findOrFail($id);
        $slug = Str::slug($request->name) . '-' . $request->category_id;
 
        $make->update([
            'category_id' => $request->category_id,
            'name'        => $request->name,
            'slug'        => $slug,
            'country'     => $request->country,
            'is_active'   => $request->boolean('is_active', $make->is_active),
        ]);
 
        return response()->json(['message' => 'Marka ažurirana.', 'make' => $make->fresh('category:id,name')]);
    }

    public function deleteMake(Request $request, int $id)
    {
        $this->requireAdmin($request);
        $make = Make::withCount('models')->findOrFail($id);
 
        if ($make->models_count > 0) {
            return response()->json([
                'message' => 'Ne možete obrisati marku koja ima modele. Prvo obrišite sve modele.'
            ], 422);
        }
 
        $make->delete();
        return response()->json(['message' => 'Marka obrisana.']);
    }

    // ═══════════════════════════════════════
    // MODELI
    // ═══════════════════════════════════════

     public function models(Request $request)
    {
        $this->requireAdmin($request);
 
        $models = VehicleModel::with('make:id,name,category_id')
            ->when($request->make_id, fn($q) => $q->where('make_id', $request->make_id))
            ->when($request->search, fn($q) => $q->where('name', 'like', '%' . $request->search . '%'))
            ->orderByRaw('parent_id IS NULL DESC')
            ->orderBy('name')
            ->paginate(200);
 
        return response()->json($models);
    }

    public function storeModel(Request $request)
    {
        $this->requireAdmin($request);
 
        $request->validate([
            'make_id'   => 'required|exists:makes,id',
            'parent_id' => 'nullable|exists:vehicle_models,id',
            'name'      => 'required|string|max:100',
            'year_from' => 'nullable|integer|min:1900|max:2100',
            'year_to'   => 'nullable|integer|min:1900|max:2100',
            'is_active' => 'boolean',
        ]);
 
        $model = VehicleModel::create([
            'make_id'   => $request->make_id,
            'parent_id' => $request->parent_id,
            'name'      => $request->name,
            'slug'      => Str::slug($request->name . '-' . $request->make_id . '-' . time()),
            'year_from' => $request->year_from,
            'year_to'   => $request->year_to,
            'is_active' => $request->boolean('is_active', true),
        ]);
 
        return response()->json(['message' => 'Model dodan.', 'model' => $model->load('make:id,name')], 201);
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
            'is_active' => $request->boolean('is_active', $model->is_active),
        ]);
 
        return response()->json(['message' => 'Model ažuriran.', 'model' => $model->fresh()]);
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
    // OPREMA
    // ═══════════════════════════════════════

    public function equipment(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(
            Equipment::when($request->category, fn($q) => $q->where('category', $request->category))
                ->orderBy('category')
                ->orderBy('name')
                ->get()
        );
    }

    public function storeEquipment(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'name'     => 'required|string|max:150',
            'category' => 'nullable|string|max:50',
        ]);

        $equipment = Equipment::create([
            'name'      => $request->name,
            'category'  => $request->category,
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Oprema dodana.', 'equipment' => $equipment], 201);
    }

    public function updateEquipment(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $request->validate([
            'name'      => 'required|string|max:150',
            'category'  => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $equipment = Equipment::findOrFail($id);
        $equipment->update($request->only(['name', 'category', 'is_active']));

        return response()->json(['message' => 'Oprema ažurirana.', 'equipment' => $equipment]);
    }

    public function deleteEquipment(Request $request, int $id)
    {
        $this->requireAdmin($request);
        Equipment::findOrFail($id)->delete();
        return response()->json(['message' => 'Oprema obrisana.']);
    }

    // ═══════════════════════════════════════
    // PAKETI
    // ═══════════════════════════════════════

    public function packages(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(Package::withCount('userPackages')->orderBy('price')->get());
    }

    public function storePackage(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'name'           => 'required|string|max:100',
            'type'           => 'required|in:listing,ad_boost,dealer',
            'price'          => 'required|numeric|min:0',
            'duration_days'  => 'required|integer|min:1',
            'max_images'     => 'required|integer|min:1',
            'max_active_ads' => 'nullable|integer|min:0',
            'refresh_days'   => 'nullable|integer|min:1',
            'featured'       => 'boolean',
            'premium_seller' => 'boolean',
            'description'    => 'nullable|string|max:500',
            'is_active'      => 'boolean',
        ]);

        $package = Package::create([
            'name'           => $request->name,
            'type'           => $request->type,
            'price'          => $request->price,
            'duration_days'  => $request->duration_days,
            'max_images'     => $request->max_images,
            'max_active_ads' => $request->max_active_ads,
            'refresh_days'   => $request->refresh_days,
            'featured'       => $request->boolean('featured', false),
            'premium_seller' => $request->boolean('premium_seller', false),
            'description'    => $request->description,
            'is_active'      => $request->boolean('is_active', true),
        ]);

        return response()->json(['message' => 'Paket dodan.', 'package' => $package], 201);
    }

    public function updatePackage(Request $request, int $id)
    {
        $this->requireAdmin($request);

        $request->validate([
            'name'           => 'required|string|max:100',
            'type'           => 'required|in:listing,ad_boost,dealer',
            'price'          => 'required|numeric|min:0',
            'duration_days'  => 'required|integer|min:1',
            'max_images'     => 'required|integer|min:1',
            'max_active_ads' => 'nullable|integer|min:0',
            'refresh_days'   => 'nullable|integer|min:1',
            'featured'       => 'boolean',
            'premium_seller' => 'boolean',
            'description'    => 'nullable|string|max:500',
            'is_active'      => 'boolean',
        ]);

        $package = Package::findOrFail($id);
        $package->update($request->only([
            'name', 'type', 'price', 'duration_days', 'max_images',
            'max_active_ads', 'refresh_days', 'featured',
            'premium_seller', 'description', 'is_active',
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