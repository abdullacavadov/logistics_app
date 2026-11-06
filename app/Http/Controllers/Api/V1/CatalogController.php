<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Read-only reference data sourced from the canonical database schema. */
class CatalogController extends Controller
{
    public function countries(Request $request)
    {
        $locale = $request->query('locale', 'az');
        return response()->json([
            'data' => DB::table('countries as c')
                ->leftJoin('country_translations as tr', function ($join) use ($locale) {
                    $join->on('tr.country_id', '=', 'c.id')->where('tr.locale', '=', $locale);
                })
                ->where('c.is_active', 1)
                ->orderByRaw('COALESCE(tr.name, c.name)')
                ->get(['c.id', 'c.iso2', DB::raw('COALESCE(tr.name, c.name) as name'), 'c.default_currency']),
        ]);
    }

    public function locations(Request $request)
    {
        $data = $request->validate([
            'country_id' => 'required|integer|exists:countries,id',
            'search' => 'nullable|string|max:120',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $locale = $request->query('locale', 'az');
        $query = DB::table('locations as l')
            ->leftJoin('location_translations as tr', function ($join) use ($locale) {
                $join->on('tr.location_id', '=', 'l.id')->where('tr.locale', '=', $locale);
            })
            ->where('l.country_id', $data['country_id'])
            ->where('l.is_active', 1);

        if (!empty($data['search'])) {
            $search = str_replace(['%', '_'], ['\\%', '\\_'], $data['search']);
            $query->whereRaw('COALESCE(tr.name, l.name) LIKE ?', ['%' . $search . '%']);
        }

        return response()->json($query->orderByRaw('COALESCE(tr.name, l.name)')
            ->paginate($data['per_page'] ?? 50, ['l.id', 'l.country_id', DB::raw('COALESCE(tr.name, l.name) as name'), 'l.lat', 'l.lng']));
    }

    public function cargoTypes()
    {
        return response()->json([
            'data' => DB::table('cargo_types')
                ->where('is_active', 1)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function loadVehicleTypes(Request $request)
    {
        $locale = $request->query('locale', 'az');
        return response()->json([
            'data' => DB::table('load_vehicle_types as t')
                ->leftJoin('load_vehicle_type_translations as tr', function ($join) use ($locale) {
                    $join->on('tr.load_vehicle_type_id', '=', 't.id')->where('tr.locale', '=', $locale);
                })
                ->where('t.is_active', 1)
                ->orderBy('t.sort_order')
                ->get(['t.id', DB::raw('COALESCE(tr.name, t.name) as name'), 't.category', 't.capacity_m3', 't.image_path']),
        ]);
    }

    public function vehicleTypes()
    {
        return response()->json([
            'data' => DB::table('vehicle_types')
                ->where('is_active', 1)
                ->orderBy('name')
                ->get(['id', 'name', 'is_refrigerated']),
        ]);
    }
}
