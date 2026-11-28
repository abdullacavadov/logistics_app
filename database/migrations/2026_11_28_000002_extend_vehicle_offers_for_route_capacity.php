<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vehicle_offers', function (Blueprint $table) {
            $table->decimal('capacity_kg', 12, 2)->nullable()->after('available_to');
            $table->decimal('capacity_m3', 12, 2)->nullable()->after('capacity_kg');
            $table->unsignedInteger('quantity')->default(1)->after('capacity_m3');
            $table->unsignedBigInteger('load_vehicle_type_id')->nullable()->after('quantity');
            $table->boolean('is_ready_for_loading')->default(false)->after('load_vehicle_type_id');
        });

        DB::table('vehicle_offers as o')
            ->join('vehicles as v', 'v.id', '=', 'o.vehicle_id')
            ->update([
                'o.capacity_kg' => DB::raw('v.capacity_kg'),
                'o.capacity_m3' => DB::raw('v.capacity_m3'),
            ]);
    }

    public function down(): void
    {
        Schema::table('vehicle_offers', function (Blueprint $table) {
            $table->dropColumn(['capacity_kg', 'capacity_m3', 'quantity', 'load_vehicle_type_id', 'is_ready_for_loading']);
        });
    }
};
