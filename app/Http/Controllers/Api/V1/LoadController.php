<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Yük elanları — TS §5. Ictimai siyahı yalnız dərc olunmuşları göstərir; sahiblik server tərəfdə yoxlanılır. */
class LoadController extends Controller
{
    public function __construct(private \App\Services\MatchRunner $matcher) {}

    private const PUBLIC_STATUSES = ['published', 'has_applications'];
    private const CRITICAL = ['from_country_id', 'from_location_id', 'to_country_id', 'to_location_id', 'pickup_from', 'is_ready_for_loading', 'weight_kg', 'volume_m3', 'quantity', 'required_vehicle_type_id', 'load_vehicle_type_id', 'is_hazardous'];

    /** Ictimai axtarış (qonaq da görə bilər) — §5.3, səhifələnmiş. */
    public function index(Request $r)
    {
        $r->validate(['per_page' => 'nullable|integer|min:1|max:50', 'min_weight' => 'nullable|numeric|min:0', 'max_weight' => 'nullable|numeric|min:0']);
        $q = $this->publicQuery()
            ->whereIn('l.status', self::PUBLIC_STATUSES)
            ->where('l.pickup_from', '>=', now()->toDateString());
        foreach (['from_country_id', 'from_location_id', 'to_country_id', 'to_location_id', 'cargo_type_id', 'required_vehicle_type_id', 'currency'] as $f)
            if ($r->filled($f)) $q->where("l.$f", $r->input($f));
        if ($r->filled('min_weight')) $q->where('l.weight_kg', '>=', $r->min_weight);
        if ($r->filled('max_weight')) $q->where('l.weight_kg', '<=', $r->max_weight);
        if ($r->filled('pickup_date')) $q->whereDate('l.pickup_from', $r->pickup_date);
        if ($r->filled('min_price')) $q->where('l.price', '>=', $r->min_price);
        if ($r->filled('max_price')) $q->where('l.price', '<=', $r->max_price);
        return response()->json($q->orderByDesc('l.id')->paginate($r->integer('per_page', 15)));
    }

    public function show(Request $r, int $id)
    {
        $load = DB::table('loads')->where('id', $id)->first();
        $uid = auth('sanctum')->id();
        if (!$load || (!in_array($load->status, self::PUBLIC_STATUSES) && (int) $load->user_id !== (int) $uid)) {
            return $this->err('not_found', 'Elan tapılmadı', 404);
        }

        // Reuse the existing load detail endpoint; expose only the shipper's display name,
        // never phone/email or other private account fields.
        $detail = $this->publicQuery()
            ->leftJoin('users as u', 'u.id', '=', 'l.user_id')
            ->where('l.id', $id)
            ->addSelect(
                'fl.name as from_location_name',
                'tl.name as to_location_name',
                'l.from_address',
                'l.from_lat',
                'l.from_lng',
                'l.to_address',
                'l.to_lat',
                'l.to_lng',
                'u.name as shipper_name'
            )
            ->first();

        return response()->json(['data' => $detail]);
    }

    public function mine(Request $r)
    {
        $q = DB::table('loads as l')
            ->leftJoin('countries as fc', 'fc.id', '=', 'l.from_country_id')
            ->leftJoin('locations as fl', 'fl.id', '=', 'l.from_location_id')
            ->leftJoin('countries as tc', 'tc.id', '=', 'l.to_country_id')
            ->leftJoin('locations as tl', 'tl.id', '=', 'l.to_location_id')
            ->leftJoin('cargo_types as ct', 'ct.id', '=', 'l.cargo_type_id')
            ->leftJoin('vehicle_types as vt', 'vt.id', '=', 'l.required_vehicle_type_id')
            ->leftJoin('load_vehicle_types as lvt', 'lvt.id', '=', 'l.load_vehicle_type_id')
            ->where('l.user_id', $r->user()->id);
        if ($r->filled('status')) $q->where('l.status', $r->status);
        return response()->json($q->orderByDesc('l.id')
            ->select(
                'l.*',
                'fc.name as from_country_name',
                'fc.iso2 as from_country_iso2',
                DB::raw('COALESCE(fl.name, l.from_address, fc.name) as from_name'),
                'tc.name as to_country_name',
                'tc.iso2 as to_country_iso2',
                DB::raw('COALESCE(tl.name, l.to_address, tc.name) as to_name'),
                'ct.name as cargo_type_name',
                'vt.name as vehicle_type_name',
                'lvt.name as load_vehicle_type_name'
            )
            ->paginate($r->integer('per_page', 15)));
    }

    public function store(Request $r)
    {
        if (!DB::table('user_roles')->where(['user_id' => $r->user()->id, 'role' => 'shipper'])->exists())
            return $this->err('not_shipper', 'Yük elanı yaratmaq üçün yük sahibi hüququ lazımdır', 403); // ödəniş tələb olunmur (§2.2)
        $d = $r->validate($this->rules());
        if (!$this->validLocationSelection($d)) return $this->err('location_country_mismatch', 'Şəhər seçilmiş ölkəyə aid deyil', 422);
        $d['status'] = 'pending_moderation';
        // Required by the canonical loads schema; the channel is selected server-side.
        $d['applications'] = 'web';
        $id = DB::table('loads')->insertGetId($d + ['user_id' => $r->user()->id, 'created_at' => now(), 'updated_at' => now()]);
        $this->audit($r, 'load.create', $id, null, $d);
        return response()->json(['data' => DB::table('loads')->find($id)], 201);
    }

    public function update(Request $r, int $id)
    {
        $load = $this->owned($r, $id);
        if ($load instanceof \Illuminate\Http\JsonResponse) return $load;
        if (in_array($load->status, ['in_transit', 'completed', 'cancelled', 'archived'])) return $this->err('locked', 'Bu statusda elan dəyişdirilə bilməz', 409);
        $d = $r->validate($this->rules(true));
        if ($load->status === 'rejected') $d['status'] = 'pending_moderation';
        if (!$this->validLocationSelection($d, $load)) return $this->err('location_country_mismatch', 'Şəhər seçilmiş ölkəyə aid deyil', 422);
        // Müraciət/razılaşmadan sonra kritik sahələr dəyişdirilə bilməz (TS §5.4, açıq sual №6)
        $changedCritical = [];
        foreach (array_intersect(array_keys($d), self::CRITICAL) as $field) {
            $oldValue = $load->{$field} ?? null;
            $newValue = $d[$field];
            $same = in_array($field, ['is_hazardous', 'is_ready_for_loading'], true)
                ? (bool) $oldValue === (bool) $newValue
                : (($oldValue === null || $newValue === null)
                    ? $oldValue === $newValue
                    : (is_numeric($oldValue) && is_numeric($newValue)
                        ? (float) $oldValue === (float) $newValue
                        : (string) $oldValue === (string) $newValue));
            if (!$same) $changedCritical[] = $field;
        }
        if (in_array($load->status, ['has_applications', 'agreed']) && $changedCritical) {
            return $this->err('critical_locked', 'Müraciət daxil olduqdan sonra marşrut, tarix və yük parametrləri dəyişdirilə bilməz', 409);
        }
        DB::table('loads')->where('id', $id)->update($d + ['updated_at' => now()]);
        $this->audit($r, 'load.update', $id, (array) $load, $d);
        if (in_array($load->status, self::PUBLIC_STATUSES, true)) $this->matcher->forLoad($id);
        return response()->json(['data' => DB::table('loads')->find($id)]);
    }

    public function adminPending(Request $r)
    {
        if (!DB::table('user_roles')->where(['user_id' => $r->user()->id, 'role' => 'admin'])->exists()) {
            return $this->err('forbidden', 'Bu siyahı üçün administrator hüququ lazımdır', 403);
        }

        $rows = DB::table('loads as l')
            ->join('users as u', 'u.id', '=', 'l.user_id')
            ->leftJoin('countries as fc', 'fc.id', '=', 'l.from_country_id')
            ->leftJoin('locations as fl', 'fl.id', '=', 'l.from_location_id')
            ->leftJoin('countries as tc', 'tc.id', '=', 'l.to_country_id')
            ->leftJoin('locations as tl', 'tl.id', '=', 'l.to_location_id')
            ->leftJoin('cargo_types as ct', 'ct.id', '=', 'l.cargo_type_id')
            ->where('l.status', 'pending_moderation')
            ->orderBy('l.created_at')
            ->select('l.*', 'u.name as shipper_name', 'ct.name as cargo_type_name',
                DB::raw('COALESCE(fl.name, fc.name) as from_name'),
                DB::raw('COALESCE(tl.name, tc.name) as to_name'))
            ->paginate($r->integer('per_page', 20));

        return response()->json($rows);
    }

    public function moderate(Request $r, int $id)
    {
        if (!DB::table('user_roles')->where(['user_id' => $r->user()->id, 'role' => 'admin'])->exists()) {
            return $this->err('forbidden', 'Bu əməliyyat üçün administrator hüququ lazımdır', 403);
        }

        $data = $r->validate([
            'decision' => 'required|in:approve,reject',
            'reason' => 'nullable|string|max:500',
        ]);
        $load = DB::table('loads')->where('id', $id)->first();
        if (!$load) return $this->err('not_found', 'Elan tapılmadı', 404);
        if ($load->status !== 'pending_moderation') {
            return $this->err('bad_status', 'Yalnız moderasiya gözləyən elanlara qərar verilə bilər', 409);
        }

        $status = $data['decision'] === 'approve' ? 'published' : 'rejected';
        DB::table('loads')->where('id', $id)->update(['status' => $status, 'updated_at' => now()]);
        $this->audit($r, 'load.moderated', $id, ['status' => $load->status], [
            'status' => $status,
            'reason' => $data['reason'] ?? null,
        ]);
        $matches = $status === 'published' ? $this->matcher->forLoad($id) : 0;

        return response()->json(['data' => ['id' => $id, 'status' => $status, 'matches' => $matches]]);
    }

    public function publish(Request $r, int $id)
    {
        $load = $this->owned($r, $id);
        if ($load instanceof \Illuminate\Http\JsonResponse) return $load;
        if ($load->status !== 'draft') return $this->err('bad_status', 'Yalnız qaralama dərc oluna bilər', 409);
        DB::table('loads')->where('id', $id)->update(['status' => 'published', 'updated_at' => now()]);
        $n = $this->matcher->forLoad($id);
        return response()->json(['data' => ['id' => $id, 'status' => 'published', 'matches' => $n]]);
    }

    public function cancel(Request $r, int $id)
    {
        return $this->moveTo($r, $id, 'cancelled', ['draft', 'pending_moderation', 'published', 'has_applications', 'agreed']);
    }
    public function archive(Request $r, int $id)
    {
        return $this->moveTo($r, $id, 'archived', ['draft', 'pending_moderation', 'rejected', 'published', 'has_applications', 'completed', 'cancelled']);
    }

    private function moveTo(Request $r, int $id, string $to, array $from)
    {
        $load = $this->owned($r, $id);
        if ($load instanceof \Illuminate\Http\JsonResponse) return $load;
        if (!in_array($load->status, $from)) return $this->err('bad_status', 'Bu statusdan keçid mümkün deyil', 409);
        DB::table('loads')->where('id', $id)->update(['status' => $to, 'updated_at' => now()]);
        $this->audit($r, "load.$to", $id, ['status' => $load->status], ['status' => $to]);
        $this->matcher->forLoad($id); // aktiv deyilsə uyğunluqlar silinir
        return response()->json(['data' => ['id' => $id, 'status' => $to]]);
    }

    /** Yük sahibi: elana uyğun daşıyıcı təklifləri (bal və səbəblərlə). Əlaqə məlumatı göstərilmir. */
    public function matches(Request $r, int $id)
    {
        $load = $this->owned($r, $id);
        if ($load instanceof \Illuminate\Http\JsonResponse) return $load;
        $rows = DB::table('matches as m')->join('vehicle_offers as o', 'o.id', '=', 'm.vehicle_offer_id')->join('vehicles as v', 'v.id', '=', 'o.vehicle_id')
            ->join('users as u', 'u.id', '=', 'o.user_id')->leftJoin('companies as c', 'c.user_id', '=', 'u.id')->where('m.load_id', $id)->orderByDesc('m.score')
            ->select('m.score', 'm.reasons', 'o.id as offer_id', 'u.name as carrier', 'c.verification_status as company_status', 'v.vehicle_type_id', 'o.from_country_id', 'o.to_country_id', 'o.available_from', 'o.available_to', 'o.price', 'o.currency')->get()
            ->map(fn($x) => tap($x, fn($y) => $y->reasons = json_decode($y->reasons)));
        return response()->json(['data' => $rows]);
    }

    /** Başqasının elanı → 404 (varlığı açıqlanmır). */
    private function owned(Request $r, int $id)
    {
        $l = DB::table('loads')->where('id', $id)->where('user_id', $r->user()->id)->first();
        return $l ?: $this->err('not_found', 'Elan tapılmadı', 404);
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

    private function rules(bool $partial = false): array
    {
        $s = $partial ? 'sometimes|' : '';
        return [
            'title' => $s . 'required|string|max:200',
            'description' => 'nullable|string|max:5000',
            'cargo_type_id' => $s . 'required|exists:cargo_types,id',
            'from_country_id' => $s . 'required|exists:countries,id',
            'from_location_id' => 'nullable|exists:locations,id',
            'to_country_id' => $s . 'required|exists:countries,id',
            'to_location_id' => 'nullable|exists:locations,id',
            'pickup_from' => $s . 'required|date|after_or_equal:today',
            'is_ready_for_loading' => 'boolean',
            'weight_kg' => $s . 'required|numeric|gt:0|max:1000000',
            'volume_m3' => 'nullable|numeric|gt:0',
            'quantity' => $s . 'required|integer|min:1',
            'pallets' => 'nullable|integer|min:1',
            'required_vehicle_type_id' => 'nullable|exists:vehicle_types,id',
            'load_vehicle_type_id' => $s . 'required|exists:load_vehicle_types,id',
            'is_hazardous' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'currency' => 'required_with:price|nullable|string|size:3',
            'price_negotiable' => 'boolean',
        ];
    }

    /** Public listing payload enriched with display labels; never exposes owner/contact fields. */
    private function publicQuery()
    {
        return DB::table('loads as l')
            ->leftJoin('countries as fc', 'fc.id', '=', 'l.from_country_id')
            ->leftJoin('locations as fl', 'fl.id', '=', 'l.from_location_id')
            ->leftJoin('countries as tc', 'tc.id', '=', 'l.to_country_id')
            ->leftJoin('locations as tl', 'tl.id', '=', 'l.to_location_id')
            ->leftJoin('cargo_types as ct', 'ct.id', '=', 'l.cargo_type_id')
            ->leftJoin('vehicle_types as vt', 'vt.id', '=', 'l.required_vehicle_type_id')
            ->leftJoin('load_vehicle_types as lvt', 'lvt.id', '=', 'l.load_vehicle_type_id')
            ->select(array_map(fn($column) => "l.$column", $this->publicColumns()))
            ->addSelect(
                'fc.name as from_country_name',
                'fc.iso2 as from_country_iso2',
                DB::raw('COALESCE(fl.name, l.from_address, fc.name) as from_name'),
                'tc.name as to_country_name',
                'tc.iso2 as to_country_iso2',
                DB::raw('COALESCE(tl.name, l.to_address, tc.name) as to_name'),
                'ct.name as cargo_type_name',
                'vt.name as vehicle_type_name',
                'lvt.name as load_vehicle_type_name'
            );
    }

    private function publicColumns(): array
    {
        return [
            'id',
            'title',
            'description',
            'cargo_type_id',
            'from_country_id',
            'from_location_id',
            'to_country_id',
            'to_location_id',
            'pickup_from',
            'is_ready_for_loading',
            'weight_kg',
            'volume_m3',
            'pallets',
            'quantity',
            'required_vehicle_type_id',
            'load_vehicle_type_id',
            'is_hazardous',
            'price',
            'applications',
            'currency',
            'price_negotiable',
            'status',
            'created_at'
        ];
    }

    private function audit(Request $r, string $action, int $id, $old, $new): void
    {
        DB::table('audit_logs')->insert([
            'actor_id' => $r->user()->id,
            'action' => $action,
            'entity' => 'load',
            'entity_id' => $id,
            'old_values' => $old ? json_encode($old) : null,
            'new_values' => json_encode($new),
            'ip' => $r->ip(),
            'created_at' => now()
        ]);
    }

    private function err(string $c, string $m, int $h)
    {
        return response()->json(['error' => ['code' => $c, 'message' => $m]], $h);
    }
}
