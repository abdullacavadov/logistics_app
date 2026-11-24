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
    private const CRITICAL = ['from_country_id', 'from_location_id', 'to_country_id', 'to_location_id', 'pickup_from', 'is_ready_for_loading', 'weight_kg', 'volume_m3', 'quantity', 'load_vehicle_type_id', 'is_hazardous'];

    /** Ictimai axtarış (qonaq da görə bilər) — §5.3, səhifələnmiş. */
    public function index(Request $r)
    {
        $r->validate([
            'per_page' => 'nullable|integer|min:1|max:50',
            'min_weight' => 'nullable|numeric|min:0',
            'max_weight' => 'nullable|numeric|min:0',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'from_country_id' => 'nullable|integer|exists:countries,id',
            'from_location_id' => 'nullable|integer|exists:locations,id',
            'to_country_id' => 'nullable|integer|exists:countries,id',
            'to_location_id' => 'nullable|integer|exists:locations,id',
            'cargo_type_id' => 'nullable|integer|exists:cargo_types,id',
            'load_vehicle_type_id' => 'nullable|integer|exists:load_vehicle_types,id',
            'currency' => 'required_with:min_price,max_price|nullable|string|size:3',
            'applications' => 'nullable|in:web,whatsapp,telegram',
            'status' => 'nullable|in:published,has_applications',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'pickup_date' => 'nullable|date',
            'search' => 'nullable|string|max:200',
            'sort' => 'nullable|in:newest,oldest',
            'ids' => 'nullable|string|max:2000',
        ]);

        foreach ([
            ['min_weight', 'max_weight', 'Çəkinin maksimumu minimumdan az ola bilməz'],
            ['min_price', 'max_price', 'Qiymətin maksimumu minimumdan az ola bilməz'],
            ['date_from', 'date_to', 'Son tarix başlanğıc tarixindən əvvəl ola bilməz'],
        ] as [$minimum, $maximum, $message]) {
            $rangeIsInvalid = false;
            if ($r->filled($minimum) && $r->filled($maximum)) {
                $minValue = $r->input($minimum);
                $maxValue = $r->input($maximum);
                $rangeIsInvalid = is_numeric($minValue) && is_numeric($maxValue)
                    ? (float) $maxValue < (float) $minValue
                    : $maxValue < $minValue;
            }
            if ($rangeIsInvalid) {
                return response()->json([
                    'message' => $message,
                    'errors' => [$maximum => [$message]],
                ], 422);
            }
        }

        $q = $this->publicQuery()->whereIn('l.status', self::PUBLIC_STATUSES);

        if ($r->filled('ids')) {
            $ids = collect(explode(',', (string) $r->input('ids')))
                ->map(fn ($id) => (int) trim($id))
                ->filter(fn ($id) => $id > 0)
                ->unique()
                ->values();
            if ($ids->isEmpty()) {
                return response()->json(['data' => [], 'links' => ['first' => null, 'last' => null, 'prev' => null, 'next' => null], 'meta' => ['current_page' => 1, 'from' => null, 'last_page' => 1, 'path' => $r->url(), 'per_page' => 50, 'to' => null, 'total' => 0]]);
            }
            $q->whereIn('l.id', $ids);
        }
        $dateFrom = $r->input('date_from', $r->input('pickup_date'));
        $dateTo = $r->input('date_to', $r->input('pickup_date'));

        if ($dateFrom || $dateTo) {
            $today = now()->toDateString();
            $todayIsInRange = (!$dateFrom || $dateFrom <= $today)
                && (!$dateTo || $dateTo >= $today);

            $q->where(function ($dateQuery) use ($dateFrom, $dateTo, $todayIsInRange) {
                $dateQuery->where(function ($scheduled) use ($dateFrom, $dateTo) {
                    if ($dateFrom) $scheduled->whereDate('l.pickup_from', '>=', $dateFrom);
                    if ($dateTo) $scheduled->whereDate('l.pickup_from', '<=', $dateTo);
                });

                if ($todayIsInRange) {
                    $dateQuery->orWhere('l.is_ready_for_loading', true);
                }
            });
        } else {
            // Default marketplace: future-dated loads and ready-for-loading loads.
            $q->where(function ($dateQuery) {
                $dateQuery->where('l.is_ready_for_loading', true)
                    ->orWhere('l.pickup_from', '>=', now()->toDateString());
            });
        }

        foreach (([
            'from_country_id', 'from_location_id', 'to_country_id',
            'to_location_id', 'cargo_type_id', 'load_vehicle_type_id', 'currency',
            'applications', 'status',
        ]) as $field) {
            if ($r->filled($field)) $q->where("l.$field", $r->input($field));
        }

        if ($r->filled('min_weight')) $q->where('l.weight_kg', '>=', $r->min_weight);
        if ($r->filled('max_weight')) $q->where('l.weight_kg', '<=', $r->max_weight);
        if ($r->filled('min_price')) $q->where('l.price', '>=', $r->min_price);
        if ($r->filled('max_price')) $q->where('l.price', '<=', $r->max_price);

        if ($r->filled('search')) {
            $search = str_replace(['%', '_'], ['\\%', '\\_'], $r->input('search'));
            $q->where(function ($searchQuery) use ($search) {
                $searchQuery->where('l.title', 'like', "%{$search}%")
                    ->orWhere('l.description', 'like', "%{$search}%")
                    ->orWhere('fl.name', 'like', "%{$search}%")
                    ->orWhere('fc.name', 'like', "%{$search}%")
                    ->orWhere('tl.name', 'like', "%{$search}%")
                    ->orWhere('tc.name', 'like', "%{$search}%")
                    ->orWhere('ct.name', 'like', "%{$search}%")
                    ->orWhere('lvt.name', 'like', "%{$search}%");
            });
        }

        $direction = $r->input('sort') === 'oldest' ? 'asc' : 'desc';
        $loads = $q->orderBy('l.created_at', $direction)
            ->orderBy('l.id', $direction)
            ->paginate($r->integer('per_page', 15));

        return response()->json([
            'data' => $loads->items(),
            'links' => [
                'first' => $loads->url(1),
                'last' => $loads->url($loads->lastPage()),
                'prev' => $loads->previousPageUrl(),
                'next' => $loads->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $loads->currentPage(),
                'from' => $loads->firstItem(),
                'last_page' => $loads->lastPage(),
                'path' => $loads->path(),
                'per_page' => $loads->perPage(),
                'to' => $loads->lastItem(),
                'total' => $loads->total(),
            ],
        ]);
    }


    /**
     * Public map aggregation: one pin per pickup point, with destinations,
     * vehicle types and exact load IDs for the map popup's "show loads" action.
     */
    public function mapPoints()
    {
        $rows = DB::table('loads as l')
            ->leftJoin('countries as fc', 'fc.id', '=', 'l.from_country_id')
            ->leftJoin('locations as fl', 'fl.id', '=', 'l.from_location_id')
            ->leftJoin('countries as tc', 'tc.id', '=', 'l.to_country_id')
            ->leftJoin('locations as tl', 'tl.id', '=', 'l.to_location_id')
            ->leftJoin('load_vehicle_types as lvt', 'lvt.id', '=', 'l.load_vehicle_type_id')
            ->whereIn('l.status', self::PUBLIC_STATUSES)
            ->where(function ($query) {
                $query->where('l.is_ready_for_loading', true)
                    ->orWhere('l.pickup_from', '>=', now()->toDateString());
            })
            ->select(
                'l.id', 'l.from_location_id', 'l.from_country_id',
                DB::raw('COALESCE(l.from_lat, fl.lat) as from_lat'),
                DB::raw('COALESCE(l.from_lng, fl.lng) as from_lng'),
                'fc.name as from_country_name', 'fc.iso2 as from_country_iso2',
                DB::raw('COALESCE(fl.name, fc.name) as from_name'),
                'l.to_country_id', 'l.to_location_id', 'l.to_lat', 'l.to_lng',
                'tc.name as to_country_name', 'tc.iso2 as to_country_iso2',
                DB::raw('COALESCE(tl.name, tc.name) as to_name'),
                'lvt.name as vehicle_name'
            )
            ->get();

        $groups = [];
        foreach ($rows as $row) {
            if ($row->from_location_id) {
                $key = 'location:' . $row->from_location_id;
            } elseif ($row->from_lat !== null && $row->from_lng !== null) {
                $key = 'coords:' . round((float) $row->from_lat, 4) . ':' . round((float) $row->from_lng, 4);
            } else {
                $key = 'country:' . $row->from_country_id;
            }

            if (!isset($groups[$key])) {
                $groups[$key] = [
                    'key' => $key,
                    'from_location_id' => $row->from_location_id,
                    'from_country_id' => $row->from_country_id,
                    'from_name' => $row->from_name,
                    'from_country_name' => $row->from_country_name,
                    'from_country_iso2' => $row->from_country_iso2,
                    'lat' => $row->from_lat !== null ? (float) $row->from_lat : null,
                    'lng' => $row->from_lng !== null ? (float) $row->from_lng : null,
                    'load_ids' => [],
                    'destinations' => [],
                    'vehicles' => [],
                ];
            }

            $groups[$key]['load_ids'][] = (int) $row->id;
            $destinationKey = ($row->to_location_id ? 'location:' . $row->to_location_id : 'country:' . $row->to_country_id);
            if (!isset($groups[$key]['destinations'][$destinationKey])) {
                $groups[$key]['destinations'][$destinationKey] = [
                    'name' => $row->to_name,
                    'country_name' => $row->to_country_name,
                    'country_iso2' => $row->to_country_iso2,
                    'count' => 0,
                ];
            }
            $groups[$key]['destinations'][$destinationKey]['count']++;

            $vehicle = $row->vehicle_name ?: 'Nəqliyyat növü göstərilməyib';
            $groups[$key]['vehicles'][$vehicle] = ($groups[$key]['vehicles'][$vehicle] ?? 0) + 1;
        }

        $data = array_values(array_map(function ($group) {
            $group['count'] = count($group['load_ids']);
            $group['destinations'] = array_values($group['destinations']);
            $group['vehicles'] = array_map(
                fn ($name, $count) => ['name' => $name, 'count' => $count],
                array_keys($group['vehicles']),
                array_values($group['vehicles'])
            );
            return $group;
        }, $groups));

        return response()->json(['data' => $data]);
    }

    /** Public marketplace counters; definitions match the public loads/offers endpoints. */
    public function stats()
    {
        $activeLoads = DB::table('loads')
            ->whereIn('status', self::PUBLIC_STATUSES)
            ->where(function ($query) {
                $query->where('is_ready_for_loading', true)
                    ->orWhere('pickup_from', '>=', now()->toDateString());
            });

        $activeOffers = DB::table('vehicle_offers')
            ->where('status', 'active')
            ->where('available_to', '>=', now()->toDateString());

        return response()->json([
            'loads' => [
                'active' => (clone $activeLoads)->count(),
                'last_hour' => (clone $activeLoads)
                    ->where('created_at', '>=', now()->subHour())
                    ->count(),
            ],
            'vehicles' => [
                'active' => (clone $activeOffers)->count(),
                'last_hour' => (clone $activeOffers)
                    ->where('created_at', '>=', now()->subHour())
                    ->count(),
            ],
        ]);
    }

    public function show(Request $r, int $id)
    {
        $load = DB::table('loads')->where('id', $id)->first();
        $uid = auth('sanctum')->id();
        if (!$load || (!in_array($load->status, self::PUBLIC_STATUSES) && (int) $load->user_id !== (int) $uid)) {
            return $this->err('not_found', 'Elan tapılmadı', 404);
        }

        // Contact fields are exposed only when the per-load source record has explicit visibility enabled.
        // A single load may be found in multiple channels. Keep one primary source
        // record for the detail panel, matching the legacy loads.applications channel.
        $primarySource = DB::table('load_source_details')
            ->selectRaw('load_id, platform, MIN(id) as id')
            ->groupBy('load_id', 'platform');

        $detail = $this->publicQuery()
            ->leftJoin('users as u', 'u.id', '=', 'l.user_id')
            ->leftJoinSub($primarySource, 'lsd_first', function ($join) {
                $join->on('lsd_first.load_id', '=', 'l.id')
                    ->on('lsd_first.platform', '=', 'l.applications');
            })
            ->leftJoin('load_source_details as lsd', 'lsd.id', '=', 'lsd_first.id')
            ->where('l.id', $id)
            ->addSelect(
                'fl.name as from_location_name',
                'tl.name as to_location_name',
                'l.from_lat',
                'l.from_lng',
                'l.to_lat',
                'l.to_lng',
                'u.name as shipper_name',
                'lsd.source_name',
                'lsd.source_url',
                DB::raw('CASE WHEN lsd.contact_visible = 1 THEN lsd.contact_name ELSE NULL END as contact_name'),
                DB::raw('CASE WHEN lsd.contact_visible = 1 THEN lsd.contact_phone ELSE NULL END as contact_phone'),
                DB::raw('CASE WHEN lsd.contact_visible = 1 THEN lsd.source_profile_url ELSE NULL END as source_profile_url'),
                DB::raw('COALESCE(lsd.contact_visible, 0) as contact_visible')
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
            ->leftJoin('load_vehicle_types as lvt', 'lvt.id', '=', 'l.load_vehicle_type_id')
            ->where('l.user_id', $r->user()->id);
        if ($r->filled('status')) $q->where('l.status', $r->status);
        return response()->json($q->orderByDesc('l.id')
            ->select(
                'l.*',
                'fc.name as from_country_name',
                'fc.iso2 as from_country_iso2',
                DB::raw('COALESCE(fl.name, fc.name) as from_name'),
                'tc.name as to_country_name',
                'tc.iso2 as to_country_iso2',
                DB::raw('COALESCE(tl.name, tc.name) as to_name'),
                'ct.name as cargo_type_name',
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
        if ($compatibilityError = $this->loadVehicleCompatibilityError($d)) return $this->err('load_vehicle_mismatch', $compatibilityError, 422);
        $d['status'] = 'pending_moderation';
        // Website-created ads default to the website channel; integrations may provide another supported source.
        $d['applications'] = $d['applications'] ?? 'web';
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
        if ($compatibilityError = $this->loadVehicleCompatibilityError($d, (array) $load)) return $this->err('load_vehicle_mismatch', $compatibilityError, 422);
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

    /**
     * Cargo/body validation uses current catalog data. Payload limits are provisional
     * defaults until the catalog stores per-body maximum tonnage.
     */
    private function loadVehicleCompatibilityError(array $data, ?array $existing = null): ?string
    {
        $values = array_merge($existing ?? [], $data);
        $vehicleId = $values['load_vehicle_type_id'] ?? null;
        $cargoId = $values['cargo_type_id'] ?? null;
        if (!$vehicleId || !$cargoId) return null;

        $body = DB::table('load_vehicle_types')->where('id', $vehicleId)->where('is_active', 1)->first();
        if (!$body) return 'Seçilmiş yük yeri növü mövcud deyil.';

        $cargoName = strtolower((string) DB::table('cargo_types')->where('id', $cargoId)->value('name'));
        $isContainerCargo = str_contains($cargoName, 'konteyner') || str_contains($cargoName, 'container');
        if ($isContainerCargo && $body->category !== 'container_carrier') {
            return 'Konteyner yükü üçün konteyner daşıyıcı seçilməlidir.';
        }
        if (!$isContainerCargo && $body->category === 'container_carrier') {
            return 'Konteyner daşıyıcı yalnız konteyner yükü üçün seçilə bilər.';
        }

        $weightTon = ((float) ($values['weight_kg'] ?? 0)) / 1000;
        $maxWeightTon = $body->category === 'low_loader' ? 60 : ($body->category === 'car_carrier' ? 20 : 24);
        if ($weightTon > $maxWeightTon) {
            return 'Bu maşın üçün maksimum yük ' . $maxWeightTon . ' ton olmalıdır.';
        }

        $volume = $values['volume_m3'] ?? null;
        if ($volume !== null && $volume !== '' && $body->capacity_m3 !== null && (float) $volume > (float) $body->capacity_m3) {
            return 'Bu maşının tutumu ' . $body->capacity_m3 . ' m³-dür. Həcm daha böyük ola bilməz.';
        }

        return null;
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
            'from_lat' => 'nullable|numeric|between:-90,90',
            'from_lng' => 'nullable|numeric|between:-180,180',
            'to_lat' => 'nullable|numeric|between:-90,90',
            'to_lng' => 'nullable|numeric|between:-180,180',
            'pickup_from' => $s . 'required|date|after_or_equal:today',
            'is_ready_for_loading' => 'boolean',
            'weight_kg' => $s . 'required|numeric|gt:0|max:1000000',
            'volume_m3' => 'nullable|numeric|gt:0',
            'quantity' => $s . 'required|integer|min:1',
            'load_vehicle_type_id' => $s . 'required|exists:load_vehicle_types,id',
            'is_hazardous' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'currency' => 'required_with:price|nullable|string|size:3',
            'price_negotiable' => 'boolean',
            'applications' => 'sometimes|required|in:web,whatsapp,telegram',
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
            ->leftJoin('load_vehicle_types as lvt', 'lvt.id', '=', 'l.load_vehicle_type_id')
            ->select(array_map(fn($column) => "l.$column", $this->publicColumns()))
            ->addSelect(
                'fc.name as from_country_name',
                'fc.iso2 as from_country_iso2',
                DB::raw('COALESCE(fl.name, fc.name) as from_name'),
                'tc.name as to_country_name',
                'tc.iso2 as to_country_iso2',
                DB::raw('COALESCE(tl.name, tc.name) as to_name'),
                'ct.name as cargo_type_name',
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
            'needs_refrigeration',
            'quantity',
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
