<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;

/** Uyğunluqları hesablayıb `matches` cədvəlinə yazır (TS §7.5). İlkin mərhələdə sinxron, sonra queue-ya keçirilə bilər. */
class MatchRunner
{
    public function __construct(private MatchingService $svc = new MatchingService()) {}

    public function forLoad(int $loadId): int
    {
        $load = DB::table('loads')->find($loadId);
        if (!$load || !in_array($load->status, ['published', 'has_applications'])) { $this->clear('load_id', $loadId); return 0; }
        $offers = DB::table('vehicle_offers as o')->join('vehicles as v', 'v.id', '=', 'o.vehicle_id')
            ->where('o.status', 'active')->where('o.available_to', '>=', date('Y-m-d'))->where('v.is_active', 1)
            ->where(fn ($w) => $w->where('o.from_country_id', $load->from_country_id)->orWhere('o.to_country_id', $load->to_country_id))
            ->select('o.*', 'v.capacity_kg', 'v.capacity_m3', 'v.vehicle_type_id', 'v.is_refrigerated')->get();
        $rows = [];
        foreach ($offers as $o) if ($m = $this->score($load, $o)) $rows[$o->id] = ['load_id' => $load->id, 'vehicle_offer_id' => $o->id] + $m;
        return $this->persist('load_id', $loadId, 'vehicle_offer_id', $rows);
    }

    public function forOffer(int $offerId): int
    {
        $o = DB::table('vehicle_offers as o')->join('vehicles as v', 'v.id', '=', 'o.vehicle_id')->where('o.id', $offerId)
            ->select('o.*', 'v.capacity_kg', 'v.capacity_m3', 'v.vehicle_type_id', 'v.is_refrigerated')->first();
        if (!$o || $o->status !== 'active') { $this->clear('vehicle_offer_id', $offerId); return 0; }
        $loads = DB::table('loads')->whereIn('status', ['published', 'has_applications'])
            ->where(fn ($w) => $w->where('from_country_id', $o->from_country_id)->orWhere('to_country_id', $o->to_country_id))->get();
        $rows = [];
        foreach ($loads as $l) if ($m = $this->score($l, $o)) $rows[$l->id] = ['load_id' => $l->id, 'vehicle_offer_id' => $o->id] + $m;
        return $this->persist('vehicle_offer_id', $offerId, 'load_id', $rows);
    }

    private function score(object $load, object $o): ?array
    {
        $res = $this->svc->score((array) $load, (array) $o, (array) $o);
        if (!$res || $res['score'] < $this->minScore()) return null;
        return ['score' => $res['score'], 'reasons' => json_encode($res['reasons'], JSON_UNESCAPED_UNICODE),
                'algorithm_version' => MatchingService::VERSION, 'calculated_at' => now()];
    }

    private function persist(string $col, int $id, string $otherCol, array $rows): int
    {
        DB::transaction(function () use ($col, $id, $otherCol, $rows) {
            $q = DB::table('matches')->where($col, $id);
            if ($rows) $q->whereNotIn($otherCol, array_keys($rows));
            $q->delete();
            foreach ($rows as $r) DB::table('matches')->upsert([$r], ['load_id', 'vehicle_offer_id'], ['score', 'reasons', 'algorithm_version', 'calculated_at']);
        });
        return count($rows);
    }

    private function clear(string $col, int $id): void { DB::table('matches')->where($col, $id)->delete(); }

    private function minScore(): int { return (int) (DB::table('matching_settings')->where('k', 'min_score')->value('v') ?? 30); }
}
