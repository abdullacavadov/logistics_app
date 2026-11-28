<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vehicle_offers', function (Blueprint $table) {
            $table->boolean('price_negotiable')->default(false)->after('currency');
        });

        DB::table('vehicle_offers')->whereNull('price')->update(['price_negotiable' => true]);

        Schema::create('load_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('load_id')->constrained('loads')->cascadeOnDelete();
            $table->foreignId('driver_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->restrictOnDelete();
            $table->foreignId('vehicle_offer_id')->nullable()->constrained('vehicle_offers')->nullOnDelete();
            $table->foreignId('application_id')->nullable()->constrained('applications')->nullOnDelete();
            $table->enum('initiated_by', ['shipper', 'driver']);
            $table->enum('status', ['pending', 'accepted', 'assigned', 'loading', 'in_transit', 'delivered', 'completed', 'rejected', 'cancelled'])->default('pending');
            $table->decimal('agreed_price', 12, 2)->nullable();
            $table->char('currency', 3)->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['driver_user_id', 'status']);
            $table->index(['load_id', 'status']);
            $table->unique('application_id');
        });

        Schema::create('driver_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->unique()->constrained('load_assignments')->cascadeOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('accuracy_m', 8, 2)->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_locations');
        Schema::dropIfExists('load_assignments');
        Schema::table('vehicle_offers', function (Blueprint $table) {
            $table->dropColumn('price_negotiable');
        });
    }
};
