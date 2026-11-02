# Lokal API sınağı (PowerShell)

> **Təhlükəsizlik:** Bu sınaqları yalnız lokal və ya ayrıca test bazasında aparın. `php artisan migrate:fresh` işlətməyin — mövcud DB-ni silə bilər. Layihənin DB mənbəyi `database/db.sql` faylıdır. Canlı bazada bu skripti icra etməyin.

## 1. Server və sessiya

Sanctum SPA autentifikasiyası Bearer token deyil, CSRF və session cookie istifadə edir. Aşağıdakı nümunədə yük sahibi və daşıyıcı üçün ayrı session yaradılır.

~~~powershell
$origin = "http://127.0.0.1:8000"
$api = "$origin/api/v1"
$shipperSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$carrierSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Initialize-Session($session) {
    Invoke-WebRequest "$origin/sanctum/csrf-cookie" -WebSession $session | Out-Null
    $cookie = $session.Cookies.GetCookies($origin) | Where-Object { $_.Name -eq "XSRF-TOKEN" } | Select-Object -First 1
    if (-not $cookie) { throw "XSRF-TOKEN cookie alınmadı" }
    return [Uri]::UnescapeDataString($cookie.Value)
}

function Invoke-Api($session, $xsrf, $path, $method = "GET", $body = $null) {
    $headers = @{ Accept = "application/json"; "X-XSRF-TOKEN" = $xsrf }
    $params = @{ Uri = "$api$path"; Method = $method; WebSession = $session; Headers = $headers }
    if ($null -ne $body) {
        $params.ContentType = "application/json; charset=utf-8"
        $params.Body = ($body | ConvertTo-Json -Depth 8)
    }
    return Invoke-RestMethod @params
}
~~~

## 2. Kataloq API-ləri

- GET /catalog/countries — aktiv ölkələr.
- GET /catalog/locations?country_id=1 — ölkəyə aid şəhərlər.
- GET /catalog/cargo-types — yük kateqoriyaları.
- GET /catalog/vehicle-types — nəqliyyat növləri.

~~~powershell
Invoke-RestMethod "$api/catalog/countries" -Headers @{ Accept = "application/json" }
Invoke-RestMethod "$api/catalog/locations?country_id=1" -Headers @{ Accept = "application/json" }
Invoke-RestMethod "$api/catalog/cargo-types" -Headers @{ Accept = "application/json" }
Invoke-RestMethod "$api/catalog/vehicle-types" -Headers @{ Accept = "application/json" }
~~~

## 3. Qeydiyyat

~~~powershell
$shipperXsrf = Initialize-Session $shipperSession
$shipper = Invoke-Api $shipperSession $shipperXsrf "/auth/register" "POST" @{
    name = "Test Yuk Sahibi"
    phone = "+994500001101"
    password = "testPassword123"
    password_confirmation = "testPassword123"
    country_id = 1
    role = "shipper"
    terms = $true
}

$carrierXsrf = Initialize-Session $carrierSession
$carrier = Invoke-Api $carrierSession $carrierXsrf "/auth/register" "POST" @{
    name = "Test Dasiyici"
    phone = "+994500001102"
    password = "testPassword123"
    password_confirmation = "testPassword123"
    country_id = 1
    role = "carrier"
    terms = $true
}
~~~

Qeydiyyat telefonları unikal olmalıdır. Təkrar sınaqda fərqli test nömrələri istifadə edin.

## 4. Yük sahibi — yaratma, redaktə və dərc

~~~powershell
$pickup = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
$load = Invoke-Api $shipperSession $shipperXsrf "/loads" "POST" @{
    title = "Baki-Tbilisi test yuk"
    description = "API smoke test"
    from_country_id = 1
    to_country_id = 3
    pickup_from = $pickup
    weight_kg = 10000
    price = 1500
    currency = "EUR"
    publish = $false
}
$loadId = $load.data.id

Invoke-Api $shipperSession $shipperXsrf "/loads/$loadId" "PUT" @{
    title = "Baki-Tbilisi test yuk - yenilendi"
    from_country_id = 1
    to_country_id = 3
    pickup_from = $pickup
    weight_kg = 10000
}

Invoke-Api $shipperSession $shipperXsrf "/loads/$loadId/publish" "POST"
Invoke-Api $shipperSession $shipperXsrf "/my/loads?per_page=50"
~~~

## 5. Daşıyıcı — vasitə və marşrut təklifi

~~~powershell
$vehicle = Invoke-Api $carrierSession $carrierXsrf "/vehicles" "POST" @{
    name = "Test Volvo FH"
    vehicle_type_id = 1
    capacity_kg = 20000
    capacity_m3 = 82
    reg_country_id = 1
}
$start = (Get-Date).AddDays(8).ToString("yyyy-MM-dd")
$end = (Get-Date).AddDays(16).ToString("yyyy-MM-dd")
$offer = Invoke-Api $carrierSession $carrierXsrf "/offers" "POST" @{
    vehicle_id = $vehicle.data.id
    from_country_id = 1
    to_country_id = 3
    available_from = $start
    available_to = $end
    price = 1400
    currency = "EUR"
    activate = $true
}
$offerId = $offer.data.id

Invoke-Api $carrierSession $carrierXsrf "/offers/$offerId" "PUT" @{
    price = 1350
    currency = "EUR"
}
Invoke-Api $carrierSession $carrierXsrf "/my/offers"
Invoke-Api $carrierSession $carrierXsrf "/offers/$offerId/matches"
~~~

## 6. Əlavə yoxlamalar

- GET /loads — ictimai elanlar; autentifikasiya tələb olunmur.
- GET /loads/{id}/matches — yalnız elan sahibinin sessiyası ilə.
- POST /offers/{id}/activate — qaralama təklifi aktivləşdirir.
- POST /offers/{id}/cancel — təklifi ləğv edir.
- DELETE /vehicles/{id} — aktiv təkliflə əlaqəli vasitə deaktiv edilməməlidir (409 gözlənilir).

Müraciət yaratma endpoint-i aktiv daşıyıcı abunəliyi tələb edir. Test bazasında etibarlı aktiv abunəlik yoxdursa, 402 cavabı gözləniləndir; bunu uğurlu müraciət testi kimi qiymətləndirməyin.

## 7. Frontend smoke test

1. Qeydiyyat səhifəsində ölkə siyahısının API-dən yükləndiyini yoxlayın.
2. Yük sahibi hesabı ilə /my/loads səhifəsində yeni elan yaradın, qaralama saxlayın, redaktə edin və dərc edin.
3. Daşıyıcı hesabı ilə /my/vehicles səhifəsində vasitə yaradın, redaktə edin və deaktiv edin.
4. /my/offers səhifəsində təklif yaradın, aktivləşdirin, redaktə edin və ləğv edin.
5. İki ayrı istifadəçi sessiyası ilə sahiblik və rol məhdudiyyətlərini yoxlayın.
6. Dark/light görünüş, mobil ölçülər və API xəta vəziyyətlərini yoxlayın.

## 8. Abunəlik tarifi və administrator yoxlaması

Administrator sessiyası ilə. Burada öz test administratorunuzun giriş məlumatlarını istifadə edin:

~~~powershell
$adminXsrf = Initialize-Session $adminSession
$adminLogin = Invoke-Api $adminSession $adminXsrf "/auth/login" "POST" @{
    login = "ADMIN_PHONE_OR_EMAIL"
    password = "ADMIN_TEST_PASSWORD"
}
Invoke-Api $adminSession $adminXsrf "/admin/subscription-plans"
Invoke-Api $adminSession $adminXsrf "/admin/subscription-plans" "POST" @{
    kind = "carrier"
    country_id = 1
    price = 12.50
    currency = "AZN"
    duration_months = 1
}
~~~

Daşıyıcı sessiyası ilə:

~~~powershell
Invoke-Api $carrierSession $carrierXsrf "/my/subscription"
Invoke-Api $carrierSession $carrierXsrf "/subscription/quote"
~~~

Admin testi üçün əvvəlcə admin rolu olan ayrıca test hesabı yaratmaq lazımdır. Tarif yazma endpoint-i yeni versiya yaradır və əvvəlki aktiv versiyanı deaktiv edir; bu əməliyyatı yalnız test bazasında edin. Daşıyıcı qiymət hesablaması aktiv vasitələrin sayını və istifadəçinin/şirkətin qeydiyyat ölkəsini əsas götürür.

Birbank ödənişinin başlanması və avtomatik yenilənməsi hələ aktiv deyil. Promo kod endirimi də endirim qaydaları təsdiqlənənədək hesablanmır.
