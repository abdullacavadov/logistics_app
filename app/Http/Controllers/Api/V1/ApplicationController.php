<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Yük elanına müraciət — TS §8 və §9.10 yoxlama ardıcıllığı. */
class ApplicationController extends Controller
{
    public function store(Request $r, int $loadId, SubscriptionService $subs)
    {
        $user = $r->user();                                                    // 1. daxil olub
        $data = $r->validate([
            'vehicle_offer_id' => 'nullable|integer|exists:vehicle_offers,id',
            'price' => 'nullable|numeric|min:0', 'currency' => 'nullable|size:3', 'message' => 'nullable|string|max:1000',
        ]);
        if ($user->is_blocked) return $this->err('account_blocked', 'Hesab bloklanıb', 403);              // 6
        if (!DB::table('user_roles')->where(['user_id' => $user->id, 'role' => 'carrier'])->exists())
            return $this->err('not_carrier', 'Daşıyıcı hüququ yoxdur', 403);                                // 2
        if (!$subs->hasActiveCarrierSubscription($user->id))                                                // 3-5
            return $this->err('subscription_required', 'Aktiv abunəlik tələb olunur', 402, ['subscription_url' => '/account/subscription']);
        $load = DB::table('loads')->where('id', $loadId)->first();
        if (!$load || !in_array($load->status, ['published', 'has_applications'])) return $this->err('load_inactive', 'Elan aktiv deyil', 422); // 7
        if ($load->user_id === $user->id) return $this->err('own_load', 'Öz elanınıza müraciət edə bilməzsiniz', 422);                          // 8
        if (!empty($data['vehicle_offer_id']) &&
            !DB::table('vehicle_offers')->where(['id' => $data['vehicle_offer_id'], 'user_id' => $user->id])->exists())
            return $this->err('forbidden_offer', 'Təklif sizə məxsus deyil', 403);

        return DB::transaction(function () use ($data, $load, $user) {
            $exists = DB::table('applications')->where(['load_id' => $load->id, 'carrier_id' => $user->id])
                ->whereIn('status', ['pending', 'accepted'])->lockForUpdate()->exists();
            if ($exists) return $this->err('duplicate', 'Bu elana artıq müraciət etmisiniz', 409);
            $id = DB::table('applications')->insertGetId($data + [
                'load_id' => $load->id, 'carrier_id' => $user->id, 'status' => 'pending', 'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('loads')->where('id', $load->id)->where('status', 'published')->update(['status' => 'has_applications']);
            return response()->json(['data' => ['id' => $id, 'status' => 'pending']], 201);
        });
    }

    private function err(string $code, string $msg, int $http, array $extra = [])
    {
        return response()->json(['error' => ['code' => $code, 'message' => $msg] + $extra], $http); // daxili detal açıqlanmır
    }
}
