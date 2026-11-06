<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use SplFileObject;

class ImportGeoNamesCities extends Command
{
    protected $signature = 'catalog:import-geonames
        {cities : Path to GeoNames cities5000.txt}
        {alternates : Path to GeoNames alternateNamesV2.txt}
        {country-info : Path to GeoNames countryInfo.txt}';

    protected $description = 'Import GeoNames cities and az/ru/en/tr translations into the location and country catalogs';

    public function handle(): int
    {
        $countries = DB::table('countries')->pluck('id', 'iso2')->all();
        if (!$countries) {
            $this->error('Countries table is empty.');
            return self::FAILURE;
        }

        foreach (['cities', 'alternates', 'country-info'] as $argument) {
            $path = $this->argument($argument);
            if (!is_file($path) || !is_readable($path)) {
                $this->error('File is missing or unreadable: '.$path);
                return self::FAILURE;
            }
        }

        $countryGeoNames = [];
        $countryInfo = new SplFileObject($this->argument('country-info'));
        while (!$countryInfo->eof()) {
            $line = trim($countryInfo->fgets());
            if ($line === '' || str_starts_with($line, '#')) continue;
            $row = explode("\t", $line);
            if (count($row) > 16 && isset($countries[$row[0]])) {
                $countryGeoNames[(int) $row[16]] = $countries[$row[0]];
            }
        }

        $cities = [];
        $cityAliases = [];
        $cityFile = new SplFileObject($this->argument('cities'));
        while (!$cityFile->eof()) {
            $line = trim($cityFile->fgets());
            if ($line === '') continue;
            $row = explode("\t", $line);
            if (count($row) < 15 || !isset($countries[$row[8]])) continue;

            $geonameId = (int) $row[0];
            $asciiName = trim($row[2]) ?: trim($row[1]);
            $cityAliases[$geonameId] = array_unique([trim($row[1]), trim($row[2])]);
            $cities[$geonameId] = [
                'geoname_id' => $geonameId,
                'country_id' => $countries[$row[8]],
                'name' => mb_substr($asciiName, 0, 120),
                'lat' => is_numeric($row[4]) ? $row[4] : null,
                'lng' => is_numeric($row[5]) ? $row[5] : null,
                'is_active' => 1,
            ];
        }

        if (!$cities) {
            $this->warn('No cities matched the countries currently stored in the database.');
        } else {
            // Attach GeoNames IDs to matching legacy rows first, preserving IDs already referenced by loads/offers.
            $legacyNames = [];
            foreach (DB::table('locations')->whereNull('geoname_id')->get(['id', 'country_id', 'name']) as $legacy) {
                $legacyNames[$legacy->country_id.'|'.mb_strtolower(trim($legacy->name))] = $legacy->id;
            }
            foreach ($cities as $geonameId => $city) {
                $matchedId = null;
                foreach ($cityAliases[$geonameId] as $alias) {
                    $key = $city['country_id'].'|'.mb_strtolower($alias);
                    if (isset($legacyNames[$key])) {
                        $matchedId = $legacyNames[$key];
                        break;
                    }
                }
                if ($matchedId) {
                    DB::table('locations')->where('id', $matchedId)->update([
                        'geoname_id' => $geonameId,
                        'name' => $city['name'],
                        'lat' => $city['lat'],
                        'lng' => $city['lng'],
                        'is_active' => 1,
                    ]);
                }
            }
            foreach (array_chunk(array_values($cities), 500) as $chunk) {
                DB::table('locations')->upsert($chunk, ['geoname_id'], ['country_id', 'name', 'lat', 'lng', 'is_active']);
            }
        }

        $ids = $cities
            ? DB::table('locations')->whereIn('geoname_id', array_keys($cities))->pluck('id', 'geoname_id')->all()
            : [];

        $fallbackRows = [];
        foreach ($cities as $geonameId => $city) {
            if (!isset($ids[$geonameId])) continue;
            foreach (['az', 'ru', 'en', 'tr'] as $locale) {
                $fallbackRows[] = ['location_id' => $ids[$geonameId], 'locale' => $locale, 'name' => $city['name']];
            }
            if (count($fallbackRows) >= 500) {
                DB::table('location_translations')->upsert($fallbackRows, ['location_id', 'locale'], ['name']);
                $fallbackRows = [];
            }
        }
        if ($fallbackRows) {
            DB::table('location_translations')->upsert($fallbackRows, ['location_id', 'locale'], ['name']);
        }

        $alternateRows = [];
        $countryRows = [];
        $alternateFile = new SplFileObject($this->argument('alternates'));
        while (!$alternateFile->eof()) {
            $line = trim($alternateFile->fgets());
            if ($line === '') continue;
            $row = explode("\t", $line);
            if (count($row) < 4 || !in_array($row[2], ['az', 'ru', 'en', 'tr'], true) || trim($row[3]) === '') continue;

            $geonameId = (int) $row[1];
            $name = mb_substr(trim($row[3]), 0, 150);
            if (isset($ids[$geonameId])) {
                $alternateRows[] = ['location_id' => $ids[$geonameId], 'locale' => $row[2], 'name' => $name];
            } elseif (isset($countryGeoNames[$geonameId])) {
                $countryRows[] = ['country_id' => $countryGeoNames[$geonameId], 'locale' => $row[2], 'name' => $name];
            }

            if (count($alternateRows) >= 500) {
                DB::table('location_translations')->upsert($alternateRows, ['location_id', 'locale'], ['name']);
                $alternateRows = [];
            }
            if (count($countryRows) >= 500) {
                DB::table('country_translations')->upsert($countryRows, ['country_id', 'locale'], ['name']);
                $countryRows = [];
            }
        }
        if ($alternateRows) {
            DB::table('location_translations')->upsert($alternateRows, ['location_id', 'locale'], ['name']);
        }
        if ($countryRows) {
            DB::table('country_translations')->upsert($countryRows, ['country_id', 'locale'], ['name']);
        }

        $this->info(count($cities).' GeoNames city records imported/updated.');
        $this->line('Four locale rows are ensured for each imported city; available alternate names replace fallback labels.');
        $this->line('Country translations are updated for countries matched through countryInfo.txt.');
        $this->line('GeoNames attribution: https://www.geonames.org/');

        return self::SUCCESS;
    }
}
