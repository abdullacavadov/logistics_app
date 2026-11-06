<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('load_vehicle_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('category', 40);
            $table->unsignedSmallInteger('capacity_m3')->nullable();
            $table->string('image_path', 255);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('loads', function (Blueprint $table) {
            $table->unsignedBigInteger('load_vehicle_type_id')->nullable()->after('required_vehicle_type_id');
            $table->foreign('load_vehicle_type_id')->references('id')->on('load_vehicle_types');
        });

        DB::statement("ALTER TABLE loads MODIFY status ENUM('draft','pending_moderation','published','has_applications','agreed','in_transit','completed','cancelled','archived') NOT NULL DEFAULT 'draft'");

        Schema::create('country_translations', function (Blueprint $table) {
            $table->unsignedBigInteger('country_id');
            $table->string('locale', 8);
            $table->string('name', 150);
            $table->primary(['country_id', 'locale']);
            $table->foreign('country_id')->references('id')->on('countries')->cascadeOnDelete();
        });
        Schema::create('location_translations', function (Blueprint $table) {
            $table->unsignedBigInteger('location_id');
            $table->string('locale', 8);
            $table->string('name', 150);
            $table->primary(['location_id', 'locale']);
            $table->foreign('location_id')->references('id')->on('locations')->cascadeOnDelete();
        });

        DB::statement("INSERT INTO country_translations (country_id, locale, name) SELECT id, 'az', name FROM countries");
        DB::statement("INSERT INTO location_translations (location_id, locale, name) SELECT id, 'az', name FROM locations");

        $rows = [
            ['Tent 86 m³', 'tent', 86, 'tent.svg', 10],
            ['Tent 90 m³', 'tent', 90, 'tent.svg', 20],
            ['Tent 92 m³', 'tent', 92, 'tent.svg', 30],
            ['Tent 96 m³', 'tent', 96, 'tent.svg', 40],
            ['Tent 100 m³', 'tent', 100, 'tent.svg', 50],
            ['Tent 105 m³', 'tent', 105, 'tent.svg', 60],
            ['Tent 110 m³', 'tent', 110, 'tent.svg', 70],
            ['Mega tent 110 m³', 'mega_tent', 110, 'mega-tent.svg', 80],
            ['Mega tent 120 m³', 'mega_tent', 120, 'mega-tent.svg', 90],
            ['Mega tent 130 m³', 'mega_tent', 130, 'mega-tent.svg', 100],
            ['Mega tent 140 m³', 'mega_tent', 140, 'mega-tent.svg', 110],
            ['Ref — rejimli', 'refrigerator', null, 'ref.svg', 120],
            ['Ref — rejimsiz', 'refrigerator', null, 'ref.svg', 130],
            ['Avtodaşıyan', 'car_carrier', null, 'car-carrier.svg', 140],
            ['Alçaq platformalı', 'low_loader', null, 'low-loader.svg', 150],
            ['Konteyner daşıyıcı', 'container_carrier', null, 'container-carrier.svg', 160],
            ['Digər', 'other', null, 'other.svg', 170],
        ];
        foreach ($rows as [$name, $category, $capacity, $image, $sort]) {
            DB::table('load_vehicle_types')->insert([
                'name' => $name, 'category' => $category, 'capacity_m3' => $capacity,
                'image_path' => '/images/load-vehicle-types/'.$image, 'sort_order' => $sort,
                'is_active' => true, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('loads', function (Blueprint $table) {
            $table->dropForeign(['load_vehicle_type_id']);
            $table->dropColumn('load_vehicle_type_id');
        });
        DB::statement("ALTER TABLE loads MODIFY status ENUM('draft','published','has_applications','agreed','in_transit','completed','cancelled','archived') NOT NULL DEFAULT 'draft'");
        Schema::dropIfExists('location_translations');
        Schema::dropIfExists('country_translations');
        Schema::dropIfExists('load_vehicle_types');
    }
};
