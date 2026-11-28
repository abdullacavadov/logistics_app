<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssignmentController extends Controller
{
    private const ACTIVE = ['pending', 'accepted', 'assigned', 'loading', 'in_transit', 'delivered'];

    public function mine(Request $request)
    {
        $userId = $request->user()->id;
        $rows = DB::table('load_assignments as a')
            ->join('loads as l', 'l.id', '=', 'a.load_id')
            ->join('users as d', 'd.id', '=', 'a.driver_user_id')
            ->join('users as s', 's.id', '=', 'l.user_id')
            ->leftJoin('vehicles as v', 'v.id', '=', 'a.vehicle_id')
            ->where(fn ($q) => $q->where('a.driver_user_id', $userId)->orWhere('l.user_id', $userId))
            ->orderByDesc('a.id')
            ->select('a.*', 'l.title as load_title', 'l.user_id as shipper_user_id',
                'd.name as driver_name', 's.name as shipper_name', 'v.name as vehicle_name')
            ->paginate(20);

        $rows->getCollection()->transform(function ($row) use ($userId) {
            $row->viewer_role = (int) $row->driver_user_id === (int) $userId ? 'driver' : 'shipper';
            return $row;
        });
        return response()->json($rows);
    }

    public function applications(Request $request)
    {
        $userId = $request->user()->id;
        $rows = DB::table('applications as ap')
            ->join('loads as l', 'l.id', '=', 'ap.load_id')
            ->join('users as c', 'c.id', '=', 'ap.carrier_id')
            ->where(fn ($q) => $q->where('ap.carrier_id', $userId)->orWhere('l.user_id', $userId))
            ->orderByDesc('ap.id')
            ->select('ap.*', 'l.title as load_title', 'l.user_id as shipper_user_id', 'c.name as carrier_name')
            ->get()
            ->map(function ($row) use ($userId) {
                $row->viewer_role = (int) $row->carrier_id === (int) $userId ? 'driver' : 'shipper';
                return $row;
            });
        return response()->json(['data' => $rows]);
    }

    /** Shipper creates a direct order for a carrier's active vehicle offer. */
    public function sendDriverOffer(Request $request, int $loadId)
    {
        $data = $request->validate([
            'vehicle_offer_id' => 'required|integer|exists:vehicle_offers,id',
            'agreed_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
        ]);

        return DB::transaction(function () use ($request, $loadId, $data) {
            $load = DB::table('loads')->where('id', $loadId)->lockForUpdate()->first();
            if (!$load || (int) $load->user_id !== (int) $request->user()->id) return $this->error('forbidden_load', 'Bu yük sizə məxsus deyil', 403);
            if (!in_array($load->status, ['published', 'has_applications'])) return $this->error('load_inactive', 'Yük aktiv deyil', 409);

            $offer = DB::table('vehicle_offers')->where('id', $data['vehicle_offer_id'])->lockForUpdate()->first();
            if (!$offer || $offer->status !== 'active' || $offer->available_to < today()->toDateString()) {
                return $this->error('offer_inactive', 'Sürücü təklifi aktiv deyil', 422);
            }
            if ((int) $offer->user_id === (int) $request->user()->id) return $this->error('own_offer', 'Öz təklifinizə sifariş göndərə bilməzsiniz', 422);
            DB::table('users')->where('id', $offer->user_id)->lockForUpdate()->first();
            $vehicle = DB::table('vehicles')->where('id', $offer->vehicle_id)->first();
            if (!$vehicle || !(int) $vehicle->is_active) return $this->error('vehicle_inactive', 'Sürücünün nəqliyyat vasitəsi aktiv deyil', 422);
            if ((float) $vehicle->capacity_kg < (float) $load->weight_kg
                || ($load->volume_m3 !== null && $vehicle->capacity_m3 !== null && (float) $vehicle->capacity_m3 < (float) $load->volume_m3)
                || ((bool) $load->needs_refrigeration && !(bool) $vehicle->is_refrigerated)) {
                return $this->error('vehicle_incompatible', 'Nəqliyyat vasitəsi yükün çəki, həcm və ya soyuducu tələbinə uyğun deyil', 422);
            }
            if ($offer->available_from > $load->pickup_from || $offer->available_to < $load->pickup_from) {
                return $this->error('availability_mismatch', 'Sürücünün mövcudluq tarixi yükləmə tarixinə uyğun deyil', 422);
            }
            if (DB::table('load_assignments')->where('load_id', $loadId)->whereIn('status', self::ACTIVE)->exists()
                || DB::table('load_assignments')->where('driver_user_id', $offer->user_id)->whereIn('status', self::ACTIVE)->exists()) {
                return $this->error('load_already_assigned', 'Bu yük üzrə aktiv sifariş mövcuddur', 409);
            }

            $id = DB::table('load_assignments')->insertGetId([
                'load_id' => $loadId, 'driver_user_id' => $offer->user_id, 'vehicle_id' => $offer->vehicle_id,
                'vehicle_offer_id' => $offer->id, 'initiated_by' => 'shipper', 'status' => 'pending',
                'proposed_price' => $data['agreed_price'] ?? $offer->price,
                'proposed_currency' => $data['currency'] ?? $offer->currency, 'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('assignment_status_history')->insert(['assignment_id' => $id, 'actor_id' => $request->user()->id, 'from_status' => null, 'to_status' => 'pending', 'created_at' => now()]);
            DB::table('vehicle_offers')->where('id', $offer->id)->update(['status' => 'applied', 'updated_at' => now()]);
            return response()->json(['data' => DB::table('load_assignments')->find($id)], 201);
        });
    }

    /** Driver accepts or rejects a shipper's direct order. */
    public function respond(Request $request, int $id)
    {
        $data = $request->validate(['decision' => 'required|in:accept,reject']);
        return DB::transaction(function () use ($request, $id, $data) {
            $assignment = DB::table('load_assignments')->where('id', $id)->lockForUpdate()->first();
            if (!$assignment || (int) $assignment->driver_user_id !== (int) $request->user()->id) return $this->error('not_found', 'Sifariş tapılmadı', 404);
            if ($assignment->initiated_by !== 'shipper' || $assignment->status !== 'pending') return $this->error('invalid_status', 'Bu sifarişə artıq cavab verilib', 409);
            $status = $data['decision'] === 'accept' ? 'accepted' : 'rejected';
            DB::table('load_assignments')->where('id', $id)->update([
                'status' => $status,
                'agreed_price' => $status === 'accepted' ? $assignment->proposed_price : $assignment->agreed_price,
                'currency' => $status === 'accepted' ? $assignment->proposed_currency : $assignment->currency,
                'updated_at' => now(),
            ]);
            DB::table('assignment_status_history')->insert(['assignment_id' => $id, 'actor_id' => $request->user()->id, 'from_status' => 'pending', 'to_status' => $status, 'created_at' => now()]);
            if ($status === 'accepted') {
                DB::table('loads')->where('id', $assignment->load_id)->update(['status' => 'agreed', 'updated_at' => now()]);
                DB::table('vehicle_offers')->where('id', $assignment->vehicle_offer_id)->update(['status' => 'agreed', 'updated_at' => now()]);
            } else {
                DB::table('vehicle_offers')->where('id', $assignment->vehicle_offer_id)->update(['status' => 'active', 'updated_at' => now()]);
            }
            return response()->json(['data' => ['id' => $id, 'status' => $status]]);
        });
    }

    /** Shipper approves/rejects a driver's application and approval creates the assignment. */
    public function decideApplication(Request $request, int $applicationId)
    {
        $data = $request->validate(['decision' => 'required|in:accept,reject']);
        return DB::transaction(function () use ($request, $applicationId, $data) {
            $application = DB::table('applications')->where('id', $applicationId)->lockForUpdate()->first();
            if (!$application) return $this->error('not_found', 'Müraciət tapılmadı', 404);
            $load = DB::table('loads')->where('id', $application->load_id)->lockForUpdate()->first();
            if (!$load || (int) $load->user_id !== (int) $request->user()->id) return $this->error('forbidden', 'Bu müraciətə qərar vermək hüququ yoxdur', 403);
            if ($application->status !== 'pending') return $this->error('invalid_status', 'Müraciət artıq emal edilib', 409);

            if ($data['decision'] === 'reject') {
                DB::table('applications')->where('id', $applicationId)->update(['status' => 'rejected', 'updated_at' => now()]);
                return response()->json(['data' => ['application_id' => $applicationId, 'status' => 'rejected']]);
            }
            DB::table('users')->where('id', $application->carrier_id)->lockForUpdate()->first();
            if (DB::table('load_assignments')->where('load_id', $load->id)->whereIn('status', self::ACTIVE)->exists()
                || DB::table('load_assignments')->where('driver_user_id', $application->carrier_id)->whereIn('status', self::ACTIVE)->exists()) {
                return $this->error('load_already_assigned', 'Bu yük üzrə aktiv sifariş mövcuddur', 409);
            }

            $vehicleOffer = $application->vehicle_offer_id
                ? DB::table('vehicle_offers')->where('id', $application->vehicle_offer_id)->first()
                : DB::table('vehicles')->where('user_id', $application->carrier_id)->where('is_active', 1)->first();
            if (!$vehicleOffer) return $this->error('vehicle_required', 'Sürücünün aktiv nəqliyyat vasitəsi yoxdur', 422);
            if ($application->vehicle_offer_id && $vehicleOffer->status !== 'active') return $this->error('offer_inactive', 'Sürücü təklifi artıq aktiv deyil', 422);
            $vehicleId = $application->vehicle_offer_id ? $vehicleOffer->vehicle_id : $vehicleOffer->id;
            $vehicle = DB::table('vehicles')->where('id', $vehicleId)->where('user_id', $application->carrier_id)->where('is_active', 1)->first();
            if (!$vehicle || (float) $vehicle->capacity_kg < (float) $load->weight_kg
                || ($load->volume_m3 !== null && $vehicle->capacity_m3 !== null && (float) $vehicle->capacity_m3 < (float) $load->volume_m3)
                || ((bool) $load->needs_refrigeration && !(bool) $vehicle->is_refrigerated)) {
                return $this->error('vehicle_incompatible', 'Sürücünün nəqliyyat vasitəsi yükün tələblərinə uyğun deyil', 422);
            }
            if ($application->vehicle_offer_id && ($vehicleOffer->available_from > $load->pickup_from || $vehicleOffer->available_to < $load->pickup_from)) {
                return $this->error('availability_mismatch', 'Sürücünün mövcudluq tarixi yükləmə tarixinə uyğun deyil', 422);
            }
            $id = DB::table('load_assignments')->insertGetId([
                'load_id' => $load->id, 'driver_user_id' => $application->carrier_id, 'vehicle_id' => $vehicleId,
                'vehicle_offer_id' => $application->vehicle_offer_id, 'application_id' => $applicationId,
                'initiated_by' => 'driver', 'status' => 'accepted', 'agreed_price' => $application->price,
                'currency' => $application->currency, 'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('assignment_status_history')->insert(['assignment_id' => $id, 'actor_id' => $request->user()->id, 'from_status' => null, 'to_status' => 'accepted', 'created_at' => now()]);
            if ($application->vehicle_offer_id) DB::table('vehicle_offers')->where('id', $application->vehicle_offer_id)->update(['status' => 'agreed', 'updated_at' => now()]);
            DB::table('applications')->where('id', $applicationId)->update(['status' => 'accepted', 'updated_at' => now()]);
            DB::table('loads')->where('id', $load->id)->update(['status' => 'agreed', 'updated_at' => now()]);
            return response()->json(['data' => DB::table('load_assignments')->find($id)], 201);
        });
    }

    public function updateStatus(Request $request, int $id)
    {
        $data = $request->validate(['status' => 'required|in:assigned,loading,in_transit,delivered,completed,cancelled']);
        return DB::transaction(function () use ($request, $id, $data) {
            $a = DB::table('load_assignments as a')->join('loads as l', 'l.id', '=', 'a.load_id')
                ->where('a.id', $id)->select('a.*', 'l.user_id as shipper_id')->lockForUpdate()->first();
            if (!$a) return $this->error('not_found', 'Sifariş tapılmadı', 404);
            $isDriver = (int) $a->driver_user_id === (int) $request->user()->id;
            $isShipper = (int) $a->shipper_id === (int) $request->user()->id;
            if (!$isDriver && !$isShipper) return $this->error('forbidden', 'Bu sifarişə giriş icazəsi yoxdur', 403);
            $next = $data['status'];
            $allowed = [
                'pending' => ['cancelled'],
                'accepted' => ['assigned', 'cancelled'],
                'assigned' => ['loading', 'cancelled'],
                'loading' => ['in_transit', 'cancelled'],
                'in_transit' => ['delivered', 'cancelled'],
                'delivered' => ['completed'],
            ];
            if (!in_array($next, $allowed[$a->status] ?? [])) return $this->error('invalid_transition', 'Status keçidi mümkün deyil', 409);
            if ($a->status === 'pending' && $next === 'cancelled' && !$isShipper) return $this->error('shipper_action_required', 'Gözləyən sifarişi yalnız yük sahibi geri götürə bilər', 403);
            if ($next === 'completed' && !$isShipper) return $this->error('shipper_confirmation_required', 'Tamamlama yük sahibi tərəfindən təsdiqlənməlidir', 403);
            if ($next !== 'completed' && !$isDriver && $next !== 'cancelled') return $this->error('driver_action_required', 'Bu statusu sürücü yeniləməlidir', 403);
            DB::table('load_assignments')->where('id', $id)->update([
                'status' => $next, 'assigned_at' => $next === 'assigned' ? now() : $a->assigned_at,
                'completed_at' => $next === 'completed' ? now() : null, 'updated_at' => now(),
            ]);
            DB::table('assignment_status_history')->insert(['assignment_id' => $id, 'actor_id' => $request->user()->id, 'from_status' => $a->status, 'to_status' => $next, 'created_at' => now()]);
            if ($next === 'assigned') DB::table('vehicle_offers')->where('id', $a->vehicle_offer_id)->update(['status' => 'busy', 'updated_at' => now()]);
            if ($next === 'completed') DB::table('vehicle_offers')->where('id', $a->vehicle_offer_id)->update(['status' => 'completed', 'updated_at' => now()]);
            if ($next === 'cancelled') DB::table('vehicle_offers')->where('id', $a->vehicle_offer_id)->update(['status' => 'active', 'updated_at' => now()]);
            if ($next === 'in_transit') DB::table('loads')->where('id', $a->load_id)->update(['status' => 'in_transit', 'updated_at' => now()]);
            if ($next === 'completed') DB::table('loads')->where('id', $a->load_id)->update(['status' => 'completed', 'updated_at' => now()]);
            if (in_array($next, ['completed', 'cancelled'])) DB::table('driver_locations')->where('assignment_id', $id)->delete();
            return response()->json(['data' => ['id' => $id, 'status' => $next]]);
        });
    }

    public function updateLocation(Request $request, int $id)
    {
        $data = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy_m' => 'nullable|numeric|min:0|max:100000',
            'recorded_at' => 'nullable|date',
        ]);
        $a = DB::table('load_assignments')->where('id', $id)->first();
        if (!$a || (int) $a->driver_user_id !== (int) $request->user()->id) return $this->error('not_found', 'Aktiv sifariş tapılmadı', 404);
        if (!in_array($a->status, ['assigned', 'loading', 'in_transit', 'delivered'])) return $this->error('tracking_not_started', 'GPS yalnız sifariş təyin edildikdən sonra aktivdir', 409);
        DB::table('driver_locations')->updateOrInsert(['assignment_id' => $id], [
            'latitude' => $data['latitude'], 'longitude' => $data['longitude'],
            'accuracy_m' => $data['accuracy_m'] ?? null, 'recorded_at' => $data['recorded_at'] ?? now(),
            'updated_at' => now(), 'created_at' => now(),
        ]);
        return response()->json(['data' => ['assignment_id' => $id, 'saved' => true]]);
    }

    public function location(Request $request, int $id)
    {
        $row = DB::table('load_assignments as a')->join('loads as l', 'l.id', '=', 'a.load_id')
            ->join('driver_locations as p', 'p.assignment_id', '=', 'a.id')
            ->where('a.id', $id)->where('l.user_id', $request->user()->id)
            ->whereIn('a.status', ['assigned', 'loading', 'in_transit', 'delivered'])
            ->select('p.latitude', 'p.longitude', 'p.accuracy_m', 'p.recorded_at')->first();
        if (!$row) return $this->error('location_unavailable', 'Məkan məlumatı mövcud deyil', 404);
        return response()->json(['data' => $row]);
    }

    private function error(string $code, string $message, int $status)
    {
        return response()->json(['error' => ['code' => $code, 'message' => $message]], $status);
    }
}
