<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $columnsToDrop = [
            'pickup_to',
            'delivery_by',
            'temp_min',
            'temp_max',
            'notes',
        ];

        // Local and production databases may have different schema histories.
        // Drop only columns that still exist; never recreate or alter existing data.
        $existingColumns = array_values(array_filter(
            $columnsToDrop,
            fn (string $column): bool => Schema::hasColumn('loads', $column)
        ));

        if ($existingColumns !== []) {
            Schema::table('loads', function (Blueprint $table) use ($existingColumns) {
                $table->dropColumn($existingColumns);
            });
        }
    }

    public function down(): void
    {
        // Restore only missing columns, in dependency/order sequence.
        if (!Schema::hasColumn('loads', 'pickup_to')) {
            Schema::table('loads', function (Blueprint $table) {
                $table->date('pickup_to')->nullable()->after('is_ready_for_loading');
            });
        }

        if (!Schema::hasColumn('loads', 'delivery_by')) {
            Schema::table('loads', function (Blueprint $table) {
                $table->date('delivery_by')->nullable()->after('pickup_to');
            });
        }

        if (!Schema::hasColumn('loads', 'temp_min')) {
            Schema::table('loads', function (Blueprint $table) {
                $table->decimal('temp_min', 5, 1)->nullable()->after('load_vehicle_type_id');
            });
        }

        if (!Schema::hasColumn('loads', 'temp_max')) {
            Schema::table('loads', function (Blueprint $table) {
                $table->decimal('temp_max', 5, 1)->nullable()->after('temp_min');
            });
        }

        if (!Schema::hasColumn('loads', 'notes')) {
            Schema::table('loads', function (Blueprint $table) {
                $table->text('notes')->nullable()->after('is_hazardous');
            });
        }
    }
};
