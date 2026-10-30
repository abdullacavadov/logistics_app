<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Nəqliyyat vasitələri — TS §6.1. Yalnız carrier rolu; yalnız öz vasitələri. */
class VehicleController extends Controller
{
    public function index(Request $r)
    {
        return response()->json(['data' => DB::table('vehicles')->where('user_id', $r->user()->id)->where('is_active', 1)->orderByDesc('id')->get()]);
    }

    public function store(Request $r)
    {
        if ($e = $this->carrierOnly($r)) return $e;
        $d = $r->validate($this->rules());
        $id = DB::table('vehicles')->insertGetId($d + ['user_id' => $r->user()->id, 'is_active' => 1, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['data' => DB::table('vehicles')->find($id)], 201);
    }

    public function update(Request $r, int $id)
    {
        if (!DB::table('vehicles')->where(['id' => $id, 'user_id' => $r->user()->id])->exists()) return $this->err('not_found', 'Tapılmadı', 404);
        DB::table('vehicles')->where('id', $id)->update($r->validate($this->rules(true)) + ['updated_at' => now()]);
        return response()->json(['data' => DB::table('vehicles')->find($id)]);
    }

    public function destroy(Request $r, int $id)
    {
        if (!DB::table('vehicles')->where(['id' => $id, 'user_id' => $r->user()->id])->exists()) return $this->err('not_found', 'Tapılmadı', 404);
        if (DB::table('vehicle_offers')->where('vehicle_id', $id)->whereIn('status', ['active', 'applied', 'agreed', 'busy'])->exists())
            return $this->err('in_use', 'Aktiv təklifi olan vasitə silinə bilməz', 409);
        DB::table('vehicles')->where('id', $id)->update(['is_active' => 0, 'updated_at' => now()]); // yumşaq silmə
        return response()->json(['data' => ['ok' => true]]);
    }

    private function rules(bool $p = false): array
    {
        $s = $p ? 'sometimes|' : '';
        return [
            'name' => $s . 'required|string|max:120', 'vehicle_type_id' => $s . 'required|exists:vehicle_types,id',
            'brand' => 'nullable|string|max:60', 'model' => 'nullable|string|max:60',
            'capacity_kg' => $s . 'required|integer|min:1|max:1000000', 'capacity_m3' => 'nullable|numeric|gt:0',
            'body_type' => 'nullable|string|max:60', 'is_refrigerated' => 'boolean',
            'reg_country_id' => 'nullable|exists:countries,id', 'company_id' => 'nullable|exists:companies,id',
        ]; // qeydiyyat nömrəsi bilərəkdən toplanmır (TS §6.1 — yalnız zəruri olduqda)
    }

    private function carrierOnly(Request $r)
    {
        return DB::table('user_roles')->where(['user_id' => $r->user()->id, 'role' => 'carrier'])->exists() ? null : $this->err('not_carrier', 'Daşıyıcı hüququ lazımdır', 403);
    }
    private function err(string $c, string $m, int $h) { return response()->json(['error' => ['code' => $c, 'message' => $m]], $h); }
}
