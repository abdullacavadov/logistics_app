<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\MatchRunner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Daşıma təklifləri — TS §6.2–6.3. */
class VehicleOfferController extends Controller
{
    public function __construct(private MatchRunner $matcher) {}

    /** İctimai axtarış: yalnız aktiv və vaxtı bitməmiş təkliflər. */
    public function index(Request $r)
    {
        $q = DB::table('vehicle_offers as o')->join('vehicles as v', 'v.id', '=', 'o.vehicle_id')
            ->leftJoin('countries as fc', 'fc.id', '=', 'o.from_country_id')
            ->leftJoin('locations as fl', 'fl.id', '=', 'o.from_location_id')
            ->leftJoin('countries as tc', 'tc.id', '=', 'o.to_country_id')
            ->leftJoin('locations as tl', 'tl.id', '=', 'o.to_location_id')
            ->leftJoin('load_vehicle_types as lvt', 'lvt.id', '=', 'o.load_vehicle_type_id')
            ->where('o.status', 'active')->where('o.available_to', '>=', now()->toDateString());
        foreach (['from_country_id', 'to_country_id', 'from_location_id', 'to_location_id', 'load_vehicle_type_id'] as $f) if ($r->filled($f)) $q->where("o.$f", $r->input($f));
        if ($r->filled('vehicle_type_id')) $q->where('v.vehicle_type_id', $r->vehicle_type_id);
        if ($r->filled('date')) $q->where('o.available_from', '<=', $r->date)->where('o.available_to', '>=', $r->date);
        if ($r->filled('min_weight')) $q->where('o.capacity_kg', '>=', (float) $r->min_weight * 1000);
        if ($r->filled('max_weight')) $q->where('o.capacity_kg', '<=', (float) $r->max_weight * 1000);
        if ($r->filled('min_volume')) $q->where('o.capacity_m3', '>=', $r->min_volume);
        if ($r->filled('max_volume')) $q->where('o.capacity_m3', '<=', $r->max_volume);
        if ($r->filled('min_price')) $q->where('o.price', '>=', $r->min_price);
        if ($r->filled('max_price')) $q->where('o.price', '<=', $r->max_price);
        if ($r->filled('currency')) $q->where('o.currency', $r->currency);
        if ($r->filled('search')) $q->where(function ($s) use ($r) { $s->where('v.name', 'like', '%' . $r->search . '%')->orWhere('fl.name', 'like', '%' . $r->search . '%')->orWhere('fc.name', 'like', '%' . $r->search . '%')->orWhere('tl.name', 'like', '%' . $r->search . '%')->orWhere('tc.name', 'like', '%' . $r->search . '%'); });
        return response()->json($q->orderByDesc('o.id')->join('users as u', 'u.id', '=', 'o.user_id')
            ->select('o.id', 'o.user_id', 'u.name as driver_name', 'v.name as vehicle_name', 'o.vehicle_id', 'o.from_country_id', 'o.from_location_id', 'o.to_country_id', 'o.to_location_id',
            'fc.name as from_country_name', 'fc.iso2 as from_country_iso2', 'fl.name as from_location_name', 'tc.name as to_country_name', 'tc.iso2 as to_country_iso2', 'tl.name as to_location_name',
            'o.available_from', 'o.available_to', 'o.is_ready_for_loading', 'o.price', 'o.currency', 'o.price_negotiable',
            'o.capacity_kg', 'o.capacity_m3', 'o.quantity', 'o.load_vehicle_type_id', 'lvt.name as load_vehicle_type_name',
            'v.vehicle_type_id', 'v.is_refrigerated')->paginate($r->integer('per_page', 15)));
    }

    public function mine(Request $r)
    {
        return response()->json(DB::table('vehicle_offers as o')->leftJoin('load_vehicle_types as lvt', 'lvt.id', '=', 'o.load_vehicle_type_id')->where('o.user_id', $r->user()->id)->orderByDesc('o.id')->select('o.*', 'lvt.name as load_vehicle_type_name')->paginate(50));
    }

    public function store(Request $r)
    {
        if (!DB::table('user_roles')->where(['user_id' => $r->user()->id, 'role' => 'carrier'])->exists()) return $this->err('not_carrier', 'Daşıyıcı hüququ lazımdır', 403);
        $d = $r->validate([
            'vehicle_id' => 'required|integer', 'from_country_id' => 'required|exists:countries,id', 'from_location_id' => 'nullable|exists:locations,id',
            'to_country_id' => 'required|exists:countries,id', 'to_location_id' => 'nullable|exists:locations,id',
            'available_from' => 'required|date|after_or_equal:today', 'available_to' => 'required|date|after_or_equal:available_from',
            'is_ready_for_loading' => 'sometimes|boolean',
            'capacity_kg' => 'required|numeric|min:1|max:1000000',
            'capacity_m3' => 'nullable|numeric|min:0.01|max:100000',
            'quantity' => 'required|integer|min:1|max:1000',
            'load_vehicle_type_id' => 'required|exists:load_vehicle_types,id',
            'price' => 'nullable|numeric|min:0', 'currency' => 'required_with:price|nullable|string|size:3', 'price_negotiable' => 'sometimes|boolean', 'terms' => 'nullable|string|max:3000', 'activate' => 'boolean',
        ]);
        if (!$this->validLocationSelection($d)) return $this->err('location_country_mismatch', 'Şəhər seçilmiş ölkəyə aid deyil', 422);
        if (!DB::table('vehicles')->where(['id' => $d['vehicle_id'], 'user_id' => $r->user()->id, 'is_active' => 1])->exists()) return $this->err('forbidden_vehicle', 'Nəqliyyat vasitəsi sizə məxsus deyil', 403);
        $status = !empty($d['activate']) ? 'active' : 'draft'; unset($d['activate']);
        if ($status === 'active' && $this->vehicleHasActiveAssignment((int) $d['vehicle_id'])) return $this->err('vehicle_in_assignment', 'Aktiv sifarişdə olan nəqliyyat vasitəsi üçün yeni təklif aktivləşdirilə bilməz', 409);
        if ($status === 'active' && $this->conflicts($d['vehicle_id'], $d['available_from'], $d['available_to'], null))
            return $this->err('vehicle_conflict', 'Bu nəqliyyat vasitəsi həmin tarixlərdə başqa təklifə ayrılıb', 409);
        $id = DB::table('vehicle_offers')->insertGetId($d + ['user_id' => $r->user()->id, 'status' => $status, 'created_at' => now(), 'updated_at' => now()]);
        if ($status === 'active') $this->matcher->forOffer($id);
        return response()->json(['data' => DB::table('vehicle_offers')->find($id)], 201);
    }

    public function update(Request $r, int $id)
    {
        if ($e = $this->carrierOnly($r)) return $e;
        $o = $this->owned($r, $id);
        if ($o instanceof \Illuminate\Http\JsonResponse) return $o;
        if (!in_array($o->status, ['draft', 'active'])) {
            return $this->err('locked', 'Bu statusda təklif dəyişdirilə bilməz', 409);
        }

        $data = $r->validate([
            'vehicle_id' => 'sometimes|required|integer|exists:vehicles,id',
            'from_country_id' => 'sometimes|required|exists:countries,id',
            'from_location_id' => 'nullable|exists:locations,id',
            'to_country_id' => 'sometimes|required|exists:countries,id',
            'to_location_id' => 'nullable|exists:locations,id',
            'available_from' => 'sometimes|required|date',
            'available_to' => 'sometimes|required|date',
            'is_ready_for_loading' => 'sometimes|boolean',
            'capacity_kg' => 'sometimes|required|numeric|min:1|max:1000000',
            'capacity_m3' => 'nullable|numeric|min:0.01|max:100000',
            'quantity' => 'sometimes|required|integer|min:1|max:1000',
            'load_vehicle_type_id' => 'sometimes|required|exists:load_vehicle_types,id',
            'price' => 'nullable|numeric|min:0',
            'currency' => 'required_with:price|nullable|string|size:3',
            'price_negotiable' => 'sometimes|boolean',
            'terms' => 'nullable|string|max:3000',
        ]);

        if (!$this->validLocationSelection($data, $o)) return $this->err('location_country_mismatch', 'Şəhər seçilmiş ölkəyə aid deyil', 422);
        $vehicleId = (int) ($data['vehicle_id'] ?? $o->vehicle_id);
        if (!DB::table('vehicles')->where([
            'id' => $vehicleId,
            'user_id' => $r->user()->id,
            'is_active' => 1,
        ])->exists()) {
            return $this->err('forbidden_vehicle', 'Nəqliyyat vasitəsi sizə məxsus deyil və ya aktiv deyil', 403);
        }

        $from = $data['available_from'] ?? $o->available_from;
        $to = $data['available_to'] ?? $o->available_to;
        if ($to < $from) return $this->err('invalid_dates', 'Son tarix başlanğıc tarixindən əvvəl ola bilməz', 422);
        if ($o->status === 'active' && $this->vehicleHasActiveAssignment($vehicleId)) return $this->err('vehicle_in_assignment', 'Aktiv sifarişdə olan vasitə dəyişdirilə bilməz', 409);
        if ($o->status === 'active' && $this->conflicts($vehicleId, $from, $to, $id)) {
            return $this->err('vehicle_conflict', 'Bu nəqliyyat vasitəsi həmin tarixlərdə başqa təklifə ayrılıb', 409);
        }

        DB::table('vehicle_offers')->where('id', $id)->update($data + [
            'vehicle_id' => $vehicleId,
            'updated_at' => now(),
        ]);
        $this->matcher->forOffer($id);

        return response()->json(['data' => DB::table('vehicle_offers')->find($id)]);
    }

    public function activate(Request $r, int $id)
    {
        if ($e = $this->carrierOnly($r)) return $e;
        $o = $this->owned($r, $id); if ($o instanceof \Illuminate\Http\JsonResponse) return $o;
        if ($o->status !== 'draft') return $this->err('bad_status', 'Yalnız qaralama aktivləşdirilə bilər', 409);
        if (!DB::table('vehicles')->where([
            'id' => $o->vehicle_id,
            'user_id' => $r->user()->id,
            'is_active' => 1,
        ])->exists()) return $this->err('inactive_vehicle', 'Aktiv nəqliyyat vasitəsi seçilməlidir', 422);
        if ($o->available_to < date('Y-m-d')) return $this->err('expired', 'Təklifin müddəti bitib', 422);
        if ($this->vehicleHasActiveAssignment((int) $o->vehicle_id)) return $this->err('vehicle_in_assignment', 'Aktiv sifarişdə olan vasitə üçün təklif aktivləşdirilə bilməz', 409);
        if ($this->conflicts($o->vehicle_id, $o->available_from, $o->available_to, $id)) return $this->err('vehicle_conflict', 'Bu nəqliyyat vasitəsi həmin tarixlərdə başqa təklifə ayrılıb', 409);
        DB::table('vehicle_offers')->where('id', $id)->update(['status' => 'active', 'updated_at' => now()]);
        $n = $this->matcher->forOffer($id);
        return response()->json(['data' => ['id' => $id, 'status' => 'active', 'matches' => $n]]);
    }

    public function cancel(Request $r, int $id)
    {
        if ($e = $this->carrierOnly($r)) return $e;
        $o = $this->owned($r, $id); if ($o instanceof \Illuminate\Http\JsonResponse) return $o;
        if (!in_array($o->status, ['draft', 'active', 'applied'])) return $this->err('bad_status', 'Bu statusdan ləğv mümkün deyil', 409);
        if (DB::table('load_assignments')->where('vehicle_offer_id', $id)->whereIn('status', ['pending', 'accepted', 'assigned', 'loading', 'in_transit', 'delivered'])->exists()) {
            return $this->err('offer_in_assignment', 'Aktiv sifarişə bağlı təklif ləğv edilə bilməz', 409);
        }
        DB::table('vehicle_offers')->where('id', $id)->update(['status' => 'cancelled', 'updated_at' => now()]);
        $this->matcher->forOffer($id); // aktiv olmadığı üçün uyğunluqları təmizləyir
        return response()->json(['data' => ['id' => $id, 'status' => 'cancelled']]);
    }

    /** Daşıyıcı: təklifə uyğun yüklər (bal və səbəblərlə). */
    public function matches(Request $r, int $id)
    {
        if ($e = $this->carrierOnly($r)) return $e;
        $o = $this->owned($r, $id); if ($o instanceof \Illuminate\Http\JsonResponse) return $o;
        $rows = DB::table('matches as m')->join('loads as l', 'l.id', '=', 'm.load_id')->where('m.vehicle_offer_id', $id)->orderByDesc('m.score')
            ->select('m.score', 'm.reasons', 'l.id as load_id', 'l.title', 'l.from_country_id', 'l.to_country_id', 'l.pickup_from', 'l.weight_kg', 'l.price', 'l.currency')->get()
            ->map(fn ($x) => tap($x, fn ($y) => $y->reasons = json_decode($y->reasons)));
        return response()->json(['data' => $rows]);
    }

    private function validLocationSelection(array $data, ?object $existing = null): bool
    {
        foreach ([
            ['country' => 'from_country_id', 'location' => 'from_location_id'],
            ['country' => 'to_country_id', 'location' => 'to_location_id'],
        ] as $pair) {
            $locationId = array_key_exists($pair['location'], $data) ? $data[$pair['location']] : ($existing->{$pair['location']} ?? null);
            $countryId = array_key_exists($pair['country'], $data) ? $data[$pair['country']] : ($existing->{$pair['country']} ?? null);
            if ($locationId && (!$countryId || !DB::table('locations')->where([
                'id' => $locationId,
                'country_id' => $countryId,
            ])->exists())) {
                return false;
            }
        }

        return true;
    }

    private function carrierOnly(Request $r)
    {
        return DB::table('user_roles')->where([
            'user_id' => $r->user()->id,
            'role' => 'carrier',
        ])->exists()
            ? null
            : $this->err('not_carrier', 'Daşıyıcı hüququ lazımdır', 403);
    }

    private function vehicleHasActiveAssignment(int $vehicleId): bool
    {
        return DB::table('load_assignments')->where('vehicle_id', $vehicleId)
            ->whereIn('status', ['pending', 'accepted', 'assigned', 'loading', 'in_transit', 'delivered'])->exists();
    }

    private function conflicts(int $vehicleId, string $from, string $to, ?int $exceptId): bool
    {
        return DB::table('vehicle_offers')->where('vehicle_id', $vehicleId)->whereIn('status', ['active', 'applied', 'agreed', 'busy'])
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))->where('available_from', '<=', $to)->where('available_to', '>=', $from)->exists();
    }

    private function owned(Request $r, int $id)
    {
        return DB::table('vehicle_offers')->where(['id' => $id, 'user_id' => $r->user()->id])->first() ?: $this->err('not_found', 'Tapılmadı', 404);
    }
    private function err(string $c, string $m, int $h) { return response()->json(['error' => ['code' => $c, 'message' => $m]], $h); }
}
