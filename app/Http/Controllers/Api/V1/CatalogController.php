<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Read-only reference data sourced from the canonical database schema. */
class CatalogController extends Controller
{
    public function countries()
    {
        return response()->json([
            'data' => DB::table('countries')
                ->where('is_active', 1)
                ->orderBy('name')
                ->get(['id', 'iso2', 'name', 'default_currency']),
        ]);
    }

    public function locations(Request $request)
    {
        $data = $request->validate([
            'country_id' => 'required|integer|exists:countries,id',
            'search' => 'nullable|string|max:120',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = DB::table('locations')
            ->where('country_id', $data['country_id'])
            ->where('is_active', 1);

        if (!empty($data['search'])) {
            $search = str_replace(['%', '_'], ['\\%', '\\_'], $data['search']);
            $query->where('name', 'like', '%' . $search . '%');
        }

        return response()->json($query->orderBy('name')
            ->paginate($data['per_page'] ?? 50, ['id', 'country_id', 'name', 'lat', 'lng']));
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

    public function loadVehicleTypes()
    {
        return response()->json([
            'data' => DB::table('load_vehicle_types')
                ->where('is_active', 1)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'category', 'capacity_m3', 'image_path']),
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
