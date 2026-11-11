<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loads', function (Blueprint $table) {
            $table->dropColumn([
                'pickup_to',
                'delivery_by',
                'temp_min',
                'temp_max',
                'notes',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('loads', function (Blueprint $table) {
            $table->date('pickup_to')->nullable()->after('is_ready_for_loading');
            $table->date('delivery_by')->nullable()->after('pickup_to');
            $table->decimal('temp_min', 5, 1)->nullable()->after('load_vehicle_type_id');
            $table->decimal('temp_max', 5, 1)->nullable()->after('temp_min');
            $table->text('notes')->nullable()->after('is_hazardous');
        });
    }
};
