# GeoNames city catalog

City data is stored in the LogisticsApp database. Download `cities5000.zip`, `alternateNamesV2.zip`, and `countryInfo.txt` from https://download.geonames.org/export/dump/ . Extract them under `database/import/geonames/`.

Run:

```bash
php artisan migrate
php artisan catalog:import-geonames database/import/geonames/cities5000.txt database/import/geonames/alternateNamesV2.txt database/import/geonames/countryInfo.txt
```

Only cities belonging to countries already present in `countries` are imported. Each imported city receives az, ru, en, and tr translation rows; GeoNames alternate names replace fallback labels where available. The command is repeatable and preserves existing location IDs by upserting on `geoname_id`.

GeoNames attribution: https://www.geonames.org/ .