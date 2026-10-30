<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Yük elanları — TS §5. Ictimai siyahı yalnız dərc olunmuşları göstərir; sahiblik server tərəfdə yoxlanılır. */
class LoadController extends Controller
{
    private const PUBLIC_STATUSES = ['published', 'has_applications'];
    private const CRITICAL = ['from_country_id','from_location_id','to_country_id','to_location_id','pickup_from','pickup_to','weight_kg','volume_m3','required_vehicle_type_id','needs_refrigeration'];

    /** Ictimai axtarış (qonaq da görə bilər) — §5.3, səhifələnmiş. */
    public function index(Request $r)
    {
        $r->validate(['per_page' => 'nullable|integer|min:1|max:50', 'min_weight' => 'nullable|numeric|min:0', 'max_weight' => 'nullable|numeric|min:0']);
        $q = DB::table('loads')->whereIn('status', self::PUBLIC_STATUSES)->where(fn ($w) => $w->whereNull('pickup_to')->where('pickup_from', '>=', now()->toDateString())->orWhere('pickup_to', '>=', now()->toDateString()));
        foreach (['from_country_id', 'from_location_id', 'to_country_id', 'to_location_id', 'cargo_type_id', 'required_vehicle_type_id', 'currency'] as $f)
            if ($r->filled($f)) $q->where($f, $r->input($f));
        if ($r->filled('min_weight')) $q->where('weight_kg', '>=', $r->min_weight);
        if ($r->filled('max_weight')) $q->where('weight_kg', '<=', $r->max_weight);
        if ($r->filled('pickup_date')) $q->where('pickup_from', '<=', $r->pickup_date)->whereRaw('COALESCE(pickup_to, pickup_from) >= ?', [$r->pickup_date]);
        if ($r->filled('min_price')) $q->where('price', '>=', $r->min_price);
        if ($r->filled('max_price')) $q->where('price', '<=', $r->max_price);
        return response()->json($q->orderByDesc('id')->select($this->publicColumns())->paginate($r->integer('per_page', 15)));
    }

    public function show(Request $r, int $id)
    {
        $load = DB::table('loads')->where('id', $id)->first();
        $uid = auth('sanctum')->id();
        if (!$load || (!in_array($load->status, self::PUBLIC_STATUSES) && $load->user_id !== $uid)) return $this->err('not_found', 'Elan tapılmadı', 404);
        return response()->json(['data' => $load->user_id === $uid ? $load : (object) collect($load)->only($this->publicColumns())->all()]);
    }

    public function mine(Request $r)
    {
        $q = DB::table('loads')->where('user_id', $r->user()->id);
        if ($r->filled('status')) $q->where('status', $r->status);
        return response()->json($q->orderByDesc('id')->paginate($r->integer('per_page', 15)));
    }

    public function store(Request $r)
    {
        if (!DB::table('user_roles')->where(['user_id' => $r->user()->id, 'role' => 'shipper'])->exists())
            return $this->err('not_shipper', 'Yük elanı yaratmaq üçün yük sahibi hüququ lazımdır', 403); // ödəniş tələb olunmur (§2.2)
        $d = $r->validate($this->rules());
        $d['status'] = ($r->boolean('publish')) ? 'published' : 'draft';
        $id = DB::table('loads')->insertGetId($d + ['user_id' => $r->user()->id, 'created_at' => now(), 'updated_at' => now()]);
        $this->audit($r, 'load.create', $id, null, $d);
        return response()->json(['data' => DB::table('loads')->find($id)], 201);
    }

    public function update(Request $r, int $id)
    {
        $load = $this->owned($r, $id); if ($load instanceof \Illuminate\Http\JsonResponse) return $load;
        if (in_array($load->status, ['in_transit', 'completed', 'cancelled', 'archived'])) return $this->err('locked', 'Bu statusda elan dəyişdirilə bilməz', 409);
        $d = $r->validate($this->rules(true));
        // Müraciət/razılaşmadan sonra kritik sahələr dəyişdirilə bilməz (TS §5.4, açıq sual №6)
        if (in_array($load->status, ['has_applications', 'agreed']) && array_intersect(array_keys($d), self::CRITICAL))
            return $this->err('critical_locked', 'Müraciət daxil olduqdan sonra marşrut, tarix və yük parametrləri dəyişdirilə bilməz', 409);
        DB::table('loads')->where('id', $id)->update($d + ['updated_at' => now()]);
        $this->audit($r, 'load.update', $id, (array) $load, $d);
        return response()->json(['data' => DB::table('loads')->find($id)]);
    }

    public function publish(Request $r, int $id)
    {
        $load = $this->owned($r, $id); if ($load instanceof \Illuminate\Http\JsonResponse) return $load;
        if ($load->status !== 'draft') return $this->err('bad_status', 'Yalnız qaralama dərc oluna bilər', 409);
        DB::table('loads')->where('id', $id)->update(['status' => 'published', 'updated_at' => now()]);
        return response()->json(['data' => ['id' => $id, 'status' => 'published']]);
    }

    public function cancel(Request $r, int $id) { return $this->moveTo($r, $id, 'cancelled', ['draft', 'published', 'has_applications', 'agreed']); }
    public function archive(Request $r, int $id) { return $this->moveTo($r, $id, 'archived', ['draft', 'published', 'has_applications', 'completed', 'cancelled']); }

    private function moveTo(Request $r, int $id, string $to, array $from)
    {
        $load = $this->owned($r, $id); if ($load instanceof \Illuminate\Http\JsonResponse) return $load;
        if (!in_array($load->status, $from)) return $this->err('bad_status', 'Bu statusdan keçid mümkün deyil', 409);
        DB::table('loads')->where('id', $id)->update(['status' => $to, 'updated_at' => now()]);
        $this->audit($r, "load.$to", $id, ['status' => $load->status], ['status' => $to]);
        return response()->json(['data' => ['id' => $id, 'status' => $to]]);
    }

    /** Başqasının elanı → 404 (varlığı açıqlanmır). */
    private function owned(Request $r, int $id)
    {
        $l = DB::table('loads')->where('id', $id)->where('user_id', $r->user()->id)->first();
        return $l ?: $this->err('not_found', 'Elan tapılmadı', 404);
    }

    private function rules(bool $partial = false): array
    {
        $s = $partial ? 'sometimes|' : '';
        return [
            'title' => $s . 'required|string|max:200', 'description' => 'nullable|string|max:5000',
            'cargo_type_id' => 'nullable|exists:cargo_types,id',
            'from_country_id' => $s . 'required|exists:countries,id', 'from_location_id' => 'nullable|exists:locations,id',
            'from_address' => 'nullable|string|max:255', 'from_lat' => 'nullable|numeric|between:-90,90', 'from_lng' => 'nullable|numeric|between:-180,180',
            'to_country_id' => $s . 'required|exists:countries,id', 'to_location_id' => 'nullable|exists:locations,id',
            'to_address' => 'nullable|string|max:255', 'to_lat' => 'nullable|numeric|between:-90,90', 'to_lng' => 'nullable|numeric|between:-180,180',
            'pickup_from' => $s . 'required|date|after_or_equal:today', 'pickup_to' => 'nullable|date|after_or_equal:pickup_from',
            'delivery_by' => 'nullable|date|after_or_equal:pickup_from',
            'weight_kg' => $s . 'required|numeric|gt:0|max:1000000', 'volume_m3' => 'nullable|numeric|gt:0', 'pallets' => 'nullable|integer|min:1',
            'required_vehicle_type_id' => 'nullable|exists:vehicle_types,id', 'needs_refrigeration' => 'boolean',
            'temp_min' => 'nullable|numeric', 'temp_max' => 'nullable|numeric|gte:temp_min', 'is_hazardous' => 'boolean', 'notes' => 'nullable|string|max:3000',
            'price' => 'nullable|numeric|min:0', 'currency' => 'required_with:price|nullable|string|size:3', 'price_negotiable' => 'boolean',
        ];
    }

    private function publicColumns(): array
    {
        return ['id','title','description','cargo_type_id','from_country_id','from_location_id','to_country_id','to_location_id','pickup_from','pickup_to','delivery_by',
            'weight_kg','volume_m3','pallets','required_vehicle_type_id','needs_refrigeration','temp_min','temp_max','is_hazardous','price','currency','price_negotiable','status','created_at'];
    }

    private function audit(Request $r, string $action, int $id, $old, $new): void
    {
        DB::table('audit_logs')->insert(['actor_id' => $r->user()->id, 'action' => $action, 'entity' => 'load', 'entity_id' => $id,
            'old_values' => $old ? json_encode($old) : null, 'new_values' => json_encode($new), 'ip' => $r->ip(), 'created_at' => now()]);
    }

    private function err(string $c, string $m, int $h) { return response()->json(['error' => ['code' => $c, 'message' => $m]], $h); }
}
