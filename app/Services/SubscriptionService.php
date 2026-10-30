<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;

/** Abunəlik statusu YALNIZ serverdə, DB-dən hesablanır (TS §9.10). */
class SubscriptionService
{
    public function hasActiveCarrierSubscription(int $userId, ?\DateTimeInterface $now = null): bool
    {
        $now ??= now();
        return DB::table('subscriptions')
            ->where('user_id', $userId)->where('kind', 'carrier')
            ->whereIn('status', ['active', 'grace'])      // 'cancelled' → ends_at-ə qədər aktiv qalır, aşağıda
            ->where('ends_at', '>=', $now)
            ->exists()
            || DB::table('subscriptions')
                ->where('user_id', $userId)->where('kind', 'carrier')
                ->where('status', 'cancelled')->where('ends_at', '>=', $now)->exists(); // ləğvdən sonra ödənilmiş müddət bitənə qədər (§9.8)
    }

    /** Eyni uğurlu bildiriş təkrar gəlsə müddət ikinci dəfə uzanmır (TS §9.5). */
    public function applySuccessfulPayment(int $paymentId): bool
    {
        return DB::transaction(function () use ($paymentId) {
            $p = DB::table('payments')->where('id', $paymentId)->lockForUpdate()->first();
            if (!$p || $p->period_applied) return false;
            $sub = DB::table('subscriptions')->where('id', $p->subscription_id)->lockForUpdate()->first();
            $plan = DB::table('subscription_plans')->where('id', $sub->plan_id)->first();
            $base = ($sub->ends_at && $sub->ends_at > now()) ? \Carbon\Carbon::parse($sub->ends_at) : now();
            $ends = $base->copy()->addMonths($plan->duration_months);
            DB::table('subscriptions')->where('id', $sub->id)->update([
                'status' => 'active', 'starts_at' => $sub->starts_at ?? now(), 'ends_at' => $ends,
                'next_payment_at' => $ends, 'last_payment_status' => 'success', 'updated_at' => now(),
            ]);
            DB::table('payments')->where('id', $p->id)->update(['status' => 'success', 'period_applied' => true, 'updated_at' => now()]);
            return true;
        });
    }
}
