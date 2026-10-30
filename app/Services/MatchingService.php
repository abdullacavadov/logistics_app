<?php
namespace App\Services;

/**
 * Qayda əsaslı uyğunlaşdırma v1.0 (TS §7). DB-dən asılı deyil.
 * Məcburi şərt pozulsa null qaytarır (bal nə qədər yüksək olsa da uyğun sayılmır).
 */
class MatchingService
{
    public const VERSION = '1.0';

    public function __construct(private array $w = ['route' => 40, 'date' => 25, 'price' => 20, 'capacity' => 15]) {}

    /** @return array{score:int,reasons:string[]}|null */
    public function score(array $load, array $offer, array $vehicle, ?string $today = null): ?array
    {
        $today ??= date('Y-m-d');
        // --- Məcburi yoxlamalar ---
        if (($offer['status'] ?? '') !== 'active' || $offer['available_to'] < $today) return null;
        if ($load['weight_kg'] > $vehicle['capacity_kg']) return null;
        if (!empty($load['volume_m3']) && !empty($vehicle['capacity_m3']) && $load['volume_m3'] > $vehicle['capacity_m3']) return null;
        if (!empty($load['needs_refrigeration']) && empty($vehicle['is_refrigerated'])) return null;
        if (!empty($load['required_vehicle_type_id']) && $load['required_vehicle_type_id'] != $vehicle['vehicle_type_id']) return null;
        $pEnd = $load['pickup_to'] ?? $load['pickup_from'];
        if ($load['pickup_from'] > $offer['available_to'] || $pEnd < $offer['available_from']) return null;

        $r = $this->route($load, $offer);
        if ($r === 0.0) return null;
        $d = $this->date($load, $offer);
        [$p, $priceReason] = $this->price($load, $offer);
        $c = $this->capacity($load, $vehicle);

        $routeReason = $r >= 1.0 ? 'Marşrut tam uyğundur' : ($r >= 0.7 ? 'Ölkələr uyğundur, şəhərlər qismən' : 'Yalnız bir ölkə uyğundur');
        $reasons = [
            $routeReason,
            $d >= 1.0 ? 'Yükləmə tarixi mövcudluq daxilindədir' : 'Tarixlər qismən kəsişir',
            $priceReason,
            'Nəqliyyat tutumu və tələblər uyğundur',
        ];

        $total = $this->w['route'] * $r + $this->w['date'] * $d + $this->w['price'] * $p + $this->w['capacity'] * $c;
        return ['score' => (int) round($total), 'reasons' => $reasons];
    }

    private function route(array $l, array $o): float
    {
        $fc = $l['from_country_id'] == $o['from_country_id'];
        $tc = $l['to_country_id'] == $o['to_country_id'];
        if (!$fc && !$tc) return 0.0;
        if ($fc && $tc) {
            $fl = !$l['from_location_id'] || !$o['from_location_id'] || $l['from_location_id'] == $o['from_location_id'];
            $tl = !$l['to_location_id'] || !$o['to_location_id'] || $l['to_location_id'] == $o['to_location_id'];
            return ($fl && $tl) ? 1.0 : 0.7;
        }
        return 0.5;
    }

    private function date(array $l, array $o): float
    {
        $pEnd = $l['pickup_to'] ?? $l['pickup_from'];
        return ($l['pickup_from'] >= $o['available_from'] && $pEnd <= $o['available_to']) ? 1.0 : 0.6;
    }

    /** Valyuta fərqli olarsa avtomatik konvertasiya YOXDUR — neytral bal. */
    private function price(array $l, array $o): array
    {
        if (empty($l['price']) || empty($o['price'])) return [0.5, 'Qiymət göstərilməyib — neytral'];
        if (($l['currency'] ?? '') !== ($o['currency'] ?? '')) return [0.5, 'Valyutalar fərqlidir — qiymət müqayisə olunmadı'];
        if ($o['price'] <= $l['price']) return [1.0, 'Qiymət büdcə daxilindədir'];
        $over = ($o['price'] - $l['price']) / $l['price'];
        if ($over <= 0.2) return [0.5, 'Qiymət büdcədən bir qədər yüksəkdir'];
        return !empty($l['price_negotiable']) ? [0.2, 'Qiymət yüksəkdir, müzakirə mümkündür'] : [0.0, 'Qiymət büdcəni aşır'];
    }

    private function capacity(array $l, array $v): float
    {
        return min(1.0, max(0.3, $l['weight_kg'] / max(1, $v['capacity_kg'])));
    }
}
