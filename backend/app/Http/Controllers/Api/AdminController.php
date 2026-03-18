<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\User;
use App\Models\Report;
use App\Models\Make;
use App\Models\City;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!$request->user() || !$request->user()->isAdmin()) {
                return response()->json(['message' => 'Zabranjen pristup.'], 403);
            }
            return $next($request);
        });
    }

    // GET /api/admin/stats
    public function stats()
    {
        return response()->json([
            'total_ads'         => Ad::count(),
            'active_ads'        => Ad::where('status', 'active')->count(),
            'pending_ads'       => Ad::where('status', 'pending')->count(),
            'total_users'       => User::count(),
            'total_dealers'     => User::where('role', 'dealer')->count(),
            'pending_reports'   => Report::where('status', 'pending')->count(),
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
        ]);
    }

    // GET /api/admin/ads — svi oglasi sa filterom statusa
    public function ads(Request $request)
    {
        $ads = Ad::with(['user', 'make', 'vehicleModel', 'city', 'primaryImage'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($ads);
    }

    // PUT /api/admin/ads/{id}/status
    public function updateAdStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,rejected,pending',
        ]);

        $ad = Ad::findOrFail($id);
        $ad->update(['status' => $request->status]);

        return response()->json(['message' => 'Status oglasa ažuriran.', 'ad' => $ad]);
    }

    // GET /api/admin/users
    public function users(Request $request)
    {
        $users = User::with('profile')
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($users);
    }

    // PUT /api/admin/users/{id}/toggle-active
    public function toggleUserActive(int $id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => $user->is_active ? 'Korisnik aktiviran.' : 'Korisnik deaktiviran.',
            'is_active' => $user->is_active,
        ]);
    }

    // GET /api/admin/reports
    public function reports(Request $request)
    {
        $reports = Report::with(['user', 'ad'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($reports);
    }

    // PUT /api/admin/reports/{id}/resolve
    public function resolveReport(int $id)
    {
        $report = Report::findOrFail($id);
        $report->update(['status' => 'resolved']);

        return response()->json(['message' => 'Prijava riješena.']);
    }
}