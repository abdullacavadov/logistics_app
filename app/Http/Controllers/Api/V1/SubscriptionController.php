<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Country-based, per-vehicle subscription pricing.
 * Payment execution is intentionally separate from price administration.
 */
class SubscriptionController extends Controller
{
    public function plans(Request $request)
    {
        $data = $request->validate([
            'country_id' => 'nullable|integer|exists:countries,id',
            'kind' => 'nullable|in:carrier,business_place',
        ]);

        $query = DB::table('subscription_plans as p')
            ->join('countries as c', 'c.id', '=', 'p.country_id')
            ->where('p.is_active', 1)
            ->where('p.effective_from', '<=', now())
            ->select('p.id', 'p.kind', 'p.country_id', 'c.iso2', 'c.name as country_name',
                'p.price as unit_price', 'p.currency', 'p.duration_months', 'p.effective_from');

        if (!empty($data['country_id'])) $query->where('p.country_id', $data['country_id']);
        if (!empty($data['kind'])) $query->where('p.kind', $data['kind']);

        return response()->json(['data' => $query->orderBy('c.name')->get()]);
    }

    public function adminIndex(Request $request)
    {
        if (!$this->isAdmin($request)) return $this->forbidden();

        return response()->json([
            'data' => DB::table('subscription_plans as p')
                ->join('countries as c', 'c.id', '=', 'p.country_id')
                ->select('p.id', 'p.kind', 'p.country_id', 'c.iso2', 'c.name as country_name',
                    'p.price', 'p.currency', 'p.duration_months', 'p.is_active', 'p.effective_from')
                ->orderBy('c.name')->orderByDesc('p.effective_from')->get(),
        ]);
    }

    /**
     * Create a new price version and deactivate the previous active version.
     * Existing subscriptions keep their plan_id and historical payment amounts.
     */
    public function storePlan(Request $request)
    {
        if (!$this->isAdmin($request)) return $this->forbidden();

        $data = $request->validate([
            'kind' => 'required|in:carrier,business_place',
            'country_id' => 'required|integer|exists:countries,id',
            'price' => 'required|numeric|min:0|max:999999999',
            'currency' => 'required|string|size:3',
            'duration_months' => 'nullable|integer|min:1|max:12',
        ]);

        if (!DB::table('countries')->where(['id' => $data['country_id'], 'is_active' => 1])->exists()) {
            return response()->json(['error' => ['code' => 'inactive_country', 'message' => 'Ölkə aktiv deyil']], 422);
        }

        $planId = DB::transaction(function () use ($request, $data) {
            DB::table('subscription_plans')
                ->where('kind', $data['kind'])
                ->where('country_id', $data['country_id'])
                ->where('is_active', 1)
                ->lockForUpdate()
                ->update(['is_active' => 0, 'updated_at' => now()]);

            $id = DB::table('subscription_plans')->insertGetId([
                'kind' => $data['kind'],
                'country_id' => $data['country_id'],
                'price' => $data['price'],
                'currency' => strtoupper($data['currency']),
                'duration_months' => $data['duration_months'] ?? 1,
                'is_active' => 1,
                'effective_from' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('audit_logs')->insert([
                'actor_id' => $request->user()->id,
                'action' => 'subscription_plan.create',
                'entity' => 'subscription_plan',
                'entity_id' => $id,
                'new_values' => json_encode([
                    'kind' => $data['kind'],
                    'country_id' => $data['country_id'],
                    'price' => $data['price'],
                    'currency' => strtoupper($data['currency']),
                    'duration_months' => $data['duration_months'] ?? 1,
                ], JSON_UNESCAPED_UNICODE),
                'ip' => $request->ip(),
                'created_at' => now(),
            ]);

            return $id;
        });

        return response()->json(['data' => DB::table('subscription_plans')->find($planId)], 201);
    }

    public function quote(Request $request)
    {
        $user = $request->user();
        if (!DB::table('user_roles')->where(['user_id' => $user->id, 'role' => 'carrier'])->exists()) {
            return response()->json(['error' => ['code' => 'not_carrier', 'message' => 'Daşıyıcı hüququ lazımdır']], 403);
        }

        $company = DB::table('companies')->where('user_id', $user->id)->orderBy('id')->first();
        $countryId = $company->country_id ?? $user->country_id;

        if (!$countryId) {
            return response()->json(['error' => ['code' => 'country_required', 'message' => 'Hesabın qeydiyyat ölkəsi müəyyən edilməyib']], 422);
        }

        $vehicles = DB::table('vehicles')->where('is_active', 1);
        if ($company) {
            $vehicleCount = $vehicles->where('company_id', $company->id)->count();
        } else {
            $vehicleCount = $vehicles->where('user_id', $user->id)->whereNull('company_id')->count();
        }

        if ($vehicleCount < 1) {
            return response()->json(['error' => ['code' => 'vehicle_required', 'message' => 'Abunəlik qiyməti üçün əvvəlcə aktiv nəqliyyat vasitəsi qeydiyyatdan keçirin']], 422);
        }

        $plan = DB::table('subscription_plans')
            ->where(['kind' => 'carrier', 'country_id' => $countryId, 'is_active' => 1])
            ->where('effective_from', '<=', now())
            ->orderByDesc('effective_from')->first();

        if (!$plan) {
            return response()->json(['error' => ['code' => 'plan_unavailable', 'message' => 'Bu ölkə üçün aktiv tarif təyin edilməyib']], 404);
        }

        $subtotal = round((float) $plan->price * $vehicleCount, 2);

        return response()->json(['data' => [
            'plan_id' => $plan->id,
            'country_id' => $countryId,
            'unit_price' => (float) $plan->price,
            'vehicle_count' => $vehicleCount,
            'subtotal' => $subtotal,
            'discount' => 0,
            'total' => $subtotal,
            'currency' => $plan->currency,
            'duration_months' => $plan->duration_months,
            'payment_available' => false,
        ]]);
    }

    public function mine(Request $request, SubscriptionService $subscriptions)
    {
        $subscription = DB::table('subscriptions')
            ->where('user_id', $request->user()->id)
            ->where('kind', 'carrier')
            ->orderByDesc('id')->first();

        return response()->json(['data' => [
            'subscription' => $subscription,
            'is_active' => $subscriptions->hasActiveCarrierSubscription($request->user()->id),
        ]]);
    }

    private function isAdmin(Request $request): bool
    {
        return DB::table('user_roles')->where([
            'user_id' => $request->user()->id,
            'role' => 'admin',
        ])->exists();
    }

    private function forbidden()
    {
        return response()->json(['error' => ['code' => 'forbidden', 'message' => 'Administrator hüququ tələb olunur']], 403);
    }
}
