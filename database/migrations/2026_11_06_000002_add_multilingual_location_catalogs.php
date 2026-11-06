<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->unsignedBigInteger('geoname_id')->nullable()->unique()->after('id');
        });

        $countryNames = [
            'AZ' => ['az' => 'Azərbaycan', 'ru' => 'Азербайджан', 'en' => 'Azerbaijan', 'tr' => 'Azerbaycan'],
            'TR' => ['az' => 'Türkiyə', 'ru' => 'Турция', 'en' => 'Turkey', 'tr' => 'Türkiye'],
            'GE' => ['az' => 'Gürcüstan', 'ru' => 'Грузия', 'en' => 'Georgia', 'tr' => 'Gürcistan'],
            'RU' => ['az' => 'Rusiya', 'ru' => 'Россия', 'en' => 'Russia', 'tr' => 'Rusya'],
            'KZ' => ['az' => 'Qazaxıstan', 'ru' => 'Казахстан', 'en' => 'Kazakhstan', 'tr' => 'Kazakistan'],
            'DE' => ['az' => 'Almaniya', 'ru' => 'Германия', 'en' => 'Germany', 'tr' => 'Almanya'],
        ];

        foreach (DB::table('countries')->get(['id', 'iso2', 'name']) as $country) {
            $names = $countryNames[$country->iso2] ?? array_fill_keys(['az', 'ru', 'en', 'tr'], $country->name);
            $rows = [];
            foreach (['az', 'ru', 'en', 'tr'] as $locale) {
                $rows[] = ['country_id' => $country->id, 'locale' => $locale, 'name' => $names[$locale]];
            }
            DB::table('country_translations')->upsert($rows, ['country_id', 'locale'], ['name']);
        }

        foreach (DB::table('locations')->get(['id', 'name']) as $location) {
            $rows = [];
            foreach (['az', 'ru', 'en', 'tr'] as $locale) {
                $rows[] = ['location_id' => $location->id, 'locale' => $locale, 'name' => $location->name];
            }
            DB::table('location_translations')->upsert($rows, ['location_id', 'locale'], ['name']);
        }

        $typeTranslations = [
            'Tent 86 m³' => ['az' => 'Tent 86 m³', 'ru' => 'Тент 86 м³', 'en' => 'Curtainsider 86 m³', 'tr' => 'Tent 86 m³'],
            'Tent 90 m³' => ['az' => 'Tent 90 m³', 'ru' => 'Тент 90 м³', 'en' => 'Curtainsider 90 m³', 'tr' => 'Tent 90 m³'],
            'Tent 92 m³' => ['az' => 'Tent 92 m³', 'ru' => 'Тент 92 м³', 'en' => 'Curtainsider 92 m³', 'tr' => 'Tent 92 m³'],
            'Tent 96 m³' => ['az' => 'Tent 96 m³', 'ru' => 'Тент 96 м³', 'en' => 'Curtainsider 96 m³', 'tr' => 'Tent 96 m³'],
            'Tent 100 m³' => ['az' => 'Tent 100 m³', 'ru' => 'Тент 100 м³', 'en' => 'Curtainsider 100 m³', 'tr' => 'Tent 100 m³'],
            'Tent 105 m³' => ['az' => 'Tent 105 m³', 'ru' => 'Тент 105 м³', 'en' => 'Curtainsider 105 m³', 'tr' => 'Tent 105 m³'],
            'Tent 110 m³' => ['az' => 'Tent 110 m³', 'ru' => 'Тент 110 м³', 'en' => 'Curtainsider 110 m³', 'tr' => 'Tent 110 m³'],
            'Mega tent 110 m³' => ['az' => 'Mega tent 110 m³', 'ru' => 'Мега-тент 110 м³', 'en' => 'Mega curtainsider 110 m³', 'tr' => 'Mega tent 110 m³'],
            'Mega tent 120 m³' => ['az' => 'Mega tent 120 m³', 'ru' => 'Мега-тент 120 м³', 'en' => 'Mega curtainsider 120 m³', 'tr' => 'Mega tent 120 m³'],
            'Mega tent 130 m³' => ['az' => 'Mega tent 130 m³', 'ru' => 'Мега-тент 130 м³', 'en' => 'Mega curtainsider 130 m³', 'tr' => 'Mega tent 130 m³'],
            'Mega tent 140 m³' => ['az' => 'Mega tent 140 m³', 'ru' => 'Мега-тент 140 м³', 'en' => 'Mega curtainsider 140 m³', 'tr' => 'Mega tent 140 m³'],
            'Ref — rejimli' => ['az' => 'Ref — rejimli', 'ru' => 'Рефрижератор с режимом', 'en' => 'Refrigerated trailer', 'tr' => 'Frigorifik (soğutmalı)'],
            'Ref — rejimsiz' => ['az' => 'Ref — rejimsiz', 'ru' => 'Рефрижератор без режима', 'en' => 'Refrigerated trailer (no temperature setting)', 'tr' => 'Frigorifik (rejimsiz)'],
            'Avtodaşıyan' => ['az' => 'Avtodaşıyan', 'ru' => 'Автовоз', 'en' => 'Car transporter', 'tr' => 'Araç taşıyıcı'],
            'Alçaq platformalı' => ['az' => 'Alçaq platformalı', 'ru' => 'Низкорамный трал', 'en' => 'Low loader', 'tr' => 'Lowbed (alçak yataklı)'],
            'Konteyner daşıyıcı' => ['az' => 'Konteyner daşıyıcı', 'ru' => 'Контейнеровоз', 'en' => 'Container carrier', 'tr' => 'Konteyner taşıyıcı'],
            'Digər' => ['az' => 'Digər', 'ru' => 'Другое', 'en' => 'Other', 'tr' => 'Diğer'],
        ];

        foreach ($typeTranslations as $baseName => $names) {
            $typeId = DB::table('load_vehicle_types')->where('name', $baseName)->value('id');
            if (!$typeId) continue;
            $rows = [];
            foreach ($names as $locale => $name) {
                $rows[] = ['load_vehicle_type_id' => $typeId, 'locale' => $locale, 'name' => $name];
            }
            DB::table('load_vehicle_type_translations')->upsert($rows, ['load_vehicle_type_id', 'locale'], ['name']);
        }
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropUnique(['geoname_id']);
            $table->dropColumn('geoname_id');
        });
    }
};
