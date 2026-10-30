TEXNİKİ TAPŞIRIQ
Yükdaşıma, logistika və biznes məkanları üçün vahid
rəqəmsal platforma
Sənədin növü: İlkin texniki tapşırıq (Technical Specification)
Layihənin adı: FİKİRLƏŞİRİK
Platformalar: Veb-sayt, Android tətbiqi, iOS tətbiqi
Mobil tətbiqlərin texnologiyası: Veb-saytın WebView vasitəsilə açılması
Əsas bazar: Azərbaycan və beynəlxalq yükdaşıma bazarı
Əsas məqsəd: Yük sifarişçiləri ilə daşıyıcıları bir platformada birləşdirmək, onların
uyğunluğunu avtomatik müəyyənləşdirmək və sürücülərə marşrut boyunca faydalı biznes
məkanlarını tapmaq imkanı yaratmaq.
1. Layihənin məqsədi və ümumi təsviri
Layihə yükdaşıma xidmətləri üçün açıq elanlar əsasında işləyən rəqəmsal marketplace
platformasının hazırlanmasını nəzərdə tutur.
Platformada yük göndərmək istəyən şəxslər və şirkətlər yük elanları yerləşdirə biləcəklər.
Yükdaşıyan şirkətlər və sürücülər isə öz nəqliyyat vasitələrini, daşıma imkanlarını və uyğun
marşrutlarını qeyd edə biləcəklər.
Sistem elanları avtomatik təhlil edərək uyğun yük və nəqliyyat təkliflərini müəyyənləşdirəcək.
Uyğunluq ilkin mərhələdə qayda əsaslı alqoritmlə hesablanacaq. Gələcəkdə sistemin daha inkişaf
etmiş süni intellekt imkanları ilə genişləndirilməsi mümkün olmalıdır.
Bundan əlavə, platformada mağaza, kafe, restoran, hotel, avtoservis, yanacaqdoldurma
məntəqəsi, parkinq və digər biznes məkanları qeydiyyatdan keçə biləcəklər. Sürücülər bu
məkanları axtara və Google Maps və ya Waze vasitəsilə həmin yerlərə naviqasiyanı aça
biləcəklər.
Platforma aşağıdakı hissələrdən ibarət olacaq:
1. İctimai veb-sayt.
2. Qeydiyyatdan keçmiş istifadəçilər üçün şəxsi kabinet.
3. Yük elanları və nəqliyyat təklifləri sistemi.
4. Avtomatik uyğunlaşdırma sistemi.
5. Biznes məkanlarının kataloqu.
6. Administrator idarəetmə paneli.
7. Android tətbiqi.
8. iOS tətbiqi.
9. Bildiriş və sistem təhlükəsizliyi infrastrukturu.
Veb-sayt və mobil tətbiqlər eyni backend və eyni verilənlər bazası ilə işləməlidir. İstifadəçinin
saytda etdiyi dəyişiklik mobil tətbiqdə də görünməlidir və əksinə.
2. Biznes modeli və ödəniş prinsipləri
Platformada üç əsas istifadəçi kateqoriyası üçün fərqli ödəniş qaydaları tətbiq edilməlidir.
2.1. Daşıyıcılar
Daşıyıcıların yük elanlarına müraciət göndərə bilməsi üçün aktiv aylıq abunəliyi olmalıdır.
Abunəliyi olmayan daşıyıcı:
• Yük elanlarının siyahısına baxa bilər.
• Yük haqqında icazə verilmiş məlumatları görə bilər.
• Yükün başlanğıc və son istiqamətini, çəkisini, tarixini və digər açıq məlumatları nəzərdən
keçirə bilər.
• Uyğun yük elanlarını görə bilər.
• Lakin yük sahibinə müraciət göndərə bilməz.
• Abunəlik tələb edən əlaqə məlumatlarına və funksiyalara yalnız müvafiq qaydalar
çərçivəsində çıxış əldə edə bilər.
Aktiv abunəliyi olan daşıyıcı:
• Yük elanlarına müraciət göndərə bilər.
• Təklif olunan qiyməti və əlavə şərtləri qeyd edə bilər.
• Müraciətlərinin statusunu izləyə bilər.
• Müraciət tarixçəsinə baxa bilər.
• Abunəlik müddətində platformanın daşıyıcılar üçün nəzərdə tutulmuş ödənişli
funksiyalarından istifadə edə bilər.
Abunəlik ödənişi yükə görə deyil, aylıq xidmət haqqı kimi tutulmalıdır. Platformanın gələcəkdə
əlavə ödənişli xidmətləri olarsa, onlar ayrıca qaydalarla müəyyənləşdirilməlidir.
2.2. Yük sahibləri
Yük sahibləri üçün platformadan istifadə ödənişsiz olmalıdır.
• Yük elanı yaratmaq üçün ödəniş tələb olunmamalıdır.
• Elanları redaktə etmək və idarə etmək ödənişsiz olmalıdır.
• Daşıyıcı müraciətlərini qəbul etmək və ya rədd etmək üçün ödəniş tələb olunmamalıdır.
• Platforma yük sahibindən daşıma əməliyyatına görə komissiya tutmamalıdır.
Bu qaydalar administrator panelindən təsadüfən dəyişdirilə bilən ümumi tarif parametrləri ilə
qarışdırılmamalıdır. Yük sahibləri üçün ödənişsizlik sistemin əsas biznes qaydası kimi tətbiq
olunmalıdır.
2.3. Biznes məkanları
Biznes məkanının qeydiyyatı və platformada yerləşdirilməsi ödənişli və ya ödənişsiz ola bilər.
Bu qayda administrator panelindən idarə edilməlidir.
Administrator aşağıdakı imkanlara malik olmalıdır:
• Biznes məkanları üçün ödəniş tələbini aktivləşdirmək və ya deaktivləşdirmək.
• Ödəniş tələb olunan ölkəni seçmək.
• Ödəniş məbləğini müəyyənləşdirmək.
• Abunəlik müddətini və tarif qaydalarını müəyyənləşdirmək.
• Məkanın ödənişsiz qeydiyyatına icazə vermək.
• Ödənişli məkanların abunəlik statusunu izləmək.
Ödəniş tələb olunmayan ölkədə biznes məkanı sahibi əlavə ödəniş etmədən qeydiyyatdan keçə
bilməlidir. Bununla belə, məkanın moderasiyadan keçməsi və dərc edilməsi tələbi qüvvədə
qalmalıdır.
2.4. Ölkələr üzrə tariflər
Bütün abunəlik qiymətləri administrator panelindən ölkələr üzrə təyin edilməlidir.
Tariflərin hər biri ən azı aşağıdakı məlumatları əhatə etməlidir:
• Ölkə.
• Abunəlik növü.
• Aylıq qiymət.
• Valyuta.
• Abunəliyin müddəti.
• Aktivlik statusu.
• Tarifin qüvvəyə minmə tarixi.
• Tarifin yaradılma və dəyişdirilmə tarixi.
İlkin mərhələdə əsas abunəlik müddəti bir ay olmalıdır.
Sistem müxtəlif ölkələr üçün fərqli qiymətlər saxlamağı dəstəkləməlidir. Məsələn, Azərbaycanda
daşıyıcı üçün bir aylıq qiymət ilə başqa ölkədəki daşıyıcı üçün qiymət fərqli ola bilər.
Valyuta və ödənişin hansı valyutada aparılması ayrıca müəyyənləşdirilməlidir. Birbank
inteqrasiyası seçilmiş valyutanı dəstəkləmirsə, istifadəçiyə ödənişdən əvvəl aydın məlumat
verilməli və icazəsiz konvertasiya aparılmamalıdır. Əks halda istifadəçi təcrübəsini
yaxşılaşdırmaq və qorumaq məqsədi ilə konvertasiya xərci daşıyıcıya şamil olunmamalıdır.
3. İstifadəçi növləri və səlahiyyətləri
3.1. Qeydiyyatsız ziyarətçi
İmkanlar:
• Əsas səhifəyə baxmaq.
• Platforma haqqında məlumat almaq.
• Açıq elanları nəzərdən keçirmək.
• Açıq biznes məkanlarını axtarmaq.
• Biznes məkanının ünvanını görmək.
• Naviqasiya linkini açmaq.
• Qeydiyyat və giriş səhifələrinə keçmək.
Şəxsi məlumatlar, əlaqə məlumatları və məhdudlaşdırılmış funksiyalar anonim istifadəçilərə
açılmamalıdır.
3.2. Yük sahibi
İmkanlar:
• Yük elanı yaratmaq.
• Elanı redaktə etmək və deaktivləşdirmək.
• Elanlarının siyahısına baxmaq.
• Elan üzrə uyğun daşıyıcıları görmək.
• Daşıyıcı müraciətlərini nəzərdən keçirmək.
• Müraciəti qəbul və ya rədd etmək.
• Təklif olunan qiymətləri müqayisə etmək.
• Elanın statusunu izləmək.
• Öz hesab və əlaqə məlumatlarını idarə etmək.
3.3. Daşıyıcı və ya sürücü
İmkanlar:
• Şəxsi və ya şirkət profilini yaratmaq.
• Nəqliyyat vasitəsi əlavə etmək.
• Nəqliyyat vasitəsinin tutumunu və xüsusiyyətlərini qeyd etmək.
• Daşıma marşrutu və mövcud tarixləri göstərmək.
• Daşıma qiymətini qeyd etmək.
• Uyğun yük elanlarını tapmaq.
• Yük elanına müraciət göndərmək.
• Öz müraciətlərini izləmək.
• Biznes məkanlarını axtarmaq.
• Google Maps və ya Waze ilə naviqasiya açmaq.
3.4. Biznes məkanının sahibi
İmkanlar:
• Biznes məkanını qeydiyyata almaq.
• Məkanın kateqoriyasını seçmək.
• Ünvanı və xəritə koordinatlarını göstərmək.
• Əlaqə məlumatlarını daxil etmək.
• İş saatlarını və xidmətləri qeyd etmək.
• Mövcud məkan məlumatlarını yeniləmək.
• Moderasiya statusunu izləmək.
• Məkanın təsdiq və ya rədd edilmə səbəbini görmək.
3.5. Administrator
İmkanlar:
• İstifadəçiləri idarə etmək.
• İstifadəçiləri bloklamaq və blokdan çıxarmaq.
• Şirkət və biznes məkanlarını yoxlamaq.
• Yük elanlarını və nəqliyyat təkliflərini moderasiya etmək.
• Kateqoriyaları idarə etmək.
• Ölkə və şəhər məlumatlarını idarə etmək.
• Şikayətləri nəzərdən keçirmək.
• Uyğunlaşdırma alqoritminin parametrlərini dəyişmək.
• Sistem statistikalarına baxmaq.
• Sistem jurnallarını və administrator əməliyyatlarını izləmək.
Administrator əməliyyatları audit jurnalında saxlanılmalıdır.
4. Qeydiyyat və autentifikasiya
4.1. Qeydiyyat
İstifadəçi aşağıdakı məlumatlarla qeydiyyatdan keçə bilməlidir:
• Ad və soyad.
• Telefon nömrəsi.
• E-poçt ünvanı.
• Şifrə.
• Şifrə təsdiqi.
• İstifadə şərtləri və məxfilik siyasəti ilə razılıq.
Telefon və ya e-poçtun təsdiqlənməsi üçün uyğun mexanizm tətbiq edilməlidir. SMS təsdiqi
seçilərsə, SMS provayderi və göndərmə xərcləri ayrıca müəyyənləşdirilməlidir.
Dəgər daxil olma metodu kimi Google Oauth (Google hesabı ilə giriş) istifadə edə bilər. Bu
zaman platforma ondan məlumatların götürülməsi icazəsinin təsdiqini alır və götürə bildiyi
məlumatları götürür. Çatışmayan məlumat (Telefon nömrəsi, ölkə və s.) olarsa bunu əl ilə daxil
edilməsini məcburi hala salır.
4.2. Giriş və hesabın bərpası
Sistem aşağıdakı funksiyaları təmin etməlidir:
• Telefon və ya e-poçtla giriş.
• Şifrə ilə giriş.
• Şifrəni unutmuşam funksiyası.
• Şifrənin təhlükəsiz bərpası.
• Çıxış.
• Aktiv sessiyaların idarə edilməsi.
• Hesabın deaktivləşdirilməsi və silinməsi üçün müraciət.
Şifrələr açıq mətn şəklində saxlanılmamalıdır. Şifrə sıfırlama bağlantıları və təsdiq kodları vaxt
məhdudiyyətinə malik olmalıdır.
4.3. Şirkət profili
Şirkət adından fəaliyyət göstərən istifadəçilər üçün əlavə məlumatlar daxil edilə bilməlidir:
• Hüquqi şirkət adı.
• Qeydiyyat ölkəsi.
• VÖEN və ya müvafiq ölkənin vergi identifikatoru.
• Əlaqə şəxsi.
• Telefon və e-poçt.
• Şirkətin ünvanı.
• Tələb olunduğu halda sənədlər.
Şirkət məlumatlarının daxil edilməsi onun avtomatik təsdiqlənməsi demək deyil. Yoxlama və
təsdiq statusu ayrıca idarə olunmalıdır.
5. Yük elanları modulu
Bu modul platformanın əsas hissələrindən biridir.
5.1. Yük elanı yaratmaq
İstifadəçi yük elanı formunda aşağıdakı məlumatları daxil etməlidir:
A. Əsas məlumatlar
• Elanın başlığı.
• Yükün təsviri.
• Yükün kateqoriyası.
• Yükün adı və xüsusiyyətləri.
• Yükün fotoşəkilləri və əlavə sənədlər — tətbiq olunarsa.
B. Yükləmə və çatdırılma
• Yükləmə ölkəsi.
• Yükləmə şəhəri və ünvanı.
• Yükləmə koordinatları — tələb olunduqda.
• Çatdırılma ölkəsi.
• Çatdırılma şəhəri və ünvanı.
• Çatdırılma koordinatları — tələb olunduqda.
• Yükləmənin başlanma tarixi.
• Yükləmənin son tarixi və ya uyğun vaxt intervalı.
• Çatdırılma üçün tələb olunan tarix — biznes qaydası ilə müəyyənləşdirildikdə.
C. Yükün ölçüləri
• Çəki, kiloqramla.
• Həcm, kubmetrlə — məlumdursa.
• Bağlama və ya palet sayı — tətbiq olunarsa.
• Uzunluq, en və hündürlük — xüsusi yüklər üçün tələb olunduqda.
D. Daşıma tələbləri
• Tələb olunan nəqliyyat vasitəsinin növü.
• Temperatur rejimi — tələb olunarsa.
• Soyuduculu nəqliyyat tələbi.
• Təhlükəli yük statusu — hüquqi tələblərə uyğun dəstəklənəcəksə.
• Xüsusi yükləmə və boşaltma tələbləri.
• Əlavə qeydlər.
E. Qiymət
• Təklif olunan və ya nəzərdə tutulan qiymət.
• Valyuta.
• Qiymətin sabit və ya müzakirəyə açıq olması.
• Qiymətə daxil olan xidmətlər — tələb olunarsa.
• Avans ödənişi və şərtləri.
Qiymət sahəsi boş buraxıla bilərmi, qiymət yük sahibi tərəfindən büdcə kimi, yoxsa daşıyıcı
tərəfindən yekun xidmət qiyməti kimi göstərilir — bu qaydalar biznes tərəfi ilə
dəqiqləşdirilməlidir.
5.2. Yük elanının statusları
Tövsiyə olunan statuslar:
• Qaralama: Elan tamamlanmayıb və ya hələ dərc edilməyib.
• Dərc olunub: Elan axtarışda görünür.
• Müraciət var: Elana ən azı bir müraciət daxil olub.
• Razılaşma əldə olunub: Tərəflər uyğun təklifi qəbul ediblər.
• Daşınma davam edir: Daşıma başlanıb.
• Tamamlanıb: Daşıma başa çatıb.
• Ləğv edilib: Elan ləğv olunub.
• Arxivləşdirilib: Elan aktiv siyahıdan çıxarılıb.
Statuslar yalnız icazəsi olan istifadəçi və ya müəyyən edilmiş sistem qaydası ilə
dəyişdirilməlidir.
5.3. Elanların siyahısı və axtarış
İstifadəçi aşağıdakı meyarlarla axtarış edə bilməlidir:
• Yükləmə ölkəsi və şəhəri.
• Çatdırılma ölkəsi və şəhəri.
• Yük kateqoriyası.
• Nəqliyyat vasitəsinin növü.
• Minimum və maksimum çəki.
• Yükləmə tarixi.
• Qiymət və valyuta.
• Elanın statusu.
Axtarış nəticələri səhifələrə bölünməlidir. Çox sayda elan olduqda bütün nəticələr bir sorğuda
yüklənməməlidir.
5.4. Elanın redaktəsi və silinməsi
Elanın sahibi öz elanını redaktə edə və deaktivləşdirə bilməlidir. Başqa istifadəçinin elanını
dəyişmək mümkün olmamalıdır.
Elana artıq müraciət daxil olubsa və ya tərəflər razılaşıblarsa, kritik məlumatların dəyişdirilməsi
üçün əlavə təsdiq tələb oluna bilər. Bu qayda layihələndirmə zamanı dəqiqləşdirilməlidir.
6. Nəqliyyat vasitələri və daşıma təklifləri
modulu
6.1. Nəqliyyat vasitəsi əlavə etmək
Daşıyıcı aşağıdakı məlumatları daxil edə bilməlidir:
• Nəqliyyat vasitəsinin adı və ya identifikasiyası.
• Nəqliyyat növü.
• Marka və model — tələb olunarsa.
• Daşıma qabiliyyəti, kiloqramla.
• Həcm tutumu, kubmetrlə.
• Kuzov və ya qoşqu tipi.
• Yükün xüsusi tələblərinə uyğunluq.
• Qeydiyyat ölkəsi.
• Sənədlər və fotoşəkillər — tələb olunarsa.
• Aktivlik statusu.
Nəqliyyat vasitəsinin qeydiyyat nömrəsi kimi həssas məlumatlar yalnız həqiqətən zəruri olduqda
toplanmalıdır.
6.2. Daşıma təklifi yaratmaq
Daşıyıcı nəqliyyat vasitəsinin mövcud olduğu marşrutu və vaxtı qeyd edə bilməlidir:
• Başlanğıc ölkəsi və şəhəri.
• Son ölkə və şəhər.
• Mövcudluğun başlanğıc tarixi.
• Mövcudluğun bitmə tarixi.
• Nəqliyyat vasitəsi.
• Təklif olunan qiymət.
• Valyuta.
• Əlavə şərtlər.
• Təklifin aktivlik statusu.
Sistem bir nəqliyyat vasitəsi üçün birdən çox marşrut təklifini dəstəkləyə bilər. Eyni vasitənin
eyni vaxtda ziddiyyətli sifarişlərə ayrılmasının qarşısı alınmalıdır.
6.3. Daşıma təkliflərinin statusları
• Qaralama.
• Aktiv.
• Müraciət göndərilib.
• Razılaşdırılıb.
• Məşğuldur.
• Tamamlanıb.
• Ləğv edilib.
• Müddəti bitib.
Vaxtı bitmiş təkliflər avtomatik olaraq aktiv axtarış nəticələrindən çıxarılmalıdır.
7. Süni intellekt və avtomatik uyğunlaşdırma
sistemi
Bu modul layihənin əsas fərqləndirici xüsusiyyətidir.
İlk versiyada ayrıca bahalı AI modelindən istifadə etmək məcburi deyil. Sistem əvvəlcədən
müəyyən edilmiş qaydalar və bal hesablama mexanizmi əsasında işləməlidir. Gələcəkdə maşın
öyrənməsi (LLM) və digər AI xidmətlərinin əlavə edilməsinə imkan verən struktur
saxlanılmalıdır.
7.1. Uyğunlaşdırmanın məqsədi
Sistem aşağıdakı iki obyekt arasında uyğunluq müəyyənləşdirməlidir:
• Yük elanı.
• Daşıyıcının aktiv nəqliyyat təklifi.
Hər uyğunluğa 0–100 arası bal verilməli və uyğunluğun səbəbləri göstərilməlidir.
7.2. Uyğunluq meyarları
İlkin alqoritm aşağıdakı meyarları nəzərə almalıdır:
1. Marşrut uyğunluğu: Başlanğıc və son nöqtələrin uyğunluğu.
2. Tarix uyğunluğu: Yükləmə tarixinin daşıyıcının mövcud olduğu tarixlə uyğunluğu.
3. Tutum uyğunluğu: Nəqliyyat vasitəsinin yükü daşımaq üçün kifayət qədər çəki və həcm
tutumuna malik olması.
4. Nəqliyyat növü: Yük üçün tələb olunan vasitə ilə təklif olunan vasitənin uyğunluğu.
5. Qiymət uyğunluğu: Yük sahibinin büdcəsi ilə daşıyıcının qiymətinin uyğunluğu.
6. Xüsusi tələblər: Soyuduculu nəqliyyat, xüsusi kuzov və digər məcburi tələblər.
7. Təklifin etibarlılığı: Təklifin aktiv olması və tarixinin bitməməsi.
7.3. İlkin bal modeli
İlkin mərhələdə sınaq üçün aşağıdakı çəki bölgüsü təklif olunur:
• Marşrut uyğunluğu — 40 bal.
• Tarix uyğunluğu — 25 bal.
• Qiymət uyğunluğu — 20 bal.
• Tutum uyğunluğu — 15 bal.
Bu bölgü ilkin konfiqurasiyadır və real test nəticələrinə əsasən dəyişdirilə bilməlidir.
Məcburi tələblər ayrıca yoxlanılmalıdır. Məsələn, nəqliyyat vasitəsinin yükün çəkisini daşımaq
imkanı yoxdursa, ümumi bal yüksək olsa belə, təklif uyğun kimi göstərilməməlidir.
Beynəlxalq daşımalar üçün yalnız başlanğıc və son şəhərlərin tam eyni olmasını tələb edən sərt
qayda tətbiq edilməməlidir. Marşrutun uyğunluğu sonradan marşrut xətti və yol üzrə kənarlaşma
hesablaması ilə genişləndirilə bilər.
7.4. İstifadəçiyə göstəriləcək nəticə
Uyğun təkliflərin siyahısında aşağıdakılar göstərilməlidir:
• Daşıyıcının adı və təsdiq statusu.
• Nəqliyyat vasitəsinin növü.
• Başlanğıc və son nöqtələr.
• Mövcud tarix.
• Təklif qiyməti və valyuta.
• Uyğunluq balı.
• Uyğunluğun səbəbləri.
• Təklifə baxmaq və müraciət göndərmək düyməsi.
Məsələn:
“92% uyğunluq — marşrut və tarix uyğundur, nəqliyyat vasitəsinin tutumu kifayətdir.”
Bu rəqəm real alqoritmin nəticəsi olmalıdır. İstifadəçini yanıltmamaq üçün balın necə
hesablandığı daxili sənədləşdirilməlidir.
7.5. Uyğunlaşdırmanın işə salınması
Uyğunlaşdırma aşağıdakı hallarda yenilənməlidir:
• Yeni yük elanı dərc olunanda.
• Yeni nəqliyyat təklifi yaradılıb aktivləşdiriləndə.
• Marşrut, tarix, tutum və ya qiymət dəyişdiriləndə.
• Təklif deaktivləşdiriləndə və ya müddəti bitəndə.
Nəticələr verilənlər bazasında saxlanıla bilər. Alqoritmin versiyası və uyğunluq səbəbləri qeydə
alınmalıdır.
İlkin hostingdə sadə uyğunlaşdırma sinxron və ya məhdud həcmdə işləyə bilər. Məlumatların
sayı artdıqda növbə sistemi və arxa plan tapşırıqları tətbiq edilməlidir.
7.6. Gələcək AI imkanları
Gələcək versiyalarda aşağıdakılar əlavə oluna bilər:
• Yük elanının mətnindən kateqoriyanın avtomatik müəyyənləşdirilməsi.
• Marşrut üzrə qismən uyğunluğun hesablanması.
• Boş qayıdan nəqliyyat vasitələri üçün yük təklifləri.
• Daşıyıcı etibarlılığının statistik qiymətləndirilməsi.
• Qiymət tövsiyələri.
• İstifadəçi davranışına əsaslanan fərdiləşdirilmiş nəticələr.
Bunlar ilk versiyanın məcburi tələbi deyil, gələcək inkişaf imkanlarıdır.
8. Yük sahibi və daşıyıcı arasında müraciət
və razılaşma
8.1. Müraciət yaratmaq
İstifadəçi uyğun yük və ya daşıma təklifinə müraciət göndərə bilməlidir.
Müraciət aşağıdakı məlumatları əhatə etməlidir:
• Əlaqəli yük elanı.
• Əlaqəli nəqliyyat təklifi.
• Müraciət edən istifadəçi.
• Təklif olunan qiymət.
• Valyuta.
• Qısa mesaj.
• Yaradılma tarixi.
• Müraciətin statusu.
8.2. Müraciətin statusları
• Gözləyir.
• Qəbul edilib.
• Rədd edilib.
• Geri götürülüb.
• Ləğv edilib.
• Tamamlanıb.
Eyni istifadəçinin eyni yükə təkrar müraciət etməsi üçün qaydalar müəyyənləşdirilməlidir.
Sistem eyni müraciətin təkrar göndərilməsi nəticəsində dublikat qeydlər yaratmamalıdır.
8.3. Tərəflərin əlaqəsi
İlkin versiyada müraciət mesajı və təklif qiyməti kifayət qədər sadə əlaqə mexanizmi təmin edir.
Platformadaxili real vaxt çat, fayl mübadiləsi, səsli zəng və ya videozəng ayrıca funksiya kimi
planlaşdırılmalıdır. Bunlar bu texniki tapşırıqda məcburi MVP funksiyası hesab edilmir.
İlkin mərhələdə Whatsapp əlaqə düyməsi ilə kontakt yaratmaq imkanı nəzərdə tutulur.
9. Aylıq abunəlik və Birbank ödəniş modulu
Bu modul daşıyıcıların abunəlik ödənişlərini və ödəniş tələb olunan biznes məkanlarının
abunəliklərini idarə etməlidir.
9.1. Abunəlik planları
Sistem ən azı aşağıdakı abunəlik kateqoriyalarını dəstəkləməlidir:
1. Daşıyıcı abunəliyi.
2. Biznes məkanı abunəliyi — yalnız ödəniş tələb edilən hallarda.
Hər abunəlik planı ölkəyə görə müəyyənləşdirilməlidir.
Planın məlumatları:
• Abunəlik kateqoriyası.
• Ölkə.
• Qiymət.
• Valyuta.
• Müddət.
• Aktivlik statusu.
• Qüvvəyə minmə tarixi.
• Planın yaradılma və dəyişdirilmə tarixi.
İlk versiyada aylıq abunəlik əsas model olmalıdır. Gələcəkdə başqa müddətlər əlavə edilə bilər.
9.2. Administrator panelində tariflərin idarə edilməsi
Administrator aşağıdakı əməliyyatları edə bilməlidir:
• Yeni tarif yaratmaq.
• Tarifin qiymətini dəyişmək.
• Tarifin valyutasını seçmək.
• Tarifi konkret ölkəyə bağlamaq.
• Tarifi aktivləşdirmək və deaktivləşdirmək.
• Yeni abunəliklər üçün qüvvəyə minmə tarixini müəyyən etmək.
• Daşıyıcı abunəliyini idarə etmək.
• Biznes məkanları üçün ödəniş tələbini aktivləşdirmək və ya söndürmək.
• Ödəniş tələbini ölkələr üzrə fərqləndirmək.
• Ödəniş tarixçəsinə baxmaq.
• Aktiv, vaxtı bitmiş və ləğv edilmiş abunəlikləri görmək.
Tarif dəyişdirildikdə əvvəlki ödənişlərin tarixi məlumatları dəyişdirilməməlidir. Hər ödəniş
zamanı tətbiq edilmiş qiymət və valyuta ayrıca saxlanılmalıdır.
9.3. Birbank ödəniş prosesi
Ödəniş Birbank-ın təqdim etdiyi üçüncü tərəf ödəniş səhifəsi vasitəsilə həyata keçirilməlidir.
Ödəniş prosesi aşağıdakı kimi olmalıdır:
1. Daşıyıcı şəxsi kabinetdə abunəlik bölməsini açır.
2. Sistem istifadəçinin ölkəsinə uyğun aktiv tarifi müəyyənləşdirir.
3. İstifadəçiyə qiymət, valyuta və abunəlik müddəti göstərilir.
4. İstifadəçi abunəliyi almaq və ya yeniləmək istəyini təsdiqləyir.
5. Backend ödəniş üçün Birbank inteqrasiyasına müraciət edir.
6. İstifadəçi Birbank-ın təhlükəsiz ödəniş səhifəsinə yönləndirilir.
7. İstifadəçi ödənişi tamamlayır.
8. Birbank-dan gələn server bildirişi və ya rəsmi təsdiqləmə mexanizmi vasitəsilə ödənişin
nəticəsi yoxlanılır.
9. Ödəniş uğurlu olduqda sistem abunəliyi aktivləşdirir və ya uzadır.
10. İstifadəçiyə nəticə göstərilir və ödəniş tarixçəsində qeyd yaradılır.
İstifadəçinin ödəniş səhifəsindən sayta qayıtması təkbaşına ödənişin uğurlu olması üçün kifayət
sayılmamalıdır. Ödəniş backend tərəfindən Birbank-ın etibarlı təsdiqləmə mexanizmi ilə
yoxlanılmalıdır.
9.4. Avtomatik aylıq yenilənmə
Abunəlik modeli aylıq avtomatik yenilənmə əsasında qurulmalıdır.
Lakin avtomatik yenilənmə üçün Birbank inteqrasiyasının təkrarlanan ödənişləri dəstəkləməsi
vacibdir. Birbank-ın sadəcə ödəniş səhifəsinə yönləndirmə imkanı avtomatik təkrar ödənişin
mümkün olması demək deyil.
İcraçı işə başlamazdan əvvəl Birbank-dan aşağıdakı imkanların mövcudluğunu təsdiqləməlidir:
• Təkrarlanan aylıq ödənişlər.
• İstifadəçinin təkrar ödəniş üçün razılığının alınması və saxlanılması.
• Kart məlumatlarını platformada saxlamadan gələcək ödənişlərin başladılması.
• Ödəniş tokeni və ya Birbank-ın ekvivalent təhlükəsiz mexanizmi.
• Serverdən-serverə ödəniş nəticəsi bildirişləri.
• Abunəliyin ləğvi və təkrar ödənişlərin dayandırılması.
• Uğursuz ödənişlərin statusunun yoxlanılması.
Əgər seçilmiş Birbank xidməti avtomatik təkrarlanan ödənişləri dəstəkləmirsə, bu məhdudiyyət
layihə rəhbərinə bildirilməli və alternativ həll razılaşdırılmalıdır. Bu halda istifadəçinin hər ay əl
ilə ödəniş etməsi tələb oluna bilər; bu, avtomatik abunəliklə eyni funksiya deyil.
9.5. Ödəniş statusları
Hər ödəniş üçün ən azı aşağıdakı statuslar nəzərdə tutulmalıdır:
• Başladılıb.
• Emal olunur.
• Uğurlu.
• Uğursuz.
• Ləğv edilib.
• Geri qaytarılıb.
Ödəniş statusunun dəyişdirilməsi təkrarlanan bildirişlərə qarşı təhlükəsiz olmalıdır. Eyni uğurlu
ödəniş bildirişi bir neçə dəfə gəlsə belə, abunəlik müddəti səhvən bir neçə dəfə artırılmamalıdır.
9.6. Abunəlik statusları
Abunəlik üçün aşağıdakı statuslar nəzərdə tutulmalıdır:
• Aktiv.
• Müddəti bitib.
• Ləğv edilib.
• Ödəniş gözləyir.
• Ödəniş uğursuzdur.
• Müvəqqəti güzəşt müddətində — tətbiq olunarsa.
Abunəlik məlumatlarında aşağıdakılar saxlanılmalıdır:
• İstifadəçi.
• Abunəlik növü.
• Ölkə.
• Tətbiq edilmiş tarif.
• Başlanğıc tarixi.
• Bitmə tarixi.
• Növbəti ödəniş tarixi.
• Avtomatik yenilənmə statusu.
• Son ödəniş statusu.
• Ləğv edilmə tarixi — varsa.
9.7. Uğursuz ödənişlər
Avtomatik ödəniş uğursuz olduqda:
1. Sistem uğursuzluğu qeydə almalıdır.
2. İstifadəçiyə bildiriş göndərilməlidir.
3. Yenidən ödəniş cəhdləri yalnız Birbank inteqrasiyasının və təsdiqlənmiş biznes
qaydalarının icazə verdiyi qaydada aparılmalıdır.
4. Müəyyən edilmiş güzəşt müddəti varsa, istifadəçiyə həmin müddətdə xidmət
göstərilməlidir.
5. Güzəşt müddəti bitdikdə abunəlik aktiv deyilsə, müraciət göndərmək hüququ
dayandırılmalıdır.
Güzəşt müddətinin olub-olmaması və müddəti administrator tərəfindən idarə edilə və ya biznes
qaydası kimi əvvəlcədən müəyyənləşdirilə bilər.
9.8. Abunəliyin ləğvi
İstifadəçi şəxsi kabinetdən avtomatik yenilənməni ləğv edə bilməlidir.
Ləğv zamanı:
• Avtomatik gələcək ödənişlər dayandırılmalıdır.
• İstifadəçiyə ləğvin nəticəsi izah edilməlidir.
• Artıq ödənilmiş müddətin sonuna qədər xidmətin davam etməsi tətbiq olunmalıdır.
• Ləğv tarixi və səbəbi saxlanılmalıdır.
Ləğv əməliyyatı əvvəlki ödəniş tarixçəsini silməməlidir.
9.9. Ödəniş təhlükəsizliyi
• Kartın tam nömrəsi və CVV kodu platformanın verilənlər bazasında saxlanılmamalıdır.
• Kart məlumatları Birbank-ın təhlükəsiz ödəniş infrastrukturunda işlənməlidir.
• Ödəniş bildirişlərinin həqiqiliyi yoxlanılmalıdır.
• Təkrar bildirişlər təhlükəsiz idarə olunmalıdır.
• Hər ödəniş üçün unikal sifariş və ya tranzaksiya identifikatoru saxlanılmalıdır.
• Ödəniş nəticələri audit jurnalında qeydə alınmalıdır.
• İstifadəçi yalnız öz ödəniş tarixçəsinə baxa bilməlidir.
• Administrator ödəniş məlumatlarına yalnız səlahiyyətinə uyğun çıxış əldə etməlidir.
9.10. Daşıyıcının abunəlik yoxlaması
Müraciət göndərilərkən backend aşağıdakıları yoxlamalıdır:
1. İstifadəçi daxil olubmu?
2. İstifadəçi daşıyıcı funksiyasından istifadə etmək hüququna malikdirmi?
3. Abunəlik tələb olunurmu?
4. Abunəlik aktivdirmi?
5. Abunəliyin müddəti bitməyib ki?
6. Hesab bloklanmayıb ki?
7. Yük elanı aktivdirmi?
8. Müraciət həmin yük üçün qaydalara uyğundurmu?
Abunəlik aktiv deyilsə, müraciət yaradılmamalı və istifadəçiyə abunəlik səhifəsinə keçid təklif
edilməlidir.
Yük elanlarına baxmaq hüququ ilə müraciət göndərmək hüququ ayrı icazələr kimi idarə
olunmalıdır.
9. Biznes məkanları modulu
Bu modul yükdaşıma ilə əlaqəli və digər kommersiya məkanlarının vahid kataloqunu yaratmaq
üçün nəzərdə tutulur.
9.1. Məkan kateqoriyaları
İlkin kateqoriyalar:
• Mağaza.
• Kafe və restoran.
• Hotel və motel.
• Avtoservis.
• Təkər təmiri.
• Yanacaqdoldurma məntəqəsi.
• Elektrik avtomobilləri üçün şarj məntəqəsi.
• Yük avtomobilləri üçün parkinq.
• Təhlükəsiz parkinq.
• Avtoyuma.
• Anbar və logistika mərkəzi.
• Aptek.
• Digər xidmət məkanları.
Kateqoriyalar administrator tərəfindən əlavə və redaktə edilə bilməlidir.
9.2. Məkan qeydiyyatı
Biznes sahibi aşağıdakı məlumatları daxil etməlidir:
• Məkanın adı.
• Kateqoriya.
• Qısa təsvir.
• Ölkə.
• Şəhər.
• Tam ünvan.
• Xəritə üzərində yer.
• Enlik və uzunluq koordinatları.
• Telefon.
• Veb-sayt — varsa.
• İş saatları.
• Təqdim edilən xidmətlər.
• Fotoşəkillər.
• Məkanın sahibinə və ya şirkətə aidiyyəti.
• Təsdiq üçün tələb olunan sənədlər — tətbiq olunarsa.
Koordinatlar xəritə seçimi və ya geokodlaşdırma vasitəsilə müəyyənləşdirilməlidir. Ünvan
əsasında koordinatların təsadüfi yaradılması yolverilməzdir.
9.3. Sürücülər üçün faydalı xüsusiyyətlər
Xüsusilə yük maşınları üçün əhəmiyyətli olan xüsusiyyətlər ayrıca qeyd edilməlidir:
• Yük maşınının daxil ola bilməsi.
• Yük maşını üçün parkinq.
• Təhlükəsiz parkinq.
• Gecəlik parkinq.
• Duş və sanitar şərait.
• Yük avtomobili təmiri.
• Təkər xidməti.
• Yanacaq xidməti.
• Şarj xidməti.
• Digər xidmətlər.
Bu xüsusiyyətlər məkan sahibi tərəfindən bəyan edilə bilər, lakin doğrulanmış məlumat kimi
göstərilməsi üçün ayrıca yoxlama tələb olunur. Adi parkinqin yük maşınları üçün uyğun olduğu
avtomatik qəbul edilməməlidir.
9.4. Məkanların axtarışı
İstifadəçi aşağıdakı meyarlarla məkan axtara bilməlidir:
• Ölkə və şəhər.
• Kateqoriya.
• Xidmət növü.
• Yük maşınına uyğunluq.
• Təsdiqlənmiş məkanlar.
• Ad və açar söz.
Yaxınlığa görə axtarış üçün istifadəçinin məkan icazəsi olarsa, cari yerindən məsafə hesablana
bilər. İcazə verilmədikdə şəhər və ya xəritə üzərindən axtarış mümkün olmalıdır.
9.5. Google Maps və Waze naviqasiyası
Hər biznes məkanının səhifəsində aşağıdakı düymələr olmalıdır:
• Google Maps-də marşrutu aç.
• Waze-də marşrutu aç.
Sistem məkanın saxlanılmış koordinatlarından istifadə edərək naviqasiya linkləri yaratmalıdır.
İstifadəçinin cihazında müvafiq tətbiq varsa, link həmin tətbiqdə açıla bilər; əks halda brauzerə
keçid edilməlidir.
Naviqasiya istifadəçinin cihazında açılmalıdır. İlk versiyada platformanın öz daxilində marşrut
mühərriki yaratması tələb olunmur.
9.6. Biznes məkanlarının moderasiyası
Yeni məkanın ilkin statusu “Yoxlamadadır” olmalıdır.
Mümkün statuslar:
• Yoxlamadadır.
• Dərc olunub.
• Rədd edilib.
• Deaktiv edilib.
Yalnız dərc olunmuş məkanlar ictimai kataloqda göstərilməlidir. Rədd edilmə səbəbi məkan
sahibinə bildirilməlidir.
9.7. Gələcək marşrut əsaslı tövsiyələr
Gələcək versiyada sürücüyə bütün şəhərdəki məkanları göstərməklə yanaşı, onun yükdaşıma
marşrutuna yaxın olan məkanları da göstərmək planlaşdırıla bilər.
Bu funksiya üçün marşrut xətti, yol üzrə məsafə, marşrutdan kənarlaşma və yük avtomobillərinə
giriş məhdudiyyətləri nəzərə alınmalıdır. Bu imkan ilk versiyanın məcburi tələbi deyil.
10. Bildirişlər sistemi
Sistem istifadəçiyə vacib hadisələr barədə bildiriş göndərməlidir.
İlkin bildiriş növləri:
• Qeydiyyat və hesab təsdiqi.
• Şifrə bərpası.
• Yük elanına yeni müraciət.
• Müraciətin qəbul və ya rədd edilməsi.
• Uyğun daşıma təklifinin tapılması.
• Elanın və ya təklifin müddətinin bitməsi.
• Biznes məkanının təsdiqi və ya rəddi.
• Administrator tərəfindən hesabın məhdudlaşdırılması.
• Sistemlə bağlı vacib məlumatlar.
Bildirişlər şəxsi kabinetdə saxlanılmalıdır. E-poçt bildirişləri ayrıca inteqrasiya ilə göndərilə
bilər.
Mobil push bildirişləri dəstəklənəcəksə, WebView daxilində sadə brauzer bildirişlərinə
güvənmək əvəzinə Android və iOS üçün uyğun push infrastrukturu planlaşdırılmalıdır. Push
bildirişlərinin tam tətbiqi ayrıca təsdiqlənməlidir. (bu növbəti versiyalarda işlənəcək olan
mərhələdir)
11. Administrator paneli
Administrator paneli platformanın bütün əsas məlumatlarını idarə etməyə imkan verməlidir.
11.1. İdarəetmə bölmələri
• İstifadəçilər.
• Şirkətlər.
• Yük elanları.
• Nəqliyyat vasitələri.
• Daşıma təklifləri.
• Müraciətlər.
• Biznes məkanları.
• Kateqoriyalar.
• Ölkələr və şəhərlər.
• Abunəlik tarifləri.
• Ölkələr üzrə qiymətlər.
• Ödənişlər.
• Aktiv və vaxtı bitmiş abunəliklər.
• Biznes məkanları üçün ödəniş tələbi.
• Bildirişlər.
• Şikayətlər.
• Uyğunlaşdırma parametrləri.
• Sistem statistikası.
• Audit jurnalı.
Administrator tarif yaratmaq, dəyişdirmək və deaktivləşdirmək imkanına malik olmalıdır.
Tarif dəyişiklikləri əvvəlki ödənişlərin tarixçəsini dəyişdirməməlidir. Tarifin hansı tarixdən
qüvvəyə minməsi müəyyənləşdirilə bilməlidir.
11.2. Moderasiya
Administrator aşağıdakı əməliyyatları edə bilməlidir:
• Elanı gizlətmək.
• Elanı silmək və ya arxivləşdirmək.
• Şübhəli istifadəçini bloklamaq.
• Biznes məkanını təsdiqləmək.
• Biznes məkanını rədd etmək.
• Sənədləri yoxlamaq.
• Şikayəti araşdırmaq.
• Əməliyyatın səbəbini qeyd etmək.
Məlumatı dəyişən administrator əməliyyatlarında istifadəçi identifikatoru, tarix, əməliyyat növü
və mümkün olduqda dəyişikliklərin əvvəlki və sonrakı dəyərləri saxlanılmalıdır.
12. İstifadəçi interfeysi və dizayn
İnterfeys sadə, anlaşılan və mobil cihazlara uyğun olmalıdır.
12.1. Əsas səhifə
Əsas səhifədə aşağıdakılar nəzərdə tutulur:
• Platformanın qısa təqdimatı.
• Yük elanlarının axtarışı.
• Daşıyıcı təkliflərinin axtarışı.
• Son əlavə olunmuş elanlar.
• Uyğun daşıyıcı tapmaq və yük yerləşdirmək üçün çağırışlar.
• Biznes məkanları kataloquna keçid.
• Qeydiyyat və giriş.
• Əlaqə məlumatları.
• İstifadə şərtləri və məxfilik siyasəti.
12.2. Şəxsi kabinet
Şəxsi kabinetdə istifadəçinin roluna uyğun bölmələr göstərilməlidir.
Əsas bölmələr:
• Profil.
• Şirkət məlumatları.
• Yük elanlarım.
• Nəqliyyat vasitələrim.
• Daşıma təkliflərim.
• Müraciətlərim.
• Uyğun təkliflər.
• Biznes məkanlarım.
• Bildirişlər.
• Təhlükəsizlik və hesab parametrləri.
12.3. Mobil uyğunluq
Sayt müxtəlif ekran ölçülərində düzgün işləməlidir. Xüsusilə aşağıdakılar yoxlanılmalıdır:
• Kiçik ekranlı Android telefonlar.
• Müxtəlif ölçülü iPhone ekranları.
• Planşetlər.
• Masaüstü brauzerlər.
Formlar, xəritələr, cədvəllər, şəkillər və naviqasiya menyusu mobil ekranlarda istifadəyə yararlı
olmalıdır.
13. Android və iOS tətbiqləri — WebView
Android və iOS tətbiqləri mövcud veb-platformanı WebView daxilində açmalıdır. Bu yanaşma
eyni funksionallığın iki ayrı mobil interfeysdə yenidən hazırlanması ehtiyacını azaldır.
Lakin WebView tətbiqi sadəcə boş ekranda saytın açılmasından ibarət olmamalıdır.
13.1. Mobil tətbiqlərin əsas tələbləri
• Tətbiq açıldıqda platformanın mobil versiyası yüklənməlidir.
• İstifadəçinin giriş sessiyası mümkün qədər təhlükəsiz saxlanılmalıdır.
• Android geri düyməsi düzgün işləməlidir.
• Xarici linklər üçün düzgün keçid davranışı olmalıdır.
• Google Maps və Waze linkləri uyğun tətbiqə və ya brauzerə açılmalıdır.
• Fayl seçimi və şəkil yükləmə funksiyaları işləməlidir.
• Şəbəkə olmadıqda anlaşılan xəta ekranı göstərilməlidir.
• Yüklənmə prosesi zamanı göstərici olmalıdır.
• Klaviatura açıldıqda form sahələri görünən qalmalıdır.
• Status bar, ekranın təhlükəsiz sahələri və aşağı sistem paneli düzgün nəzərə alınmalıdır.
• İstifadəçi çıxış etdikdə sessiya təhlükəsiz bağlanmalıdır.
• Xarici veb-saytlar etibarlı qaydada açılmalıdır.
• HTTPS-dən istifadə edilməlidir.
13.2. Mobil cihaz imkanları
Aşağıdakı imkanlar tələb olunduğu halda WebView ilə inteqrasiya edilməlidir:
• Kamera və qalereyadan şəkil seçimi.
• Sənəd yükləmə.
• Məkan icazəsi.
• Naviqasiya tətbiqlərinin açılması.
• Push bildirişləri.
• Fayl yükləmə və paylaşma.
• Lazım olduqda telefon nömrəsinə zəng etmək.
Kamera, məkan və bildiriş icazələri istifadəçinin razılığı ilə istənilməlidir.
13.3. App Store və Google Play tələbləri
Android və iOS tətbiqləri müvafiq mağazalarda yayımlanmaq üçün hazırlanmalıdır.
Tətbiqlərin mağazalarda qəbul ediləcəyinə əvvəlcədən zəmanət verilə bilməz. WebView
tətbiqləri əlavə istifadəçi dəyəri, düzgün naviqasiya, məxfilik, hesabın silinməsi və platforma
qaydalarına uyğunluq baxımından yoxlanılmalıdır.
Tələb olunduqda aşağıdakılar hazırlanmalıdır:
• Tətbiq ikonu.
• Açılış ekranı.
• Tətbiq təsviri və ekran görüntüləri.
• Məxfilik siyasəti.
• İstifadə şərtləri.
• Hesabın silinməsi prosesi.
• Mağaza hesablarına yükləmə və buraxılış konfiqurasiyası.
Google Play və Apple Developer hesabları, onların ödənişləri və yayımlama hüquqları sifarişçi
tərəfindən təmin olunmalıdır; başqa razılaşma olarsa, müqavilədə göstərilməlidir.
Fors-major: Tətbiqlər mağazada qəbul olunmadığı halda sayt üzərindən yükləmə linki
təmin ediləcək.
14. Veb-saytın texniki arxitekturası
14.1. Ümumi arxitektura
Sistem vahid backend üzərində qurulmalıdır.
Tövsiyə edilən texnologiyalar:
• Backend: PHP (Laravel), Python
• Verilənlər bazası: MySQL, JSON
• Veb interfeys: İlk mərhələdə Laravel Blade və Bootstrap; ehtiyac yaranarsa React ilə
genişləndirmə.
• API: Versiyalaşdırılmış REST API.
• Mobil tətbiqlər: Android və iOS üçün WebView konteynerləri.
• Autentifikasiya: Laravel Sanctum və uyğun sessiya/token mexanizmi.
• Server əlaqəsi: HTTPS.
• Versiyaya nəzarət: Git.
Backend-də biznes qaydaları, uyğunlaşdırma, icazələr, məlumatların yoxlanılması və bildirişlərin
idarə olunması mərkəzləşdirilməlidir.
Android və iOS tətbiqləri eyni API və veb interfeys məntiqindən istifadə etməlidir.
14.2. API
API üçün vahid adlandırma və versiyalaşdırma qaydası tətbiq olunmalıdır.
Nümunə baza yolu:
/api/v1/
İlkin API bölmələri:
• Autentifikasiya və profil.
• Şirkətlər.
• Yük elanları.
• Nəqliyyat vasitələri.
• Daşıma təklifləri.
• Uyğunluqlar.
• Müraciətlər.
• Biznes məkanları.
• Bildirişlər.
• Administrator əməliyyatları.
API sorğularında giriş hüquqları yoxlanılmalı, xətalar standart formatda qaytarılmalı və
istifadəçiyə daxili texniki məlumatlar açıqlanmamalıdır.
14.3. Hosting və yerləşdirmə
İlk mərhələdə mövcud hostingdən istifadə nəzərdə tutulur. Hosting aşağıdakı imkanlara malik
olmalıdır:
• Layihənin tələb etdiyi PHP versiyası.
• Laravel üçün zəruri PHP genişləndirmələri.
• Composer vasitəsilə asılılıqların quraşdırılması.
• MySQL verilənlər bazası.
• HTTPS/SSL.
• Laravel-in public qovluğunu veb giriş nöqtəsi kimi təyin etmək imkanı.
• Yazma icazəsi tələb olunan qovluqların düzgün konfiqurasiyası.
• Cron tapşırıqlarının işlədilməsi.
• Ehtiyat nüsxə yaratmaq imkanı.
• Kifayət qədər disk, yaddaş və sorğu resursları.
Hosting Laravel üçün uyğun deyilsə, yerləşdirmə modeli işə başlamazdan əvvəl
dəqiqləşdirilməlidir.
Gələcəkdə VPS və ya bulud serverinə keçid mümkün olmalıdır. Kod bazası konkret hosting
provayderinə həddindən artıq bağlı qurulmamalıdır.
14.4. Arxa plan tapşırıqları
İlkin mərhələdə bəzi əməliyyatlar sadə sinxron mexanizmlə işləyə bilər. Məlumat həcmi artdıqda
aşağıdakı işlər arxa plan növbəsinə keçirilməlidir:
• Uyğunluqların yenidən hesablanması.
• E-poçt və push bildirişləri.
• Müddəti bitmiş təkliflərin deaktivləşdirilməsi.
• Statistikaların hazırlanması.
• Böyük həcmli faylların emalı.
Bunun üçün Laravel Queue və Scheduler istifadəsi nəzərdə tutula bilər. Mövcud hosting növbə
işçisini daimi işlətməyə imkan vermirsə, uyğun alternativ və ya sonrakı VPS mərhələsi
planlaşdırılmalıdır.
15. Verilənlər bazasının əsas strukturu
Verilənlər bazası əlaqəli məlumatları düzgün saxlamaq və gələcək genişlənməni təmin etmək
üçün normallaşdırılmış şəkildə qurulmalıdır.
İlkin cədvəl qrupları:
1. users — istifadəçilər.
2. user_roles və ya uyğun icazə strukturu — istifadəçi rolları.
3. companies — şirkətlər.
4. countries — ölkələr.
5. locations — şəhərlər və coğrafi nöqtələr.
6. cargo_types — yük kateqoriyaları.
7. vehicle_types — nəqliyyat vasitələrinin növləri.
8. vehicles — nəqliyyat vasitələri.
9. loads — yük elanları.
10. vehicle_offers — daşıma təklifləri.
11. matches — hesablanmış uyğunluqlar.
12. applications — yük və daşıma üzrə müraciətlər.
13. business_categories — biznes məkanlarının kateqoriyaları.
14. business_places — biznes məkanları.
15. notifications — bildirişlər.
16. reports — şikayətlər.
17. audit_logs — administrator və təhlükəsizlik əməliyyatları.
18. Fayllar üçün əlaqəli metadata cədvəlləri — tələb olunduqda.
Cədvəllər arasında xarici açarlar və indekslər düzgün qurulmalıdır.
Çəki kiloqramla, həcm kubmetrlə, koordinatlar enlik və uzunluq kimi, pul isə məbləğ və valyuta
kodu ayrı sahələrdə saxlanılmalıdır. Tarixlər standart formatda saxlanılmalı, istifadəçiyə
göstərilərkən uyğun saat qurşağı tətbiq edilməlidir.
Statuslar üçün əvvəlcədən müəyyən edilmiş və yoxlanılan dəyərlər istifadə edilməlidir.
16. Təhlükəsizlik tələbləri
Sistem aşağıdakı təhlükəsizlik tələblərini yerinə yetirməlidir:
• Bütün ictimai əlaqələr HTTPS üzərindən işləməlidir.
• Şifrələr təhlükəsiz hash mexanizmi ilə saxlanılmalıdır.
• SQL sorğularında parametrli sorğular və ya ORM istifadə edilməlidir.
• CSRF qorunması uyğun veb formalarında tətbiq edilməlidir.
• XSS hücumlarının qarşısı alınmalıdır.
• Giriş və əməliyyat hüquqları server tərəfdə yoxlanılmalıdır.
• İstifadəçi yalnız öz məlumatlarını dəyişə bilməlidir.
• Fayl yükləmələrində ölçü, format və icazə yoxlanılmalıdır.
• Giriş cəhdlərinə və həssas əməliyyatlara limit qoyulmalıdır.
• API-də sürət məhdudiyyəti tətbiq olunmalıdır.
• Məxfi açarlar və şifrələr kod repozitoriyasında saxlanılmamalıdır.
• İstifadəçi məlumatları icazəsiz üçüncü tərəflərə verilməməlidir.
• Administrator əməliyyatları jurnallaşdırılmalıdır.
• Ehtiyat nüsxələr qorunmalı və bərpa prosesi yoxlanılmalıdır.
Şirkət sənədləri və şəxsi məlumatlar ictimai URL vasitəsilə icazəsiz yüklənə bilməməlidir.
17. Məxfilik və hüquqi tələblər
Platformada ən azı aşağıdakı sənədlər yerləşdirilməlidir:
• İstifadə şərtləri.
• Məxfilik siyasəti.
• Kukilər haqqında məlumat.
• Əlaqə və şikayət proseduru.
• Hesabın silinməsi qaydası.
Platformanın vasitəçi statusu, daşıyıcıların məsuliyyəti, istifadəçi məlumatlarının işlənməsi,
biznes məkanlarının doğruluğu və mümkün ödənişlər hüquqi baxımdan ayrıca
qiymətləndirilməlidir.
Beynəlxalq bazara çıxış zamanı müvafiq ölkələrin şəxsi məlumatların qorunması və elektron
ticarət tələbləri nəzərə alınmalıdır. (GDPR (Avropa), CCPA (ABŞ)).
18. SEO və performans
Veb-sayt ictimai axtarış sistemlərindən istifadəçilərin platformaya daxil olmasını
dəstəkləməlidir.
Tələblər:
• Oxunaqlı URL-lər.
• Səhifə başlıqları və meta təsvirlər.
• Sitemap.
• Robots qaydaları.
• Kanonik URL-lər — uyğun olduqda.
• Mobil uyğun dizayn.
• Şəkillərin optimallaşdırılması.
• Lazımsız JavaScript yüklənməsinin azaldılması.
• Verilənlər bazası sorğularının optimallaşdırılması.
• Axtarış nəticələrinin səhifələrə bölünməsi.
• İndekslənməməli şəxsi kabinet və şəxsi məlumat səhifələrinin qorunması.
Yük elanlarının və biznes məkanlarının axtarışda görünməsi onların dərc statusundan və məxfilik
qaydalarından asılı olmalıdır.
19. Fayllar və şəkillər
İstifadəçilər elanlara və biznes məkanlarına şəkillər əlavə edə bilməlidirlər.
Tələblər:
• Fayl növü yoxlanılmalıdır.
• Fayl ölçüsünə limit qoyulmalıdır.
• Faylların adları təhlükəsiz şəkildə yaradılmalıdır.
• İstifadəçi tərəfindən göndərilən fayl adı birbaşa server yolu kimi istifadə edilməməlidir.
• İcazəsiz icra oluna bilən fayllar qəbul edilməməlidir.
• Şəxsi sənədlər ictimai fayl qovluğunda saxlanılmamalıdır.
• Şəkillər mobil cihazlarda optimallaşdırılmış formada göstərilməlidir.
• Faylın sahibi və əlaqəli elanı müəyyən edilə bilməlidir.
İlk mərhələdə hostingin fayl saxlama imkanlarından istifadə edilə bilər. Məlumat həcmi artdıqda
obyekt saxlama xidmətinə keçid mümkün olmalıdır.
20. Test və keyfiyyət təminatı
Sistem yalnız işləyən səhifələrdən ibarət təhvil verilməməlidir. Əsas funksiyalar test edilməlidir.
20.1. Funksional testlər
• Qeydiyyat və giriş.
• Şifrə bərpası.
• Yük elanı yaratmaq və redaktə etmək.
• Nəqliyyat vasitəsi əlavə etmək.
• Daşıma təklifi yaratmaq.
• Uyğunluq hesablanması.
• Müraciət göndərmək və cavablandırmaq.
• Biznes məkanı yaratmaq və moderasiya etmək.
• Google Maps və Waze keçidləri.
• Bildirişlərin çatdırılması.
• İstifadəçi hüquqlarının yoxlanılması.
20.2. Təhlükəsizlik testləri
• Başqa istifadəçinin məlumatlarını dəyişməyə cəhd.
• İcazəsiz administrator səhifəsinə giriş.
• Yanlış və zərərli form məlumatları.
• Təkrar sorğular.
• Fayl yükləmə yoxlamaları.
• Sessiyanın və tokenlərin düzgün idarə olunması.
20.3. Uyğunluq testləri
• Android cihazlarda WebView.
• iPhone cihazlarında WebView.
• Müxtəlif ekran ölçüləri.
• Zəif internet bağlantısı.
• İnternetin kəsilməsi.
• Fayl və şəkil yükləmə.
• Xarici naviqasiya linkləri.
• Giriş və çıxışdan sonra sessiyanın vəziyyəti.
20.4. Uyğunlaşdırma testləri
Ən azı aşağıdakı ssenarilər yoxlanılmalıdır:
• Marşrut uyğun gəlir.
• Marşrut uyğun gəlmir.
• Yükün çəkisi nəqliyyat vasitəsinin tutumunu keçir.
• Tarixlər uyğun gəlmir.
• Nəqliyyat vasitəsinin növü yanlışdır.
• Qiymət valyutaları fərqlidir.
• Təklifin müddəti bitib.
• Eyni yük və təklif üçün təkrar uyğunluq hesablanır.
21. Təhvil veriləcək nəticələr
İcraçı aşağıdakı nəticələri təqdim etməlidir:
1. İşlək veb-sayt.
2. Android tətbiqinin quraşdırıla bilən buraxılışı.
3. iOS tətbiqinin buraxılışa hazır layihəsi və razılaşdırılmış mağaza yayımlama prosesi.
4. Administrator paneli.
5. Verilənlər bazası sxemi və migration faylları.
6. Backend və frontend mənbə kodu.
7. API sənədləri.
8. Quraşdırma və yerləşdirmə təlimatı.
9. Əsas funksiyalar üzrə testlər.
10. Administrator üçün istifadə təlimatı.
11. Ehtiyat nüsxə və bərpa təlimatı.
12. Tətbiqlərin yayımlanması üçün lazım olan konfiqurasiya və materiallar.
13. Layihənin Git repozitoriyası və versiya tarixçəsi.
14. Xarici xidmətlər və açarların siyahısı.
15. Təhvil zamanı məlum məhdudiyyətlər və gələcək işlərin siyahısı.
Mənbə kodunun, domenin, hosting hesablarının və tətbiq mağazası hesablarının kimə məxsus
olacağı müqavilədə dəqiq göstərilməlidir.
22. İş mərhələləri
Layihənin mərhələlərlə hazırlanması tövsiyə olunur.
Mərhələ 1 — Analiz və layihələndirmə
• Biznes qaydalarının dəqiqləşdirilməsi.
• İstifadəçi ssenariləri.
• Səhifələrin siyahısı.
• Verilənlər bazasının layihələndirilməsi.
• Dizayn prototipi.
• Texniki arxitekturanın təsdiqi.
Mərhələ 2 — Əsas sistem
• Laravel layihəsinin qurulması.
• Verilənlər bazası.
• Qeydiyyat və giriş.
• İstifadəçi və şirkət profilləri.
• Administrator panelinin ilkin versiyası.
Mərhələ 3 — Yük və daşıma modulları
• Yük elanları.
• Nəqliyyat vasitələri.
• Daşıma təklifləri.
• Axtarış və filtrlər.
• Müraciətlər və statuslar.
Mərhələ 4 — Uyğunlaşdırma mühərriki
• Qayda əsaslı uyğunluq hesablaması.
• Uyğunluq balları.
• Nəticələrin saxlanması.
• Təkrar hesablamalar.
• Alqoritmin testləri.
Mərhələ 5 — Biznes məkanları
• Məkan qeydiyyatı.
• Kateqoriyalar.
• Xəritə koordinatları.
• Axtarış və filtrlər.
• Moderasiya.
• Google Maps və Waze linkləri.
Mərhələ 6 — Mobil tətbiqlər
• Android WebView.
• iOS WebView.
• Giriş sessiyası.
• Geri düyməsi və xarici linklər.
• Fayl və şəkil yükləmə.
• Məkan və bildiriş inteqrasiyaları — razılaşdırılmış həcmdə.
Mərhələ 7 — Test və buraxılış
• Funksional və təhlükəsizlik testləri.
• Mobil cihaz testləri.
• Hostingə yerləşdirmə.
• Ehtiyat nüsxə və bərpa yoxlaması.
• Tətbiq mağazaları üçün hazırlıq.
• Sifarişçiyə təhvil.
Hər mərhələnin nəticəsi və qəbul meyarları əvvəlcədən təsdiqlənməlidir. Növbəti mərhələyə
keçid əvvəlki mərhələnin qəbulundan sonra edilməlidir.
23. Qəbul meyarları
Layihə aşağıdakı şərtlər yerinə yetirildikdə ilkin versiya üzrə qəbul edilə bilər:
• İstifadəçi qeydiyyatdan keçə və hesabına daxil ola bilir.
• Yük sahibi yük elanı yarada və idarə edə bilir.
• Daşıyıcı nəqliyyat vasitəsi və daşıma təklifi yarada bilir.
• İstifadəçilər elanları axtara və filtrləyə bilir.
• Sistem uyğun yük və daşıma təkliflərini hesablayır.
• Uyğunluq balı və əsas səbəblər göstərilir.
• İstifadəçilər müraciət göndərə və cavablandıra bilir.
• Biznes məkanları qeydiyyatdan keçə və moderasiyadan sonra dərc oluna bilir.
• Məkanlar Google Maps və ya Waze vasitəsilə açıla bilir.
• Administrator əsas məlumatları idarə edə bilir.
• Sayt mobil ekranlarda işləyir.
• Android və iOS WebView tətbiqlərində əsas ssenarilər işləyir.
• İcazəsiz istifadəçilər başqalarının şəxsi məlumatlarını dəyişə bilmir.
• Əsas testlər uğurla tamamlanıb.
• Mənbə kodu və quraşdırma sənədləri sifarişçiyə təqdim edilib.
24. İlkin versiyaya daxil olmayan funksiyalar
Aşağıdakı funksiyalar ayrıca razılaşdırılmadıqda ilk buraxılışa daxil deyil:
• Platformadaxili səsli və video zəng.
• Daşıma müqavilələrinin elektron imzalanması.
• Marşrut optimallaşdırılması.
• İnkişaf etmiş maşın öyrənməsi. (LLM – Süni intellekt)
• Avtomatik sənəd tanıma.
• Beynəlxalq gömrük sistemləri ilə inteqrasiya.
• Mühasibat və ERP inteqrasiyaları.
• Sürücü reytinqi və mübahisələrin tam idarəetmə sistemi.
Bu funksiyalar sonrakı mərhələlər üçün ayrıca qiymətləndirilə bilər.
Yekun
Platforma vahid backend və verilənlər bazası üzərində qurulmalıdır. Yük sahibləri ödənişsiz
istifadə etməli, daşıyıcılar müraciət göndərmək üçün aktiv aylıq abunəliyə malik olmalıdır.
Biznes məkanları üçün ödəniş tələbi və ölkələr üzrə tariflər administrator panelindən idarə
edilməlidir.
Birbank vasitəsilə aylıq avtomatik yenilənmə inteqrasiyası tətbiq edilməzdən əvvəl provayderin
təkrarlanan ödəniş və təhlükəsiz təsdiqləmə imkanları yoxlanılmalıdır. Ödəniş statusu ilə
abunəlik statusu server tərəfində idarə edilməli və istifadəçinin müraciət hüququ buna uyğun
müəyyənləşdirilməlidir.
İcraçı işə başlamazdan əvvəl texniki imkanları, açıq biznes qərarlarını, mərhələləri, müddəti və
büdcəni təqdim etməli, sonra təsdiqlənmiş texniki tapşırıq əsasında işləməlidir.