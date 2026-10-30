# FİKİRLƏŞİRİK — logistika platforması

Spesifikasiya: `texniki_tapshiriq.md`. Stek: Laravel + MySQL, REST `/api/v1`, Android/iOS WebView.

## Quraşdırma (təmiz Laravel 11 layihəsinə)
1. `composer create-project laravel/laravel .` və `composer require laravel/sanctum`
2. Bu repo fayllarını üzərinə köçür (`app/`, `database/migrations/`, `routes/api.php`, `tests/`)
3. `.env` → MySQL; `php artisan migrate`
4. Uyğunlaşdırma testi: `php tests/matching_test.php`

## Vəziyyət
- [x] Mərhələ 1 (qismən): sxem (`docs/reference_schema.sql`), açıq suallar `docs/open_questions.md`
- [x] Mərhələ 2 (qismən): core migration-lar
- [x] Mərhələ 4: `MatchingService` + testlər
- [x] Abunəlik yoxlaması + müraciət endpoint-i, ödənişin idempotent tətbiqi
- [ ] Qeydiyyat/giriş, admin panel, yük/nəqliyyat CRUD, biznes məkanları, Birbank, WebView
