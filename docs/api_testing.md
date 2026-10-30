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
