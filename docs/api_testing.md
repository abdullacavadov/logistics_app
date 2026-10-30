# Lokal API sınağı (PowerShell)
php artisan migrate:fresh --seed

$b = "http://localhost/logistics_app/public/api/v1"
$h = @{ Accept = "application/json" }

# Qeydiyyat (country_id=1 → AZ)
Invoke-RestMethod "$b/auth/register" -Method Post -Headers $h -ContentType "application/json" -Body '{"name":"Test Sürücü","phone":"+994501234567","password":"parol12345","password_confirmation":"parol12345","country_id":1,"role":"carrier","terms":true}'

# Giriş
$r = Invoke-RestMethod "$b/auth/login" -Method Post -Headers $h -ContentType "application/json" -Body '{"login":"+994501234567","password":"parol12345"}'
$h.Authorization = "Bearer $($r.data.token)"
Invoke-RestMethod "$b/auth/me" -Headers $h

# --- Yük elanı (shipper rolu ilə qeydiyyat edin: "role":"shipper") ---
$s = '{"name":"Yuk Sahibi","phone":"+994507654321","password":"parol12345","password_confirmation":"parol12345","country_id":1,"role":"shipper","terms":true}'
$r = Invoke-RestMethod "$b/auth/register" -Method Post -Headers $h -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($s))
$hs = @{ Accept = "application/json"; Authorization = "Bearer $($r.data.token)" }

$load = '{"title":"Baki-Tbilisi 10 ton","from_country_id":1,"to_country_id":3,"pickup_from":"2026-11-20","weight_kg":10000,"price":1500,"currency":"EUR","publish":true}'
Invoke-RestMethod "$b/loads" -Method Post -Headers $hs -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($load))

# Ictimai siyahı (token olmadan) və filtr
(Invoke-RestMethod "$b/loads?from_country_id=1&min_weight=5000" -Headers @{Accept="application/json"}).data
