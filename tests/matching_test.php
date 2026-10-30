<?php
require __DIR__ . '/../app/Services/MatchingService.php';
use App\Services\MatchingService as M;

$m = new M();
$load = ['weight_kg'=>10000,'volume_m3'=>40,'from_country_id'=>1,'to_country_id'=>2,'from_location_id'=>1,'to_location_id'=>5,'pickup_from'=>'2026-11-10','pickup_to'=>'2026-11-12','price'=>2000,'currency'=>'EUR','price_negotiable'=>1];
$offer = ['status'=>'active','from_country_id'=>1,'to_country_id'=>2,'from_location_id'=>1,'to_location_id'=>5,'available_from'=>'2026-11-08','available_to'=>'2026-11-15','price'=>1900,'currency'=>'EUR'];
$veh = ['capacity_kg'=>20000,'capacity_m3'=>82,'vehicle_type_id'=>3,'is_refrigerated'=>0];
$today = '2026-11-01';
$fails = 0;
$ok = function (string $n, bool $c) use (&$fails) { echo ($c ? 'PASS ' : 'FAIL ') . $n . "\n"; if (!$c) $fails++; };

$r = $m->score($load, $offer, $veh, $today);
$ok('tam uyğun, bal >= 85', $r && $r['score'] >= 85);
$ok('çəki tutumu aşır -> uyğun deyil', $m->score(['weight_kg'=>25000] + $load, $offer, $veh, $today) === null);
$ok('marşrut uyğun gəlmir', $m->score(['from_country_id'=>9,'to_country_id'=>8] + $load, $offer, $veh, $today) === null);
$ok('tarixlər uyğun gəlmir', $m->score(['pickup_from'=>'2026-12-01','pickup_to'=>'2026-12-02'] + $load, $offer, $veh, $today) === null);
$ok('vasitə növü yanlış', $m->score(['required_vehicle_type_id'=>7] + $load, $offer, $veh, $today) === null);
$ok('soyuduculu tələb, vasitə soyuduculu deyil', $m->score(['needs_refrigeration'=>1] + $load, $offer, $veh, $today) === null);
$ok('təklifin müddəti bitib', $m->score($load, $offer, $veh, '2026-11-20') === null);
$r2 = $m->score($load, ['currency'=>'USD'] + $offer, $veh, $today);
$ok('valyuta fərqli -> neytral qiymət balı', $r2 && $r2['score'] < $r['score']);
$r3 = $m->score($load, ['to_location_id'=>9] + $offer, $veh, $today);
$ok('şəhər fərqli, ölkə eyni -> qismən (beynəlxalq sərt qayda yoxdur)', $r3 && $r3['score'] < $r['score'] && $r3['score'] > 0);
exit($fails);
