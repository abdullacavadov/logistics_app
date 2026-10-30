<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cargo_types', function (Blueprint $t) {
            $t->id(); $t->string('name', 100); $t->boolean('is_active')->default(true);
        });
        Schema::create('vehicle_types', function (Blueprint $t) {
            $t->id(); $t->string('name', 100); $t->boolean('is_refrigerated')->default(false); $t->boolean('is_active')->default(true);
        });
        Schema::create('vehicles', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->foreignId('company_id')->nullable()->constrained();
            $t->foreignId('vehicle_type_id')->constrained();
            $t->string('name', 120);
            $t->string('brand', 60)->nullable();
            $t->string('model', 60)->nullable();
            $t->unsignedInteger('capacity_kg');
            $t->decimal('capacity_m3', 8, 2)->nullable();
            $t->string('body_type', 60)->nullable();
            $t->boolean('is_refrigerated')->default(false);
            $t->foreignId('reg_country_id')->nullable()->constrained('countries');
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });
        Schema::create('loads', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->string('title', 200);
            $t->text('description')->nullable();
            $t->foreignId('cargo_type_id')->nullable()->constrained();
            $t->foreignId('from_country_id')->constrained('countries');
            $t->foreignId('from_location_id')->nullable()->constrained('locations');
            $t->string('from_address')->nullable();
            $t->decimal('from_lat', 9, 6)->nullable(); $t->decimal('from_lng', 9, 6)->nullable();
            $t->foreignId('to_country_id')->constrained('countries');
            $t->foreignId('to_location_id')->nullable()->constrained('locations');
            $t->string('to_address')->nullable();
            $t->decimal('to_lat', 9, 6)->nullable(); $t->decimal('to_lng', 9, 6)->nullable();
            $t->date('pickup_from'); $t->date('pickup_to')->nullable(); $t->date('delivery_by')->nullable();
            $t->decimal('weight_kg', 10, 2);
            $t->decimal('volume_m3', 8, 2)->nullable();
            $t->unsignedInteger('pallets')->nullable();
            $t->foreignId('required_vehicle_type_id')->nullable()->constrained('vehicle_types');
            $t->boolean('needs_refrigeration')->default(false);
            $t->decimal('temp_min', 5, 1)->nullable(); $t->decimal('temp_max', 5, 1)->nullable();
            $t->boolean('is_hazardous')->default(false);
            $t->text('notes')->nullable();
            $t->decimal('price', 12, 2)->nullable();
            $t->char('currency', 3)->nullable();
            $t->boolean('price_negotiable')->default(true);
            $t->enum('status', ['draft','published','has_applications','agreed','in_transit','completed','cancelled','archived'])->default('draft');
            $t->timestamps();
            $t->index(['status', 'pickup_from']);
            $t->index(['from_country_id', 'to_country_id']);
        });
        Schema::create('vehicle_offers', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->foreignId('vehicle_id')->constrained();
            $t->foreignId('from_country_id')->constrained('countries');
            $t->foreignId('from_location_id')->nullable()->constrained('locations');
            $t->foreignId('to_country_id')->constrained('countries');
            $t->foreignId('to_location_id')->nullable()->constrained('locations');
            $t->date('available_from'); $t->date('available_to');
            $t->decimal('price', 12, 2)->nullable();
            $t->char('currency', 3)->nullable();
            $t->text('terms')->nullable();
            $t->enum('status', ['draft','active','applied','agreed','busy','completed','cancelled','expired'])->default('draft');
            $t->timestamps();
            $t->index(['status', 'available_to']);
        });
        Schema::create('matches', function (Blueprint $t) {
            $t->id();
            $t->foreignId('load_id')->constrained()->cascadeOnDelete();
            $t->foreignId('vehicle_offer_id')->constrained()->cascadeOnDelete();
            $t->unsignedTinyInteger('score');
            $t->json('reasons');
            $t->string('algorithm_version', 20);
            $t->timestamp('calculated_at');
            $t->unique(['load_id', 'vehicle_offer_id']);
            $t->index('score');
        });
        Schema::create('applications', function (Blueprint $t) {
            $t->id();
            $t->foreignId('load_id')->constrained()->cascadeOnDelete();
            $t->foreignId('vehicle_offer_id')->nullable()->constrained();
            $t->foreignId('carrier_id')->constrained('users');
            $t->decimal('price', 12, 2)->nullable();
            $t->char('currency', 3)->nullable();
            $t->string('message', 1000)->nullable();
            $t->enum('status', ['pending','accepted','rejected','withdrawn','cancelled','completed'])->default('pending');
            $t->timestamps();
            $t->unique(['load_id', 'carrier_id']); // dublikat müraciətin qarşısı (TS §8.2)
        });
    }
    public function down(): void
    {
        foreach (['applications','matches','vehicle_offers','loads','vehicles','vehicle_types','cargo_types'] as $tb) Schema::dropIfExists($tb);
    }
};
