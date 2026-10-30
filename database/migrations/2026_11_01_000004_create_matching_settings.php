<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('matching_settings', function (Blueprint $t) {
            $t->string('k', 40)->primary();
            $t->string('v', 100);
        });
        DB::table('matching_settings')->insert([
            ['k' => 'w_route', 'v' => '40'], ['k' => 'w_date', 'v' => '25'], ['k' => 'w_price', 'v' => '20'],
            ['k' => 'w_capacity', 'v' => '15'], ['k' => 'min_score', 'v' => '30'], ['k' => 'version', 'v' => '1.0'],
        ]);
    }
    public function down(): void { Schema::dropIfExists('matching_settings'); }
};
