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
            ->where('o.status', 'active')->where('o.available_to', '>=', date('Y-m-d'));
        foreach (['from_country_id', 'to_country_id', 'from_location_id', 'to_location_id'] as $f) if ($r->filled($f)) $q->where("o.$f", $r->input($f));
        if ($r->filled('vehicle_type_id')) $q->where('v.vehicle_type_id', $r->vehicle_type_id);
        if ($r->filled('date')) $q->where('o.available_from', '<=', $r->date)->where('o.available_to', '>=', $r->date);
        return response()->json($q->orderByDesc('o.id')->select('o.id', 'o.from_country_id', 'o.from_location_id', 'o.to_country_id', 'o.to_location_id',
            'o.available_from', 'o.available_to', 'o.price', 'o.currency', 'v.vehicle_type_id', 'v.capacity_kg', 'v.is_refrigerated')->paginate($r->integer('per_page', 15)));
    }

    public function mine(Request $r)
    {
        return response()->json(DB::table('vehicle_offers')->where('user_id', $r->user()->id)->orderByDesc('id')->paginate(15));
    }

    public function store(Request $r)
    {
        if (!DB::table('user_roles')->where(['user_id' => $r->user()->id, 'role' => 'carrier'])->exists()) return $this->err('not_carrier', 'Daşıyıcı hüququ lazımdır', 403);
        $d = $r->validate([
            'vehicle_id' => 'required|integer', 'from_country_id' => 'required|exists:countries,id', 'from_location_id' => 'nullable|exists:locations,id',
            'to_country_id' => 'required|exists:countries,id', 'to_location_id' => 'nullable|exists:locations,id',
            'available_from' => 'required|date|after_or_equal:today', 'available_to' => 'required|date|after_or_equal:available_from',
            'price' => 'nullable|numeric|min:0', 'currency' => 'required_with:price|nullable|string|size:3', 'terms' => 'nullable|string|max:3000', 'activate' => 'boolean',
        ]);
        if (!DB::table('vehicles')->where(['id' => $d['vehicle_id'], 'user_id' => $r->user()->id, 'is_active' => 1])->exists()) return $this->err('forbidden_vehicle', 'Vasitə sizə məxsus deyil', 403);
        $status = !empty($d['activate']) ? 'active' : 'draft'; unset($d['activate']);
        if ($status === 'active' && $this->conflicts($d['vehicle_id'], $d['available_from'], $d['available_to'], null))
            return $this->err('vehicle_conflict', 'Bu vasitə həmin tarixlərdə başqa təklifə ayrılıb', 409);
        $id = DB::table('vehicle_offers')->insertGetId($d + ['user_id' => $r->user()->id, 'status' => $status, 'created_at' => now(), 'updated_at' => now()]);
        if ($status === 'active') $this->matcher->forOffer($id);
        return response()->json(['data' => DB::table('vehicle_offers')->find($id)], 201);
    }

    public function activate(Request $r, int $id)
    {
        $o = $this->owned($r, $id); if ($o instanceof \Illuminate\Http\JsonResponse) return $o;
        if ($o->status !== 'draft') return $this->err('bad_status', 'Yalnız qaralama aktivləşdirilə bilər', 409);
        if ($o->available_to < date('Y-m-d')) return $this->err('expired', 'Təklifin müddəti bitib', 422);
        if ($this->conflicts($o->vehicle_id, $o->available_from, $o->available_to, $id)) return $this->err('vehicle_conflict', 'Bu vasitə həmin tarixlərdə başqa təklifə ayrılıb', 409);
        DB::table('vehicle_offers')->where('id', $id)->update(['status' => 'active', 'updated_at' => now()]);
        $n = $this->matcher->forOffer($id);
        return response()->json(['data' => ['id' => $id, 'status' => 'active', 'matches' => $n]]);
    }

    public function cancel(Request $r, int $id)
    {
        $o = $this->owned($r, $id); if ($o instanceof \Illuminate\Http\JsonResponse) return $o;
        if (!in_array($o->status, ['draft', 'active', 'applied'])) return $this->err('bad_status', 'Bu statusdan ləğv mümkün deyil', 409);
        DB::table('vehicle_offers')->where('id', $id)->update(['status' => 'cancelled', 'updated_at' => now()]);
        $this->matcher->forOffer($id); // aktiv olmadığı üçün uyğunluqları təmizləyir
        return response()->json(['data' => ['id' => $id, 'status' => 'cancelled']]);
    }

    /** Daşıyıcı: təklifə uyğun yüklər (bal və səbəblərlə). */
    public function matches(Request $r, int $id)
    {
        $o = $this->owned($r, $id); if ($o instanceof \Illuminate\Http\JsonResponse) return $o;
        $rows = DB::table('matches as m')->join('loads as l', 'l.id', '=', 'm.load_id')->where('m.vehicle_offer_id', $id)->orderByDesc('m.score')
            ->select('m.score', 'm.reasons', 'l.id as load_id', 'l.title', 'l.from_country_id', 'l.to_country_id', 'l.pickup_from', 'l.pickup_to', 'l.weight_kg', 'l.price', 'l.currency')->get()
            ->map(fn ($x) => tap($x, fn ($y) => $y->reasons = json_decode($y->reasons)));
        return response()->json(['data' => $rows]);
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
