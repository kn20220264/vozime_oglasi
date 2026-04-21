<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // GET /admin/settings — vrati sve settings
    public function index(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(Setting::all());
    }

    // PUT /admin/settings — batch update više ključeva odjednom
    // Body: { bank_naziv: "...", bank_racun: "...", ... }
    public function update(Request $request)
    {
        $this->requireAdmin($request);

        $allowed = ['bank_naziv', 'bank_racun', 'bank_banka', 'bank_info'];

        foreach ($allowed as $key) {
            if ($request->has($key)) {
                Setting::set($key, $request->input($key));
            }
        }

        return response()->json([
            'message'  => 'Podešavanja sačuvana.',
            'settings' => Setting::all(),
        ]);
    }

    private function requireAdmin(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            abort(403, 'Pristup odbijen.');
        }
    }
}
