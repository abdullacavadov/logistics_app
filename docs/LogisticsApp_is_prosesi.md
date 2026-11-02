# LogisticsApp — İş Prosesi və İcra Checklist-i

> **İstifadə qaydası:** Hər tapşırığın qarşısındakı `[ ]` işarəsini yalnız implementasiya, yoxlama və qəbul meyarları tamamlandıqdan sonra `[x]` et. Sadəcə kodun yazılması işi tamamlanmış hesab etmir.
>
> **Status qaydası:** `[ ]` Gözləyir · `[x]` Tamamlandı · `[!]` Bloklanıb · `[-]` Əhatə dairəsindən çıxarılıb / sonrakı versiya.

## 0. Layihənin dəyişməz texniki qaydaları

- [ ] Repository: `abdullacavadov/logistics_app`, əsas branch: `main`.
- [ ] Hər iş ayrıca feature branch-də aparılır.
- [ ] Dəyişikliklər commit edilir və PR açılır.
- [ ] İstifadəçinin açıq icazəsi olmadan PR merge edilmir.
- [ ] İşə başlamazdan əvvəl cari `main`, açıq PR-lar və əlaqəli kod yoxlanılır.
- [ ] Mövcud arxitektura və kod standartları qorunur; lazımsız refactoring edilmir.
- [ ] Database üçün yeganə əsas mənbə `database/db.sql` faylıdır.
- [ ] DB işi başlamazdan əvvəl `database/db.sql` oxunur; sütun/cədvəl adları təxmin edilmir.
- [ ] Migration-lar mövcud DB sxemini müəyyənləşdirmək üçün əsas götürülmür.
- [ ] `docs/reference_schema.sql` yalnız əlavə/tarixi istinaddır.
- [ ] Demo/mock məlumatlar real API məlumatları ilə qarışdırılmır.
- [x] Ölkə bayraqları frontend-də CDN üzərindən real bayraq şəkilləri kimi göstərilir.
- [ ] Frontend və backend dəyişiklikləri birlikdə nəzərdən keçirilir.
- [ ] Hər dəyişiklikdən sonra uyğun testlər və build yoxlamaları aparılır.
- [ ] Test edilməyən funksiya işlək kimi təqdim edilmir.
- [ ] PR təsvirində dəyişikliklər, test nəticələri, risklər və açıq məsələlər qeyd edilir.

## 1. Layihənin məqsədi və məhsul sərhədləri

- [ ] Yük sahibi ilə daşıyıcını açıq elanlar əsasında birləşdirən marketplace.
- [ ] Yük elanları və daşıma təklifləri arasında qayda əsaslı uyğunlaşdırma.
- [ ] Biznes məkanlarının kataloqu və sürücülər üçün faydalı xidmətlər.
- [ ] İctimai veb-sayt və autentifikasiya olunmuş şəxsi kabinet.
- [ ] Administrator idarəetmə paneli.
- [ ] Android və iOS üçün WebView tətbiqləri.
- [ ] Veb və mobil tətbiqlər eyni backend və DB-dən istifadə edir.
- [ ] İlkin uyğunlaşdırma ayrıca bahalı AI modeli olmadan qayda əsaslıdır.
- [ ] İnkişaf etmiş AI/LLM funksiyaları ilkin versiyanın məcburi hissəsi deyil.

## 2. İstifadəçi rolları və giriş hüquqları

### 2.1. Qeydiyyatsız ziyarətçi

- [ ] Əsas səhifəyə və platforma məlumatlarına baxa bilir.
- [ ] Açıq yük elanlarını görə bilir.
- [ ] Açıq biznes məkanlarını axtara bilir.
- [ ] Məkan ünvanını və naviqasiya keçidlərini görə bilir.
- [ ] Qeydiyyat və giriş səhifələrinə keçə bilir.
- [ ] Şəxsi/əlaqə məlumatları və məhdud funksiyalar anonim istifadəçiyə açılmır.

### 2.2. Yük sahibi

- [ ] Yük elanı yarada bilir.
- [ ] Öz elanlarını redaktə və deaktiv edə bilir.
- [ ] Öz elanlarının siyahısını və statusunu görə bilir.
- [ ] Elan üzrə uyğun daşıyıcıları görə bilir.
- [ ] Müraciətləri nəzərdən keçirə bilir.
- [ ] Müraciəti qəbul və ya rədd edə bilir.
- [ ] Təklif qiymətlərini müqayisə edə bilir.
- [ ] Profil və əlaqə məlumatlarını idarə edə bilir.
- [ ] Yük sahibi üçün elan, redaktə, müraciət cavablandırma və daşınma komissiyası ödənişsizdir.

### 2.3. Daşıyıcı / sürücü

- [ ] Şəxsi və ya şirkət profili yarada bilir.
- [ ] Nəqliyyat vasitəsi əlavə edə bilir.
- [ ] Tutum və texniki xüsusiyyətləri qeyd edə bilir.
- [ ] Marşrut və mövcud tarixləri qeyd edə bilir.
- [ ] Daşıma qiymətini və valyutasını qeyd edə bilir.
- [ ] Uyğun yük elanlarını tapa bilir.
- [ ] Aktiv abunəlik olduqda yükə müraciət göndərə bilir.
- [ ] Müraciətlərinin statusunu və tarixçəsini görə bilir.
- [ ] Biznes məkanlarını axtara və naviqasiya aça bilir.
- [ ] Aktiv abunəlik olmadan elanlara baxış mümkündür, müraciət göndərmək mümkün deyil.
- [ ] Əlaqə məlumatları və digər ödənişli funksiyalar üçün giriş qaydaları tətbiq edilib.

### 2.4. Biznes məkanı sahibi

- [ ] Biznes məkanı qeydiyyatdan keçirə bilir.
- [ ] Kateqoriya, ünvan və koordinatları daxil edə bilir.
- [ ] Əlaqə, iş saatları və xidmətləri daxil edə bilir.
- [ ] Məkan məlumatlarını yeniləyə bilir.
- [ ] Moderasiya statusunu və rədd səbəbini görə bilir.
- [ ] Ödəniş tələb olunan ölkə/tarif qaydaları tətbiq edilir.

### 2.5. Administrator

- [ ] İstifadəçiləri bloklaya və blokdan çıxara bilir.
- [ ] Şirkət və biznes məkanlarını yoxlaya bilir.
- [ ] Elan, nəqliyyat təklifi və müraciətləri moderasiya edə bilir.
- [ ] Kateqoriyalar, ölkələr və şəhərləri idarə edə bilir.
- [ ] Şikayətləri araşdıra bilir.
- [ ] Uyğunlaşdırma parametrlərini idarə edə bilir.
- [ ] Tarif, ödəniş və abunəlikləri idarə edə bilir.
- [ ] Sistem statistikası və audit jurnalına baxa bilir.
- [ ] Hər administrator əməliyyatı audit jurnalında qeydə alınır.

## 3. Qeydiyyat, autentifikasiya və hesab

- [ ] Ad və soyad, telefon, e-poçt və şifrə ilə qeydiyyat.
- [ ] İstifadə şərtləri və məxfilik siyasətinə razılıq qeydə alınır.
- [ ] Telefon və ya e-poçt təsdiqi.
- [x] Telefon/e-poçt və şifrə ilə giriş.
- [ ] Google OAuth — razılaşdırılıbsa.
- [ ] OAuth-dan sonra çatışmayan telefon/ölkə məlumatları məcburi tamamlanır.
- [ ] Şifrəni unutmuşam və təhlükəsiz bərpa prosesi.
- [x] Çıxış və aktiv sessiyanın bərpası/qorunması (Sanctum SPA axını; sessiya davamlılığı yoxlanılıb).
- [ ] Hesabın deaktivləşdirilməsi və silinməsi üçün müraciət.
- [ ] Təsdiq kodları və reset linklərinin müddət məhdudiyyəti var.
- [ ] Şifrələr yalnız təhlükəsiz hash formasında saxlanılır.
- [ ] Şirkət profili: hüquqi ad, ölkə, vergi ID/VÖEN, əlaqə şəxsi, ünvan və sənədlər.
- [ ] Şirkət təsdiqi ayrıca status və moderasiya prosesidir.
- [ ] İstifadəçi yalnız öz profilini və icazə verilmiş məlumatları dəyişə bilir.

## 4. Yük elanları modulu

### 4.1. Yük yaratma forması

- [ ] Elan başlığı və təsviri.
- [ ] Yük kateqoriyası, adı və xüsusiyyətləri.
- [ ] Fotoşəkillər və əlavə sənədlər — tətbiq olunursa.
- [ ] Yükləmə ölkəsi, şəhəri, ünvanı və tələb olunarsa koordinatları.
- [ ] Çatdırılma ölkəsi, şəhəri, ünvanı və tələb olunarsa koordinatları.
- [ ] Yükləmənin başlanğıc və son tarixi / vaxt intervalı.
- [ ] Çatdırılma üçün tələb olunan tarix — biznes qaydası təsdiqlənərsə.
- [ ] Çəki (kq).
- [ ] Həcm (m³) — məlumdursa.
- [ ] Bağlama/palet sayı — tətbiq olunarsa.
- [ ] Uzunluq, en, hündürlük — xüsusi yük üçün tələb olunarsa.
- [ ] Nəqliyyat vasitəsinin növü.
- [ ] Temperatur rejimi və soyuducu tələbi.
- [ ] Təhlükəli yük — hüquqi və texniki dəstək təsdiqlənərsə.
- [ ] Xüsusi yükləmə/boşaltma tələbləri və qeydlər.
- [ ] Qiymət, valyuta, sabit/müzakirəyə açıq statusu.
- [ ] Avans və qiymətə daxil olan xidmətlər — razılaşdırılarsa.
- [ ] Qiymətin boş qala bilməsi və qiymətin mənası biznes qərarı kimi təsdiqlənib.
- [ ] Form validasiyası frontend və backend-də tətbiq olunub.
- [ ] Qaralama kimi saxlamaq və dərc etmək mümkündür.
- [ ] Fayl yükləmələri təhlükəsizlik tələblərinə uyğundur.

### 4.2. Elan siyahısı, axtarış və idarəetmə

- [ ] Yükləmə ölkəsi/şəhəri ilə filtr.
- [ ] Çatdırılma ölkəsi/şəhəri ilə filtr.
- [ ] Yük kateqoriyası və nəqliyyat növü filtrləri.
- [ ] Minimum/maksimum çəki filtri.
- [ ] Yükləmə tarixi filtri.
- [ ] Qiymət və valyuta filtri.
- [ ] Status filtri.
- [ ] Server-side pagination.
- [x] Marketplace-də dərc olunmuş yük elanlarının siyahısı real API-dən yüklənir.
- [x] “Mənim elanlarım” siyahısı real API-yə qoşulub.
- [ ] Elan detal səhifəsi.
- [ ] Yalnız elan sahibi redaktə/deaktiv edə bilir.
- [ ] Müraciət və razılaşma olduqda kritik məlumatların dəyişməsi qorunur/təsdiqlənir.
- [ ] Elan statuslarının keçidləri səlahiyyətlə qorunur.

### 4.3. Elan statusları

- [ ] Qaralama.
- [ ] Dərc olunub.
- [ ] Müraciət var.
- [ ] Razılaşma əldə olunub.
- [ ] Daşınma davam edir.
- [ ] Tamamlanıb.
- [ ] Ləğv edilib.
- [ ] Arxivləşdirilib.
- [ ] Status keçidləri və icazələr backend-də yoxlanılır.

## 5. Nəqliyyat vasitələri və daşıma təklifləri

### 5.1. Nəqliyyat vasitəsi

- [ ] Nəqliyyat vasitəsinin adı/identifikasiyası.
- [ ] Nəqliyyat növü.
- [ ] Marka/model — tələb olunarsa.
- [ ] Daşıma qabiliyyəti (kq).
- [ ] Həcm tutumu (m³).
- [ ] Kuzov/qoşqu tipi.
- [ ] Xüsusi yük tələblərinə uyğunluq.
- [ ] Qeydiyyat ölkəsi.
- [ ] Sənədlər və fotoşəkillər — tələb olunarsa.
- [ ] Aktiv/deaktiv statusu.
- [ ] Həssas qeydiyyat nömrəsi yalnız zəruri olduqda toplanır.
- [ ] CRUD və sahiblik yoxlamaları tamamlanıb.

### 5.2. Daşıma təklifi

- [ ] Başlanğıc ölkə və şəhər.
- [ ] Son ölkə və şəhər.
- [ ] Mövcudluğun başlanğıc və bitmə tarixi.
- [ ] Əlaqəli nəqliyyat vasitəsi.
- [ ] Təklif olunan qiymət və valyuta.
- [ ] Əlavə şərtlər.
- [ ] Təklifin aktivlik statusu.
- [ ] Eyni nəqliyyat vasitəsi üçün ziddiyyətli tarixli təkliflər bloklanır.
- [ ] Müddəti bitmiş təkliflər aktiv axtarışdan çıxarılır.

### 5.3. Təklif statusları

- [ ] Qaralama.
- [ ] Aktiv.
- [ ] Müraciət göndərilib.
- [ ] Razılaşdırılıb.
- [ ] Məşğuldur.
- [ ] Tamamlanıb.
- [ ] Ləğv edilib.
- [ ] Müddəti bitib.

## 6. Uyğunlaşdırma mühərriki

- [ ] Yük elanı ilə aktiv daşıma təklifi müqayisə olunur.
- [ ] Hər uyğunluğa 0–100 bal hesablanır.
- [ ] Marşrut uyğunluğu — ilkin təklif 40 bal.
- [ ] Tarix uyğunluğu — ilkin təklif 25 bal.
- [ ] Qiymət uyğunluğu — ilkin təklif 20 bal.
- [ ] Tutum uyğunluğu — ilkin təklif 15 bal.
- [ ] Məcburi tələblər baldan ayrıca yoxlanılır.
- [ ] Tutum çatmırsa, ümumi baldan asılı olmayaraq uyğunluq rədd edilir.
- [ ] Nəqliyyat növü, temperatur və xüsusi tələblər yoxlanılır.
- [ ] Beynəlxalq marşrutlarda yalnız şəhər adlarının tam eyniliyi tələb edilmir.
- [ ] İstifadəçiyə bal və uyğunluq səbəbləri göstərilir.
- [ ] Uyğunluq balı real hesablamadan gəlir, statik/demodur deyil.
- [ ] Yeni yük dərc ediləndə uyğunluq yenilənir.
- [ ] Yeni təklif aktivləşəndə uyğunluq yenilənir.
- [ ] Marşrut, tarix, tutum və qiymət dəyişəndə yenidən hesablanır.
- [ ] Təklif deaktivləşəndə və ya müddəti bitəndə nəticə yenilənir.
- [ ] Nəticə saxlanılırsa alqoritm versiyası və səbəblər də saxlanılır.
- [ ] Marşrut/tarix/tutum/qiymət/valyuta/bitmiş təklif ssenariləri test edilir.
- [ ] Böyük həcm üçün queue/background job genişlənməsi nəzərə alınıb.
- [ ] LLM və inkişaf etmiş AI funksiyaları ayrıca gələcək mərhələdir.

## 7. Müraciət və razılaşma prosesi

- [ ] Müraciət yük elanı ilə əlaqələndirilir.
- [ ] Müraciət əlaqəli nəqliyyat təklifini göstərir.
- [ ] Müraciət edən istifadəçi, qiymət, valyuta, mesaj və tarix saxlanılır.
- [ ] Müraciət yaratmazdan əvvəl autentifikasiya yoxlanılır.
- [ ] İstifadəçinin daşıyıcı rolu/yetkisi yoxlanılır.
- [ ] Aktiv abunəlik və bitmə tarixi backend-də yoxlanılır.
- [ ] Hesabın bloklanmadığı yoxlanılır.
- [ ] Yükün aktiv olduğu və müraciətə açıq olduğu yoxlanılır.
- [ ] Eyni müraciətin təkrar göndərilməsi dublikat yaratmır.
- [ ] Eyni istifadəçinin eyni yükə təkrar müraciət qaydası müəyyənləşdirilib.
- [ ] Yük sahibi öz elanına gələn müraciətləri görə bilir.
- [ ] Yük sahibi müraciəti qəbul edə bilir.
- [ ] Yük sahibi müraciəti rədd edə bilir.
- [ ] Daşıyıcı öz müraciətini geri götürə bilir.
- [ ] Status keçidləri və səlahiyyətlər backend-də qorunur.
- [ ] Qəbul edilmiş təklif üzrə razılaşma və yük statusu sinxronlaşdırılır.
- [ ] İlkin versiyada mesaj və qiymət təklifi kifayətdir.
- [ ] WhatsApp kontakt keçidi nəzərdə tutulub.
- [ ] Platformadaxili real-time chat/voice/video MVP-yə daxil deyil.

### Müraciət statusları

- [ ] Gözləyir.
- [ ] Qəbul edilib.
- [ ] Rədd edilib.
- [ ] Geri götürülüb.
- [ ] Ləğv edilib.
- [ ] Tamamlanıb.

## 8. Abunəlik, tariflər və Birbank

### 8.1. Tariflər

- [ ] Daşıyıcı abunəliyi.
- [ ] Biznes məkanı abunəliyi — yalnız ödəniş tələb edilən hallarda.
- [ ] Tarif ölkəyə bağlanır.
- [ ] Tarif kateqoriyası, qiymət, valyuta və müddət saxlanılır.
- [ ] Aktivlik və qüvvəyə minmə tarixi idarə olunur.
- [ ] Tarif tarixçəsi qorunur.
- [ ] Tarif dəyişməsi əvvəlki ödənişlərin qiymətini dəyişmir.
- [ ] İlkin əsas müddət bir aydır.
- [ ] Ödəniş valyutası provayderin dəstəyinə uyğun yoxlanılır.
- [ ] İcazəsiz valyuta konvertasiyası edilmir.

### 8.2. Daşıyıcı abunəliyi UI və API

- [ ] Tariflər səhifəsi.
- [ ] Cari abunəlik statusu.
- [ ] Başlanğıc/bitmə və növbəti ödəniş tarixi.
- [ ] Avtomatik yenilənmə statusu.
- [ ] Abunəlik alma/yeniləmə prosesi.
- [ ] Abunəliyin ləğvi və nəticənin izahı.
- [ ] Ödəniş tarixçəsi.
- [ ] İstifadəçi yalnız öz abunəlik və ödəniş məlumatlarını görə bilir.

### 8.3. Birbank inteqrasiyası

- [ ] Birbank-ın rəsmi inteqrasiya sənədləri və merchant şərtləri əldə edilib.
- [ ] Təkrarlanan aylıq ödəniş dəstəyi təsdiqlənib.
- [ ] Təkrar ödəniş razılığı və token mexanizmi təsdiqlənib.
- [ ] Kart məlumatları platformada saxlanılmır.
- [ ] Backend ödəniş sifarişi yaradır.
- [ ] İstifadəçi Birbank checkout səhifəsinə yönləndirilir.
- [ ] Server-side callback/webhook və ya rəsmi status yoxlaması işləyir.
- [ ] Callback həqiqiliyi/imza yoxlanılır.
- [ ] Məbləğ, valyuta və tranzaksiya identifikatoru yoxlanılır.
- [ ] Təkrar callback idempotent idarə olunur.
- [ ] Uğurlu ödəniş abunəliyi yalnız bir dəfə aktivləşdirir/uzadır.
- [ ] Ödəniş uğursuzluğu və yenidən cəhd qaydası tətbiq edilir.
- [ ] Güzəşt müddəti varsa, qaydası təsdiqlənib.
- [ ] Avtomatik yenilənmə ləğv ediləndə gələcək ödənişlər dayandırılır.
- [ ] Ödənilmiş müddətin sonuna qədər xidmət qaydası tətbiq edilir.
- [ ] Ödəniş hadisələri audit jurnalında saxlanılır.
- [ ] Uğurlu, uğursuz, ləğv və refund ssenariləri test edilir.
- [ ] Avtomatik təkrar ödəniş mümkün deyilsə, bu məhdudiyyət açıq qərar kimi eskalasiya edilir; əl ilə aylıq ödəniş avtomatik yenilənmə kimi təqdim edilmir.

### 8.4. Ödəniş statusları

- [ ] Başladılıb.
- [ ] Emal olunur.
- [ ] Uğurlu.
- [ ] Uğursuz.
- [ ] Ləğv edilib.
- [ ] Geri qaytarılıb.

### 8.5. Abunəlik statusları

- [ ] Aktiv.
- [ ] Müddəti bitib.
- [ ] Ləğv edilib.
- [ ] Ödəniş gözləyir.
- [ ] Ödəniş uğursuzdur.
- [ ] Güzəşt müddətində — tətbiq olunarsa.

## 9. Biznes məkanları

### 9.1. Kateqoriyalar

- [ ] Mağaza.
- [ ] Kafe və restoran.
- [ ] Hotel və motel.
- [ ] Avtoservis.
- [ ] Təkər təmiri.
- [ ] Yanacaqdoldurma məntəqəsi.
- [ ] Elektrik avtomobili şarj məntəqəsi.
- [ ] Yük avtomobili parkinqi.
- [ ] Təhlükəsiz parkinq.
- [ ] Avtoyuma.
- [ ] Anbar və logistika mərkəzi.
- [ ] Aptek.
- [ ] Digər xidmət məkanları.
- [ ] Kateqoriyalar admin tərəfindən idarə olunur.

### 9.2. Məkan qeydiyyatı və idarəetmə

- [ ] Məkan adı və qısa təsvir.
- [ ] Kateqoriya.
- [ ] Ölkə, şəhər və tam ünvan.
- [ ] Xəritədə seçilmiş real koordinatlar.
- [ ] Telefon və veb-sayt.
- [ ] İş saatları və xidmətlər.
- [ ] Fotoşəkillər.
- [ ] Sahib/şirkət əlaqəsi.
- [ ] Tələb olunan təsdiq sənədləri.
- [ ] Ünvan əsasında təsadüfi koordinat yaradılmır.
- [ ] Məkan sahibi öz məkanını yeniləyə bilir.

### 9.3. Sürücü üçün xüsusiyyətlər və axtarış

- [ ] Yük maşınının daxil ola bilməsi.
- [ ] Yük maşını üçün parkinq.
- [ ] Təhlükəsiz/gecəlik parkinq.
- [ ] Duş və sanitar şərait.
- [ ] Yük avtomobili təmiri və təkər xidməti.
- [ ] Yanacaq və şarj xidməti.
- [ ] Ölkə/şəhər, kateqoriya, xidmət və açar söz axtarışı.
- [ ] Yük maşınına uyğunluq filtri.
- [ ] Yalnız təsdiqlənmiş məkanlar ictimai kataloqda görünür.
- [ ] Yaxınlıq axtarışı məkan icazəsi ilə işləyir.
- [ ] İcazə verilmədikdə şəhər/xəritə axtarışı mümkündür.
- [ ] Bəyan edilmiş yük maşını uyğunluğu doğrulanmış fakt kimi göstərilmir.

### 9.4. Naviqasiya və moderasiya

- [ ] Google Maps linki saxlanmış koordinatlardan yaradılır.
- [ ] Waze linki saxlanmış koordinatlardan yaradılır.
- [ ] Tətbiq varsa native app, yoxdursa brauzer açılır.
- [ ] İlkin status “Yoxlamadadır”.
- [ ] Dərc olunub / Rədd edilib / Deaktiv edilib statusları.
- [ ] Yalnız dərc olunmuş məkan ictimai görünür.
- [ ] Rədd səbəbi sahibə göstərilir.
- [ ] Biznes məkanı ödənişi ölkə və admin parametrlərinə görə işləyir.
- [ ] Ödənişsiz ölkələrdə ödəniş tələb edilmir, moderasiya isə qalır.
- [ ] Marşrut boyunca yaxın məkan tövsiyəsi gələcək versiyadır.

## 10. Bildirişlər

- [ ] Qeydiyyat və hesab təsdiqi bildirişi.
- [ ] Şifrə bərpası bildirişi.
- [ ] Yükə yeni müraciət bildirişi.
- [ ] Müraciət qəbul/rədd bildirişi.
- [ ] Uyğun daşıma təklifi bildirişi.
- [ ] Elan/təklif müddətinin bitməsi bildirişi.
- [ ] Biznes məkanının təsdiq/rədd bildirişi.
- [ ] Hesab məhdudlaşdırılması bildirişi.
- [ ] Sistem bildirişləri.
- [ ] Bildirişlər şəxsi kabinetdə saxlanılır.
- [ ] E-poçt inteqrasiyası razılaşdırılmış həcmdə işləyir.
- [ ] Mobil push bildirişləri sonrakı versiyadır, ayrıca təsdiq olmadan MVP-yə daxil edilmir.

## 11. Administrator paneli

- [ ] İstifadəçilər.
- [ ] Şirkətlər.
- [ ] Yük elanları.
- [ ] Nəqliyyat vasitələri.
- [ ] Daşıma təklifləri.
- [ ] Müraciətlər.
- [ ] Biznes məkanları.
- [ ] Kateqoriyalar.
- [ ] Ölkələr və şəhərlər.
- [ ] Abunəlik tarifləri və ölkə üzrə qiymətlər.
- [ ] Ödənişlər.
- [ ] Aktiv/bitmiş/ləğv edilmiş abunəliklər.
- [ ] Biznes məkanları üçün ödəniş tələbi.
- [ ] Bildirişlər.
- [ ] Şikayətlər.
- [ ] Uyğunlaşdırma parametrləri.
- [ ] Sistem statistikası.
- [ ] Audit jurnalı.
- [ ] Elanı gizlətmək/silmək/arxivləşdirmək.
- [ ] Şübhəli istifadəçini bloklamaq.
- [ ] Sənədləri yoxlamaq.
- [ ] Şikayəti araşdırmaq və səbəbi qeyd etmək.
- [ ] Dəyişikliklərdə admin ID, tarix, əməliyyat növü və mümkün olduqda əvvəlki/sonrakı dəyərlər saxlanılır.

## 12. UI/UX və şəxsi kabinet

- [x] Premium UI istiqaməti və mövcud dizayn sistemi qorunur.
- [ ] Əsas səhifədə təqdimat, axtarış, son elanlar və CTA-lar.
- [x] Yük elanlarının axtarışı (Marketplace siyahısı real API məlumatları ilə inteqrasiya edilib).
- [ ] Daşıyıcı təkliflərinin axtarışı.
- [ ] Biznes məkanları kataloquna keçid.
- [ ] Əlaqə, istifadə şərtləri və məxfilik siyasəti.
- [ ] Profil.
- [ ] Şirkət məlumatları.
- [x] Yük elanlarım (API inteqrasiyası tamamlanıb).
- [ ] Nəqliyyat vasitələrim.
- [ ] Daşıma təkliflərim.
- [ ] Müraciətlərim.
- [ ] Uyğun təkliflər.
- [ ] Biznes məkanlarım.
- [ ] Bildirişlər.
- [ ] Təhlükəsizlik və hesab parametrləri.
- [x] Sidebar menyu strukturu və vizual üslubu layihənin yeni premium dizaynına uyğunlaşdırılıb; bütün menyuların funksional tamamlanması ayrıca yoxlanmalıdır.
- [ ] Sidebar-dakı bütün menyular real səhifə və funksiyaya aparır.
- [ ] Placeholder və demo məlumatlar production funksionallığı kimi qalmır.
- [x] Light/Dark mode infrastrukturu tətbiq edilib; tam vizual QA ayrıca yoxlanmalıdır.
- [ ] Mobil, planşet və desktop ölçülərində responsive davranış.
- [ ] Form, xəritə, cədvəl, şəkil və menyular mobil istifadəyə yararlıdır.

## 13. Android və iOS WebView

- [ ] Android WebView tətbiqi.
- [ ] iOS WebView tətbiqi.
- [ ] Mobil veb platforma WebView daxilində açılır.
- [ ] Sessiya təhlükəsiz saxlanılır.
- [ ] Android geri düyməsi düzgün işləyir.
- [ ] Xarici linklər düzgün açılır.
- [ ] Google Maps/Waze uyğun tətbiqə yönləndirilir.
- [ ] Fayl seçimi və şəkil yükləmə işləyir.
- [ ] Şəbəkə olmadıqda anlaşılan xəta ekranı.
- [ ] Yüklənmə göstəricisi.
- [ ] Klaviatura form sahələrini örtmür.
- [ ] Status bar və safe area nəzərə alınır.
- [ ] Çıxış sessiyanı təhlükəsiz bağlayır.
- [ ] HTTPS istifadə edilir.
- [ ] Kamera/qalereya, sənəd, məkan və zəng icazələri yalnız razılıqla istənilir.
- [ ] Push bildirişləri razılaşdırılmış ayrıca inteqrasiyadır.
- [ ] Tətbiq ikonu və splash screen.
- [ ] Mağaza təsviri və ekran görüntüləri.
- [ ] Məxfilik siyasəti və istifadə şərtləri.
- [ ] Hesab silinməsi prosesi.
- [ ] Google Play və App Store yayımlama hazırlığı.
- [ ] Mağaza hesabları və ödənişləri sifarişçi tərəfindən təmin edilir (başqa razılaşma yoxdursa).
- [ ] Mağaza qəbuluna zəmanət verilmədiyi və alternativ sayt linki razılaşdırılıb.

## 14. Texniki arxitektura və API

- [x] Laravel backend vahid API mənbəyidir.
- [x] REST API versiyalaşdırılıb (`/api/v1`).
- [x] React/Vite frontend backend API-dən istifadə edir.
- [x] Sanctum SPA cookie authentication və CSRF axını işləyir.
- [ ] API resursları, validasiya və xəta formatları ardıcıldır.
- [ ] Endpoint-lər rol və sahiblik yoxlamaları ilə qorunur.
- [ ] API pagination və filtrlər server-side icra olunur.
- [ ] Ölkə və şəhər kataloqları.
- [ ] Yük kateqoriyaları.
- [ ] Nəqliyyat növləri və əlaqəli kataloqlar.
- [ ] Kateqoriya və status dəyərləri yoxlanılan sabit dəyərlərdir.
- [ ] Pul məbləği və valyuta ayrı saxlanılır.
- [ ] Çəki kq, həcm m³, koordinatlar enlik/uzunluq kimi saxlanılır.
- [ ] Tarix/saat və timezone davranışı müəyyənləşdirilib.
- [ ] Xarici açarlar və indekslər DB sxeminə uyğun yoxlanılıb.
- [ ] API sənədləri hazırlanıb və yenilənir.

## 15. Database və məlumat modeli

- [ ] `database/db.sql` aktual və repository-də mövcuddur.
- [ ] DB sxemi implementasiyadan əvvəl yoxlanılıb.
- [ ] users.
- [ ] companies.
- [ ] countries.
- [ ] cities.
- [ ] categories.
- [ ] vehicles.
- [ ] loads.
- [ ] vehicle_offers.
- [ ] matches.
- [ ] applications.
- [ ] business_categories.
- [ ] business_places.
- [ ] notifications.
- [ ] reports.
- [ ] audit_logs.
- [ ] Fayllar üçün metadata cədvəlləri — ehtiyac olduqda.
- [ ] Foreign key, indeks, unique və constraint-lər yoxlanılıb.
- [x] Yük müraciətləri ilə bağlı cədvəl/sütun ad uyğunsuzluğu aşkarlanıb və `applications` əvəzinə faktiki `application` adı istifadə edilərək API/UI xətası aradan qaldırılıb.
- [ ] Sütun adları real DB sxeminə uyğundur.
- [ ] DB dəyişiklikləri ayrıca nəzərdən keçirilir və təhlükəsiz deploy planı var.
- [ ] Seed/demo məlumatlar production məlumatları ilə qarışmır.
- [ ] Backup və restore sınaqdan keçirilib.

## 16. Təhlükəsizlik və məxfilik

- [ ] Bütün ictimai trafik HTTPS-dir.
- [ ] Şifrələr hash olunur.
- [ ] SQL injection-a qarşı ORM/parametrli sorğular.
- [ ] CSRF qorunması.
- [ ] XSS qorunması.
- [ ] Server-side authentication və authorization.
- [ ] İstifadəçi yalnız öz məlumatlarını dəyişir.
- [ ] Fayl formatı və ölçüsü yoxlanılır.
- [ ] Fayl adları təhlükəsiz yaradılır.
- [ ] İcra oluna bilən/zərərli fayllar bloklanır.
- [ ] Şəxsi sənədlər public storage-da açıq saxlanılmır.
- [ ] Login və həssas əməliyyatlarda rate limit.
- [ ] API rate limiting.
- [ ] Secret və açarlar repository-də saxlanılmır.
- [ ] İstifadəçi məlumatları icazəsiz üçüncü tərəflərə ötürülmür.
- [ ] Admin əməliyyatları audit olunur.
- [ ] Backup-lar qorunur və bərpa prosesi test edilir.
- [ ] İstifadə şərtləri.
- [ ] Məxfilik siyasəti.
- [ ] Cookie məlumatlandırması.
- [ ] Əlaqə və şikayət proseduru.
- [ ] Hesab silinməsi qaydası.
- [ ] GDPR/CCPA və digər ölkə qanunvericiliyi bazara çıxışdan əvvəl hüquqi yoxlanılır.

## 17. SEO, performans və fayllar

- [ ] Oxunaqlı URL-lər.
- [ ] Səhifə title və meta description.
- [ ] Sitemap və robots qaydaları.
- [ ] Uyğun canonical URL-lər.
- [ ] Şəxsi kabinet və şəxsi məlumat səhifələri indekslənmir.
- [ ] Şəkillər optimallaşdırılır.
- [ ] Lazımsız JavaScript azaldılır.
- [ ] DB sorğuları optimallaşdırılır.
- [ ] Böyük siyahılar pagination ilə yüklənir.
- [ ] Fayl növü və ölçü limitləri var.
- [ ] Fayl adları təhlükəsiz generasiya olunur.
- [ ] Şəxsi sənədlər qorunur.
- [ ] Faylın sahibi və əlaqəli elanı müəyyən edilir.
- [ ] İlk mərhələdə hosting storage; gələcəkdə object storage-a keçid mümkündür.

## 18. Test və keyfiyyət təminatı

### 18.1. Funksional testlər

- [ ] Qeydiyyat və giriş.
- [ ] Şifrə bərpası.
- [ ] Yük yaratmaq və redaktə etmək.
- [ ] Nəqliyyat vasitəsi əlavə etmək.
- [ ] Daşıma təklifi yaratmaq.
- [ ] Uyğunluq hesablanması.
- [ ] Müraciət göndərmək və cavablandırmaq.
- [ ] Biznes məkanı yaratmaq və moderasiya.
- [ ] Google Maps/Waze keçidləri.
- [ ] Bildirişlər.
- [ ] Rol və sahiblik hüquqları.

### 18.2. Təhlükəsizlik testləri

- [ ] Başqa istifadəçinin məlumatını dəyişmək cəhdi.
- [ ] İcazəsiz admin səhifəsinə/API-yə giriş.
- [ ] Yanlış və zərərli form məlumatları.
- [ ] Təkrar sorğu və idempotency.
- [ ] Fayl yükləmə hücumları.
- [ ] Sessiya və token idarəetməsi.
- [ ] Abunəliyi olmayan daşıyıcının müraciəti bloklanır.
- [ ] Bloklanmış hesab kritik əməliyyat edə bilmir.

### 18.3. Uyğunluq və mobil testlər

- [ ] Android WebView.
- [ ] iOS WebView.
- [ ] Müxtəlif ekran ölçüləri.
- [ ] Zəif internet.
- [ ] İnternet kəsilməsi.
- [ ] Fayl/şəkil yükləmə.
- [ ] Xarici naviqasiya.
- [ ] Login/logout sessiya davranışı.

### 18.4. Uyğunlaşdırma testləri

- [ ] Marşrut uyğun gəlir.
- [ ] Marşrut uyğun gəlmir.
- [ ] Yük çəkisi tutumu keçir.
- [ ] Tarixlər uyğun deyil.
- [ ] Nəqliyyat növü yanlışdır.
- [ ] Valyutalar fərqlidir.
- [ ] Təklifin müddəti bitib.
- [ ] Eyni yük/təklif təkrar hesablanır.

### 18.5. Hər PR üçün minimum yoxlama

- [ ] Backend testləri.
- [ ] Frontend typecheck.
- [ ] Frontend production build.
- [ ] Lint — layihədə mövcuddursa.
- [ ] Əlaqəli manual smoke test.
- [ ] Test nəticələri PR-də qeyd edilib.
- [ ] Məlum limitasiya və risklər PR-də qeyd edilib.

## 19. Təhvil veriləcək nəticələr

- [ ] İşlək veb-sayt.
- [ ] Android quraşdırıla bilən buraxılış.
- [ ] iOS buraxılışa hazır layihə və yayımlama prosesi.
- [ ] Administrator paneli.
- [ ] DB sxemi və migration faylları.
- [ ] Backend və frontend mənbə kodu.
- [ ] API sənədləri.
- [ ] Quraşdırma və deploy təlimatı.
- [ ] Əsas funksiyalar üzrə testlər.
- [ ] Administrator istifadə təlimatı.
- [ ] Backup və restore təlimatı.
- [ ] App Store / Google Play materialları.
- [ ] Git repository və versiya tarixçəsi.
- [ ] Xarici xidmətlər və açarların siyahısı (secret dəyərlərsiz).
- [ ] Məlum məhdudiyyətlər və gələcək işlər siyahısı.
- [ ] Kod, domen, hosting və mağaza hesablarının mülkiyyəti sənədləşdirilib.

## 20. Mərhələlər və icra ardıcıllığı

### Mərhələ 1 — Analiz və layihələndirmə

- [ ] Biznes qaydalarının dəqiqləşdirilməsi.
- [ ] İstifadəçi ssenariləri.
- [ ] Səhifələrin siyahısı.
- [ ] DB layihələndirməsi.
- [ ] Dizayn prototipi.
- [ ] Texniki arxitekturanın təsdiqi.
- [ ] Açıq biznes qərarları və risk reyestri.

### Mərhələ 2 — Əsas sistem

- [ ] Laravel layihə infrastrukturu.
- [ ] Database.
- [ ] Qeydiyyat və giriş.
- [ ] İstifadəçi və şirkət profilləri.
- [ ] Admin panelinin ilkin versiyası.

### Mərhələ 3 — Yük və daşıma modulları

- [ ] Yük elanları.
- [ ] Nəqliyyat vasitələri.
- [ ] Daşıma təklifləri.
- [ ] Axtarış və filtrlər.
- [ ] Müraciətlər və statuslar.

### Mərhələ 4 — Uyğunlaşdırma mühərriki

- [ ] Qayda əsaslı uyğunluq.
- [ ] Uyğunluq balları.
- [ ] Nəticələrin saxlanması.
- [ ] Təkrar hesablamalar.
- [ ] Alqoritm testləri.

### Mərhələ 5 — Biznes məkanları

- [ ] Məkan qeydiyyatı.
- [ ] Kateqoriyalar.
- [ ] Xəritə koordinatları.
- [ ] Axtarış və filtrlər.
- [ ] Moderasiya.
- [ ] Google Maps/Waze.

### Mərhələ 6 — Mobil tətbiqlər

- [ ] Android WebView.
- [ ] iOS WebView.
- [ ] Giriş sessiyası.
- [ ] Geri düyməsi və xarici linklər.
- [ ] Fayl və şəkil yükləmə.
- [ ] Məkan və bildiriş inteqrasiyaları — razılaşdırılmış həcmdə.

### Mərhələ 7 — Test və buraxılış

- [ ] Funksional və təhlükəsizlik testləri.
- [ ] Mobil cihaz testləri.
- [ ] Hostingə yerləşdirmə.
- [ ] Backup/restore yoxlaması.
- [ ] Tətbiq mağazaları üçün hazırlıq.
- [ ] Sifarişçiyə təhvil.

## 21. İlkin versiyaya daxil olmayan / ayrıca razılaşdırılan işlər

- [ ] Platformadaxili səsli və video zəng — sonrakı versiya.
- [ ] Elektron daşıma müqaviləsi və imza — sonrakı versiya.
- [ ] Marşrut optimallaşdırılması — sonrakı versiya.
- [ ] İnkişaf etmiş ML/LLM — sonrakı versiya.
- [ ] Avtomatik sənəd tanıma — sonrakı versiya.
- [ ] Beynəlxalq gömrük inteqrasiyası — sonrakı versiya.
- [ ] Mühasibat/ERP inteqrasiyası — sonrakı versiya.
- [ ] Sürücü reytinqi və tam mübahisə idarəetməsi — sonrakı versiya.
- [ ] Mobil push bildirişləri — ayrıca təsdiqlənmiş mərhələ.

## 22. Açıq biznes qərarları — implementasiyadan əvvəl bağlanmalıdır

- [ ] Yük elanında qiymət məcburidirmi, yoxsa boş qala bilər?
- [ ] Yük sahibinin qiyməti büdcədir, yoxsa daşıyıcının yekun qiymət təklifidir?
- [ ] Avans ödənişi və qiymətə daxil xidmətlər necə göstərilir?
- [ ] Eyni daşıyıcının eyni yükə təkrar müraciət qaydası nədir?
- [ ] Müraciət gəldikdən sonra hansı yük sahələri dəyişdirilə bilər?
- [ ] Razılaşma hansı əməliyyatla hüquqi/əməli status alır?
- [ ] Birbank recurring payment/token funksiyasını bu merchant hesabı dəstəkləyirmi?
- [ ] Birbank dəstəkləmirsə, əl ilə aylıq ödənişə keçid qəbul edilirmi?
- [ ] Abunəlik üçün güzəşt müddəti varmı?
- [ ] Uğursuz ödənişlər üçün retry cədvəli nədir?
- [ ] Biznes məkanı ödənişi hansı ölkələrdə və hansı qiymətlə tətbiq edilir?
- [ ] Valyuta dəstəyi və konvertasiya siyasəti nədir?
- [ ] Şirkət təsdiqi üçün hansı sənədlər tələb olunur?
- [ ] Təhlükəli yüklər ilkin versiyada dəstəklənəcəkmi?
- [ ] SMS/e-poçt provayderi və büdcəsi hansıdır?
- [ ] Mobil push bildirişləri hansı versiyada daxil ediləcək?
- [ ] Hüquqi sənədlər və beynəlxalq bazar uyğunluğu kim tərəfindən təsdiqlənəcək?

## 23. Qəbul meyarları — buraxılış qapısı

- [ ] İstifadəçi qeydiyyatdan keçə və daxil ola bilir.
- [ ] Yük sahibi yük yarada və idarə edə bilir.
- [ ] Daşıyıcı nəqliyyat vasitəsi və təklif yarada bilir.
- [ ] Elanlar axtarılır və filtrlənir.
- [ ] Uyğunluq real hesablanır, bal və səbəblər göstərilir.
- [ ] Müraciət göndərilir və cavablandırılır.
- [ ] Abunəlik qaydası backend-də qorunur.
- [ ] Biznes məkanı moderasiyadan sonra dərc olunur.
- [ ] Google Maps/Waze keçidləri işləyir.
- [ ] Admin əsas məlumatları idarə edir.
- [ ] Sayt mobil ekranlarda işləyir.
- [ ] Android/iOS WebView əsas ssenariləri işləyir.
- [ ] İcazəsiz istifadəçi başqasının şəxsi məlumatına müdaxilə edə bilmir.
- [ ] Əsas testlər uğurludur.
- [ ] Mənbə kodu və quraşdırma sənədləri təhvil verilib.

---

## Cari icra qeydi

> Bu checklist layihə söhbətlərində təsdiqlənmiş nəticələrə əsasən qismən yenilənib. `[x]` işarəsi yalnız konkret tamamlanmış işi göstərir; modulun bütövlükdə hazır olması demək deyil. Light/Dark mode, sidebar və API inteqrasiyaları üçün tam vizual/funksional QA ayrıca aparılmalıdır.
>
> **DB qeydi:** yoxlama zamanı GitHub `main` branch-ində `database/db.sql` faylı tapılmadı. DB sxemi üzrə yeni işə başlamazdan əvvəl aktual sxem faylı repository-də təsdiqlənməlidir. Layihə söhbətində `application` / `applications` ad uyğunsuzluğu düzəldildiyi təsdiqlənib.

## 24. İş jurnalının şablonu

Hər yeni tapşırıq üçün aşağıdakı bloku doldur:

### Tapşırıq: `[Qısa ad]`

- [ ] Tələbin analizi və qəbul meyarları.
- [ ] Cari kod və DB sxeminin yoxlanılması.
- [ ] Backend implementasiyası.
- [ ] Frontend implementasiyası.
- [ ] Testlər və build.
- [ ] Manual yoxlama.
- [ ] Commit və PR.
- [ ] PR review və düzəlişlər.
- [ ] İstifadəçi təsdiqi.
- [ ] Merge — yalnız istifadəçinin açıq icazəsi ilə.

**Branch:** `feature/...`  
**PR:** `#...`  
**Test nəticəsi:** `...`  
**Qalıq iş / risk:** `...`  
**Qəbul tarixi:** `...`

> Bir tapşırıq yalnız onun bütün alt işləri və qəbul meyarları yoxlanıldıqdan sonra `[x]` edilir. PR açılması və ya kodun yazılması avtomatik olaraq tamamlanma demək deyil.