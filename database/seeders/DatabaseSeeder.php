<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([['AZ','Azərbaycan','AZN'],['TR','Türkiyə','TRY'],['GE','Gürcüstan','GEL'],['RU','Rusiya','RUB'],['KZ','Qazaxıstan','KZT'],['DE','Almaniya','EUR']] as [$c,$n,$cur])
            DB::table('countries')->updateOrInsert(['iso2' => $c], ['name' => $n, 'default_currency' => $cur, 'is_active' => 1]);

        if (DB::table('vehicle_types')->count() === 0)
            DB::table('vehicle_types')->insert([
                ['name' => 'Tent (parusnik)', 'is_refrigerated' => 0], ['name' => 'Refrijerator', 'is_refrigerated' => 1],
                ['name' => 'Konteyner daşıyan', 'is_refrigerated' => 0], ['name' => 'Furqon', 'is_refrigerated' => 0],
                ['name' => 'Platforma', 'is_refrigerated' => 0], ['name' => 'Sisternli', 'is_refrigerated' => 0],
            ]);
        if (DB::table('cargo_types')->count() === 0)
            DB::table('cargo_types')->insert([['name' => 'Ümumi yük'], ['name' => 'Ərzaq'], ['name' => 'Tikinti materialları'], ['name' => 'Avadanlıq'], ['name' => 'Konteyner']]);
        if (DB::table('business_categories')->doesntExist()) {} // biznes məkanları — Mərhələ 5

        // YALNIZ TEST: qiymət biznes qərarıdır (docs/open_questions.md). Real tarif admin paneldən təyin olunacaq.
        $az = DB::table('countries')->where('iso2', 'AZ')->value('id');
        if (DB::table('subscription_plans')->doesntExist())
            DB::table('subscription_plans')->insert(['kind' => 'carrier', 'country_id' => $az, 'price' => 10.00, 'currency' => 'AZN',
                'duration_months' => 1, 'is_active' => 1, 'effective_from' => now(), 'created_at' => now(), 'updated_at' => now()]);
    }
}
