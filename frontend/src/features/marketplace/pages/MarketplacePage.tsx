import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Search,
    SlidersHorizontal,
    MapPin,
    Package,
    Truck,
    Plus,
    Monitor,
    Layers,
    ChevronDown,
    Flag,
    ListFilter,
    LayoutGrid,
    ArrowRight,
    MessageCircle,
    BadgeCheck,
} from "lucide-react";
import { pagePaths, primaryNav, secondaryNav } from "../config/navigation";
import type { Listing } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { CountryFlag } from "../components/CountryFlag";
import { Dropdown, type DropdownOption } from "../components/Dropdown";
import { ListingCard } from "../components/ListingCard";
import { MarketplaceSidebar } from "../components/MarketplaceSidebar";
import { MarketplaceTopbar } from "../components/MarketplaceTopbar";
import { MarketplaceMobileNav } from "../components/MarketplaceMobileNav";
import { useLoads } from "../../loads/hooks/useLoads";
import { useAuth, useLogout } from "../../auth/hooks/useAuth";
import LoadOriginMap from "../../loads/LoadOriginMap";
function formatLoadDate(value: string): string {
    if (!value) return "";
    const datePart = value.includes("T") ? value.split("T")[0] : value;
    const match = datePart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!match) return value;
    const [, year, month, day] = match;
    return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

function formatLoadDateTime(value: string): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("az-AZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(date);
}

type MarketplaceStats = {
    loads: { active: number; last_hour: number };
    vehicles: { active: number; last_hour: number };
};

export default function MarketplacePage() {
    const statsQuery = useQuery({
        queryKey: ["marketplace-stats"],
        queryFn: async () => {
            const { data } = await api.get<MarketplaceStats>("/marketplace/stats");
            return data;
        },
        refetchInterval: 60_000,
        staleTime: 30_000,
    });
    const [query, setQuery] = useState("");
    const [kind, setKind] = useState<"load" | "vehicle">("load");
    const [fromCountry, setFromCountry] = useState("");
    const [fromCity, setFromCity] = useState("");
    const [toCountry, setToCountry] = useState("");
    const [toCity, setToCity] = useState("");
    const [source, setSource] = useState("");
    const [status, setStatus] = useState("");
    const [minWeight, setMinWeight] = useState("");
    const [maxWeight, setMaxWeight] = useState("");
    const [minVolume, setMinVolume] = useState("");
    const [maxVolume, setMaxVolume] = useState("");
    const [cargoType, setCargoType] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [currency, setCurrency] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [sort, setSort] = useState("Əvvəlcə yenilər");

    type CatalogOption = { id: number; name: string; iso2?: string; default_currency?: string; image_path?: string | null };
    const countriesQuery = useQuery({
        queryKey: ["catalog", "countries"],
        queryFn: async () => (await api.get<{ data: CatalogOption[] }>("/catalog/countries")).data.data,
        staleTime: 300_000,
    });
    const cargoTypesQuery = useQuery({
        queryKey: ["catalog", "cargo-types"],
        queryFn: async () => (await api.get<{ data: CatalogOption[] }>("/catalog/cargo-types")).data.data,
        staleTime: 300_000,
    });
    const vehicleTypesQuery = useQuery({
        queryKey: ["catalog", "load-vehicle-types"],
        queryFn: async () => (await api.get<{ data: CatalogOption[] }>("/catalog/load-vehicle-types")).data.data,
        staleTime: 300_000,
    });
    const fromCitiesQuery = useQuery({
        queryKey: ["catalog", "locations", fromCountry],
        queryFn: async () => (await api.get<{ data: CatalogOption[] }>("/catalog/locations", { params: { country_id: fromCountry, per_page: 100 } })).data.data,
        enabled: Boolean(fromCountry),
        staleTime: 300_000,
    });
    const toCitiesQuery = useQuery({
        queryKey: ["catalog", "locations", toCountry],
        queryFn: async () => (await api.get<{ data: CatalogOption[] }>("/catalog/locations", { params: { country_id: toCountry, per_page: 100 } })).data.data,
        enabled: Boolean(toCountry),
        staleTime: 300_000,
    });

    const vehicleTypeImageUrls = import.meta.glob(
        "../../../assets/img/vehicle-types/*",
        { eager: true, import: "default", query: "?url" },
    ) as Record<string, string>;
    const getVehicleTypeImage = (imagePath?: string | null) => {
        if (!imagePath) return undefined;
        const filename = imagePath.replace(/\\/g, "/").split("/").pop();
        if (!filename) return undefined;
        return Object.entries(vehicleTypeImageUrls).find(
            ([path]) => path.split("/").pop()?.toLowerCase() === filename.toLowerCase(),
        )?.[1];
    };

    const countryOptions = (countriesQuery.data ?? []).map((item) => ({
        value: String(item.id),
        label: item.name,
        description: item.iso2,
        leading: <CountryFlag flag={item.iso2 ?? ""} className="dropdown-country-flag" />,
    }));
    const fromCityOptions = (fromCitiesQuery.data ?? []).map((item) => ({
        value: String(item.id), label: item.name, leading: <MapPin size={16} />,
    }));
    const toCityOptions = (toCitiesQuery.data ?? []).map((item) => ({
        value: String(item.id), label: item.name, leading: <MapPin size={16} />,
    }));
    const cargoTypeOptions: DropdownOption[] = [
        { value: "", label: "Bütün kateqoriyalar", leading: <Package size={16} /> },
        ...(cargoTypesQuery.data ?? []).map((item) => ({
            value: String(item.id), label: item.name, leading: <Package size={16} />,
        })),
    ];
    const vehicleTypeOptions: DropdownOption[] = [
        { value: "", label: "Bütün növlər", leading: <Truck size={16} /> },
        ...(vehicleTypesQuery.data ?? []).map((item) => {
            const image = getVehicleTypeImage(item.image_path);
            return {
                value: String(item.id),
                label: item.name,
                leading: image ? <img src={image} alt="" className="dropdown-vehicle-image" /> : <Truck size={17} />,
            };
        }),
    ];
    const sourceOptions: DropdownOption[] = [
        { value: "", label: "Mənbələr", leading: <Layers size={16} /> },
        { value: "web", label: "Sayt", leading: <Monitor size={16} /> },
        { value: "whatsapp", label: "WhatsApp", leading: <span className="dropdown-whatsapp-icon"><FontAwesomeIcon icon={faWhatsapp} /></span> },
        { value: "telegram", label: "Telegram", leading: <span className="dropdown-telegram-icon"><FontAwesomeIcon icon={faTelegram} /></span> },
    ];
    const statusOptions: DropdownOption[] = [
        { value: "", label: "Bütün aktiv elanlar", leading: <BadgeCheck size={16} /> },
        { value: "published", label: "Dərc edilib", leading: <BadgeCheck size={16} /> },
        { value: "has_applications", label: "Müraciətlər var", leading: <MessageCircle size={16} /> },
    ];
    const currencyOptions: DropdownOption[] = [
        { value: "", label: "Bütün valyutalar", leading: <span className="dropdown-currency-symbol">¤</span> },
        ...[...new Set((countriesQuery.data ?? []).map((item) => item.default_currency).filter((value): value is string => Boolean(value)))].sort().map((value) => ({
            value, label: value, leading: <span className="dropdown-currency-symbol">{value.slice(0, 1)}</span>,
        })),
    ];
    const sortOptions: DropdownOption[] = [
        { value: "Əvvəlcə yenilər", label: "Əvvəlcə yenilər", leading: <span className="dropdown-sort-mark">↓</span> },
        { value: "Əvvəlcə köhnələr", label: "Əvvəlcə köhnələr", leading: <span className="dropdown-sort-mark">↑</span> },
    ];

    const location = useLocation();
    const navigate = useNavigate();
    const mapLoadIds = new URLSearchParams(location.search).get("load_ids") ?? "";
    const [mapOpen, setMapOpen] = useState(false);
    const [mapFocusLoadId, setMapFocusLoadId] = useState<number | undefined>(undefined);
    useEffect(() => { if (mapLoadIds) setPageNumber(1); }, [mapLoadIds]);

    const loadFilters = {
        per_page: 12,
        ids: mapLoadIds || undefined,
        page: pageNumber,
        search: query || undefined,
        from_country_id: fromCountry ? Number(fromCountry) : undefined,
        from_location_id: fromCity ? Number(fromCity) : undefined,
        to_country_id: toCountry ? Number(toCountry) : undefined,
        to_location_id: toCity ? Number(toCity) : undefined,
        cargo_type_id: cargoType ? Number(cargoType) : undefined,
        load_vehicle_type_id: vehicleType ? Number(vehicleType) : undefined,
        applications: source ? source as "web" | "whatsapp" | "telegram" : undefined,
        status: status ? status as "published" | "has_applications" : undefined,
        min_weight: minWeight ? Number(minWeight) * 1000 : undefined,
        max_weight: maxWeight ? Number(maxWeight) * 1000 : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        currency: currency || undefined,
        sort: sort === "Əvvəlcə köhnələr" ? "oldest" as const : "newest" as const,
    };
    const loadsQuery = useLoads(loadFilters);
    const vehicleOffersQuery = useQuery({
        queryKey: ["marketplace-vehicle-offers", query, fromCountry, fromCity, toCountry, toCity, vehicleType, minWeight, maxWeight, minVolume, maxVolume, dateFrom, minPrice, maxPrice, currency, pageNumber],
        queryFn: async () => (await api.get<{ data: any[]; meta: { total: number; current_page: number; last_page: number } }>("/offers", { params: {
            per_page: 12, page: pageNumber, search: query || undefined,
            from_country_id: fromCountry || undefined, from_location_id: fromCity || undefined,
            to_country_id: toCountry || undefined, to_location_id: toCity || undefined,
            load_vehicle_type_id: vehicleType || undefined,
            min_weight: minWeight || undefined, max_weight: maxWeight || undefined,
            min_volume: minVolume || undefined, max_volume: maxVolume || undefined,
            date: dateFrom || undefined, min_price: minPrice || undefined, max_price: maxPrice || undefined,
            currency: currency || undefined,
        } })).data,
        enabled: kind === "vehicle",
        staleTime: 20_000,
    });
    const auth = useAuth();
    const logout = useLogout();
    const apiListings: Listing[] = (loadsQuery.data?.data ?? []).map(
        (load) => ({
            id: `LA-${load.id}`,
            title: load.title,
            from: load.from_name ?? load.from_country_name ?? "—",
            to: load.to_name ?? load.to_country_name ?? "—",
            fromFlag: load.from_country_iso2 ?? "",
            toFlag: load.to_country_iso2 ?? "",
            cargo: load.cargo_type_name ?? "Digər yük",
            weight: `${(Number(load.weight_kg) / 1000).toLocaleString("az-AZ", { maximumFractionDigits: 2 })} ton`,
            vehicle: load.load_vehicle_type_name ?? "Nəqliyyat növü göstərilməyib",
            price:
                load.price === null
                    ? "Razılaşma ilə"
                    : `${Number(load.price).toLocaleString("az-AZ")} ${load.currency ?? ""}`.trim(),
            application: (() => {
                const application = String(load.applications ?? "").toLowerCase();

                if (application === "whatsapp") return "WhatsApp-dan";
                if (application === "telegram") return "Telegram-dan";
                if (application === "web") return "Saytdan";

                return "Saytdan";
            })(),
            date: formatLoadDateTime(load.created_at),
            isReadyForLoading: Boolean(load.is_ready_for_loading),
            pickupDate: load.is_ready_for_loading ? null : formatLoadDate(load.pickup_from),
            isHazardous: Boolean(load.is_hazardous),
            needsRefrigeration: Boolean(load.needs_refrigeration),
            volume: load.volume_m3 === null ? null : `${Number(load.volume_m3).toLocaleString("az-AZ")} m³`,
            quantity: load.quantity ?? null,
            source: load.applications === "whatsapp" ? "WhatsApp-dan" : load.applications === "telegram" ? "Telegram-dan" : "Saytdan",
            kind: "load",
        }),
    );
    const currentPath = location.pathname.replace(/\/+$/, "") || "/";
    const page =
        Object.entries(pagePaths).find(
            ([, path]) => path === currentPath,
        )?.[0] ?? "Bütün elanlar";
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [filterOpen, setFilterOpen] = useState(false);
    const [country, setCountry] = useState("🇦🇿 Azərbaycan");
    const [saved, setSaved] = useState<string[]>([]);
    const [showNotices, setShowNotices] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const vehicleListings: Listing[] = (vehicleOffersQuery.data?.data ?? []).map((offer: any) => ({
        id: `VO-${offer.id}`,
        title: offer.vehicle_name ?? "Nəqliyyat vasitəsi",
        from: offer.from_location_name ?? offer.from_country_name ?? "—",
        to: offer.to_location_name ?? offer.to_country_name ?? "—",
        fromFlag: offer.from_country_iso2 ?? "", toFlag: offer.to_country_iso2 ?? "",
        cargo: offer.load_vehicle_type_name ?? "Yük yeri növü göstərilməyib",
        weight: `${(Number(offer.capacity_kg) / 1000).toLocaleString("az-AZ", { maximumFractionDigits: 2 })} ton`,
        vehicle: offer.load_vehicle_type_name ?? "Nəqliyyat vasitəsi",
        price: offer.price_negotiable || offer.price == null ? "Razılaşma ilə" : `${Number(offer.price).toLocaleString("az-AZ")} ${offer.currency ?? ""}`.trim(),
        application: offer.driver_name ?? "Daşıyıcı",
        date: formatLoadDate(offer.available_from),
        isReadyForLoading: Boolean(offer.is_ready_for_loading),
        pickupDate: offer.is_ready_for_loading ? null : formatLoadDate(offer.available_from),
        isHazardous: false, needsRefrigeration: Boolean(offer.is_refrigerated),
        volume: offer.capacity_m3 == null ? null : `${Number(offer.capacity_m3).toLocaleString("az-AZ")} m³`,
        quantity: Number(offer.quantity ?? 1),
        source: "Marşrut təklifi", kind: "vehicle",
    }));
    const filtered = kind === "load" ? apiListings : vehicleListings;
    const changePage = (label: string) => {
        navigate(pagePaths[label] ?? "/");
        setShowMobileMenu(false);
    };
    const toggleSaved = (id: string) =>
        setSaved((s) =>
            s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
        );
    return (
        <div className="app-shell" data-theme={theme}>
            <MarketplaceSidebar
                theme={theme}
                page={page}
                onNavigate={changePage}
            />
            <div className="workspace">
                <MarketplaceTopbar
                    page={page}
                    theme={theme}
                    country={country}
                    onCountryChange={setCountry}
                    onNavigate={changePage}
                    onToggleTheme={() =>
                        setTheme(theme === "light" ? "dark" : "light")
                    }
                    showNotices={showNotices}
                    onToggleNotices={() => setShowNotices(!showNotices)}
                    onLogin={() => navigate("/login")}
                    userName={auth.data?.data.user.name ?? null}
                    onLogout={() => logout.mutate()}
                    onToggleMobileMenu={() =>
                        setShowMobileMenu(!showMobileMenu)
                    }
                />
                {showMobileMenu && (
                    <div className="mobile-menu-panel">
                        {primaryNav.map(({ label, icon: Icon }) => (
                            <button
                                key={label}
                                onClick={() => changePage(label)}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                        <div className="nav-divider" />
                        {secondaryNav.map(({ label, icon: Icon }) => (
                            <button
                                key={label}
                                onClick={() => changePage(label)}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>
                )}
                <main className="content-area">
                    {page === "Bütün elanlar" ? (
                        <>
                            <div className="market-tabs">
                                <button
                                    className={kind === "load" ? "active" : ""}
                                    onClick={() => setKind("load")}
                                >
                                    <b>{statsQuery.data?.loads.active.toLocaleString("az-AZ") ?? "—"}</b> <Package size={18} /> Yüklər
                                </button>
                                <button
                                    className={
                                        kind === "vehicle" ? "active" : ""
                                    }
                                    onClick={() => setKind("vehicle")}
                                >
                                    <b>{statsQuery.data?.vehicles.active.toLocaleString("az-AZ") ?? "—"}</b> <Truck size={18} /> Nəqliyyat vasitələri
                                </button>
                            </div>
                            <section className="search-tools">
                                <label className="search-field">
                                    <Search size={18} />
                                    <input
                                        placeholder={kind === "load" ? "Açar söz, marşrut və ya yük adı" : "Marşrut, şəhər və ya nəqliyyat vasitəsi"}
                                        value={query}
                                        onChange={(e) => { setQuery(e.target.value); setPageNumber(1); }}
                                    />
                                </label>
                                <label className="search-field">
                                    <MapPin size={18} />
                                    <Dropdown
                                        value={fromCountry}
                                        options={countryOptions}
                                        onChange={(value) => { setFromCountry(value); setFromCity(""); setPageNumber(1); }}
                                        placeholder="Yükləmə ölkəsi"
                                        ariaLabel="Yükləmə ölkəsi"
                                        searchable
                                        searchPlaceholder="Ölkə axtar…"
                                    />
                                </label>
                                <label className="search-field">
                                    <Flag size={18} />
                                    <Dropdown
                                        value={toCountry}
                                        options={countryOptions}
                                        onChange={(value) => { setToCountry(value); setToCity(""); setPageNumber(1); }}
                                        placeholder="Çatdırılma ölkəsi"
                                        ariaLabel="Çatdırılma ölkəsi"
                                        searchable
                                        searchPlaceholder="Ölkə axtar…"
                                    />
                                </label>
                                <button
                                    className={"filter-button " + (filterOpen ? "filter-on" : "")}
                                    onClick={() => setFilterOpen(!filterOpen)}
                                >
                                    <SlidersHorizontal size={17} /> Daha çox <ChevronDown size={15} />
                                </button>
                                {kind === "load" && <Dropdown
                                    className="marketplace-source-dropdown"
                                    value={source}
                                    options={sourceOptions}
                                    onChange={(value) => { setSource(value); setPageNumber(1); }}
                                    ariaLabel="Elan mənbəyi"
                                />}
                                <div className="sort-select">
                                    <ListFilter size={16} />
                                    <Dropdown
                                        className="marketplace-sort-dropdown"
                                        value={sort}
                                        options={sortOptions}
                                        onChange={(value) => { setSort(value); setPageNumber(1); }}
                                        ariaLabel="Sıralama"
                                    />
                                </div>
                            </section>
                            {filterOpen && (
                                <section className="expanded-filters">
                                    <div>
                                        <strong>Ətraflı filtrlər</strong>
                                        <small>{kind === "load" ? "Yüklər üçün parametrlər" : "Marşrut təklifləri üçün tutum, tarix, yük yeri növü və qiymət filtrləri"}</small>
                                        <small>Qiymət aralığı tətbiq etmək üçün valyuta seçin.</small>
                                    </div>
                                    <label>
                                        <span>Yükləmə şəhəri</span>
                                        <Dropdown value={fromCity} options={[{ value: "", label: "Bütün şəhərlər" }, ...fromCityOptions]} onChange={(value) => { setFromCity(value); setPageNumber(1); }} placeholder="Bütün şəhərlər" ariaLabel="Yükləmə şəhəri" searchable disabled={!fromCountry} />
                                    </label>
                                    <label>
                                        <span>Çatdırılma şəhəri</span>
                                        <Dropdown value={toCity} options={[{ value: "", label: "Bütün şəhərlər" }, ...toCityOptions]} onChange={(value) => { setToCity(value); setPageNumber(1); }} placeholder="Bütün şəhərlər" ariaLabel="Çatdırılma şəhəri" searchable disabled={!toCountry} />
                                    </label>
                                    {kind === "load" && <label>
                                        <span>Yük kateqoriyası</span>
                                        <Dropdown value={cargoType} options={cargoTypeOptions} onChange={(value) => { setCargoType(value); setPageNumber(1); }} ariaLabel="Yük kateqoriyası" searchable />
                                    </label>}
                                    <label>
                                        <span>{kind === "load" ? "Nəqliyyat növü" : "Yük yeri növü"}</span>
                                        <Dropdown value={vehicleType} options={vehicleTypeOptions} onChange={(value) => { setVehicleType(value); setPageNumber(1); }} ariaLabel="Nəqliyyat növü" searchable />
                                    </label>
                                    <label>
                                        <span>Minimum çəki (ton)</span>
                                        <input type="number" min="0" step="0.1" value={minWeight} onChange={(e) => { setMinWeight(e.target.value); setPageNumber(1); }} placeholder="0" />
                                    </label>
                                    <label>
                                        <span>Maksimum çəki (ton)</span>
                                        <input type="number" min="0" step="0.1" value={maxWeight} onChange={(e) => { setMaxWeight(e.target.value); setPageNumber(1); }} placeholder="—" />
                                    </label>
                                    {kind === "vehicle" && <><label><span>Minimum həcm (m³)</span><input type="number" min="0" step="0.1" value={minVolume} onChange={e => { setMinVolume(e.target.value); setPageNumber(1); }} /></label><label><span>Maksimum həcm (m³)</span><input type="number" min="0" step="0.1" value={maxVolume} onChange={e => { setMaxVolume(e.target.value); setPageNumber(1); }} /></label></>}
                                    <label>
                                        <span>{kind === "load" ? "Yükləmə tarixindən" : "Yükləmə tarixi"}</span>
                                        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPageNumber(1); }} />
                                    </label>
                                    {kind === "load" && <label>
                                        <span>Yükləmə tarixinədək</span>
                                        <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => { setDateTo(e.target.value); setPageNumber(1); }} />
                                    </label>}
                                    <label>
                                        <span>Minimum qiymət</span>
                                        <input type="number" min="0" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPageNumber(1); }} placeholder="0" />
                                    </label>
                                    <label>
                                        <span>Maksimum qiymət</span>
                                        <input type="number" min="0" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPageNumber(1); }} placeholder="—" />
                                    </label>
                                    <label>
                                        <span>Valyuta</span>
                                        <Dropdown value={currency} options={currencyOptions} onChange={(value) => { setCurrency(value); setPageNumber(1); }} ariaLabel="Valyuta" searchable />
                                    </label>
                                    {kind === "load" && <label>
                                        <span>Elan statusu</span>
                                        <Dropdown value={status} options={statusOptions} onChange={(value) => { setStatus(value); setPageNumber(1); }} ariaLabel="Elan statusu" />
                                    </label>}
                                    <button className="text-action" onClick={() => {
                                        setQuery(""); setFromCountry(""); setFromCity(""); setToCountry(""); setToCity("");
                                        setSource(""); setStatus(""); setMinWeight(""); setMaxWeight(""); setMinVolume(""); setMaxVolume(""); setCargoType(""); setVehicleType("");
                                        setDateFrom(""); setDateTo(""); setMinPrice(""); setMaxPrice(""); setCurrency("");
                                        setSort("Əvvəlcə yenilər"); setPageNumber(1);
                                    }}>
                                        Filtrləri sıfırla
                                    </button>
                                </section>
                            )}
                            <section className="welcome-banner">
                                <div className="banner-copy">
                                    <h2>
                                        Doğru yük. Doğru marşrut.{" "}
                                        <em>Vaxtında çatdırılma.</em>
                                    </h2>
                                    <p>
                                        Platformada{" "}
                                        {kind === "load" ? "yük" : "nəqliyyat"}{" "}
                                        imkanlarını araşdırın və növbəti
                                        daşınmanızı planlaşdırın.
                                    </p>
                                    <div className="banner-stats">
                                        <span>
                                            <strong>
                                                {statsQuery.data
                                                    ? statsQuery.data[kind === "load" ? "loads" : "vehicles"].active.toLocaleString("az-AZ")
                                                    : "—"}
                                            </strong>{" "}
                                            aktiv elan
                                        </span>
                                        <i />
                                        <span>
                                            <strong>
                                                {statsQuery.data
                                                    ? `+${statsQuery.data[kind === "load" ? "loads" : "vehicles"].last_hour.toLocaleString("az-AZ")}`
                                                    : "—"}
                                            </strong> son 1 saatda
                                        </span>
                                    </div>
                                </div>
                                <div className="banner-art">
                                    <div className="orbit orbit-one" />
                                    <div className="orbit orbit-two" />
                                    <div className="art-pin">
                                        <MapPin size={27} />
                                    </div>
                                    <CountryFlag
                                        flag="AZ"
                                        className="art-node node-one"
                                    />
                                    <CountryFlag
                                        flag="TR"
                                        className="art-node node-two"
                                    />
                                    <CountryFlag
                                        flag="GE"
                                        className="art-node node-three"
                                    />
                                    <CountryFlag
                                        flag="CN"
                                        className="art-node node-four"
                                    />
                                    <CountryFlag
                                        flag="RU"
                                        className="art-node node-five"
                                    />
                                </div>
                            </section>
                            {mapLoadIds && (
                                <div className="map-filter-notice">
                                    <span><MapPin size={16} /> Xəritədə seçilmiş nöqtənin yükləri göstərilir ({mapLoadIds.split(",").filter(Boolean).length})</span>
                                    <button type="button" onClick={() => navigate("/")}>Bütün yükləri göstər</button>
                                </div>
                            )}
                            <div className="results-heading">
                                <div>
                                    <h2>
                                        {kind === "load"
                                            ? "Bütün yük elanları"
                                            : "Marşrut üzrə nəqliyyat təklifləri"}{" "}
                                        <span className="span-round">
                                            {kind === "load" ? (loadsQuery.data?.meta.total ?? 0) : (vehicleOffersQuery.data?.meta.total ?? 0)}
                                        </span>
                                    </h2>
                                </div>
                                <div className="view-switch">
                                    <button className="selected">
                                        <LayoutGrid size={17} />
                                    </button>
                                    <button>
                                        <ListFilter size={17} />
                                    </button>
                                </div>
                            </div>
                            <div className="listing-grid">
                                {((kind === "load" && loadsQuery.isLoading) || (kind === "vehicle" && vehicleOffersQuery.isLoading)) ? (
                                    <div className="no-results">
                                        <strong>Yüklər yüklənir…</strong>
                                    </div>
                                ) : ((kind === "load" && loadsQuery.isError) || (kind === "vehicle" && vehicleOffersQuery.isError)) ? (
                                    <div className="no-results">
                                        <strong>
                                            Yükləri əldə etmək mümkün olmadı
                                        </strong>
                                        <span>
                                            API bağlantısını və server cavabını
                                            yoxlayın.
                                        </span>
                                    </div>
                                ) : filtered.length ? (
                                    filtered.map((item) => (
                                        <ListingCard
                                            key={item.id}
                                            item={item}
                                            onSelect={() => navigate(`/loads/${Number(item.id.replace(/^LA-/, ""))}`)}
                                            onMap={() => { setMapFocusLoadId(Number(item.id.replace(/^LA-/, ""))); setMapOpen(true); }}
                                            showApplication={item.kind === "load"}
                                            saved={saved.includes(item.id)}
                                            onSave={() => toggleSaved(item.id)}
                                        />
                                    ))
                                ) : (
                                    <div className="no-results">
                                        <Search size={25} />
                                        <strong>Elan tapılmadı</strong>
                                        <span>
                                            Axtarış şərtlərini dəyişərək yenidən
                                            yoxlayın.
                                        </span>
                                    </div>
                                )}
                            </div>
                            {((kind === "load" && loadsQuery.data?.meta?.last_page && loadsQuery.data.meta.last_page > 1) || (kind === "vehicle" && vehicleOffersQuery.data?.meta?.last_page && vehicleOffersQuery.data.meta.last_page > 1)) && (
                                <div className="pagination-controls">
                                    <button disabled={pageNumber <= 1 || loadsQuery.isFetching} onClick={() => setPageNumber((value) => Math.max(1, value - 1))}>Əvvəlki</button>
                                    <span>{kind === "load" ? loadsQuery.data!.meta.current_page : vehicleOffersQuery.data!.meta.current_page} / {kind === "load" ? loadsQuery.data!.meta.last_page : vehicleOffersQuery.data!.meta.last_page}</span>
                                    <button disabled={pageNumber >= (kind === "load" ? loadsQuery.data!.meta.last_page : vehicleOffersQuery.data!.meta.last_page) || loadsQuery.isFetching} onClick={() => setPageNumber((value) => Math.min(kind === "load" ? loadsQuery.data!.meta.last_page : vehicleOffersQuery.data!.meta.last_page, value + 1))}>Növbəti</button>
                                </div>
                            )}
                        </>
                    ) : page === "Yük xəritəsi" ? (
                        <section className="map-page">
                            <div className="map-toolbar">
                                <div>
                                    <span className="overline">
                                        LIVE FREIGHT MAP
                                    </span>
                                    <h2>Yüklər xəritədə</h2>
                                    <p>
                                        Marşrutları və yük sıxlığını interaktiv
                                        xəritədə izləyin.
                                    </p>
                                </div>
                                <button className="primary-button">
                                    <MapPin size={16} /> Yaxınlıqdakı yüklər
                                </button>
                            </div>
                            <div className="map-placeholder">
                                <div className="map-land map-land-a" />
                                <div className="map-land map-land-b" />
                                <div className="map-route route-a" />
                                <div className="map-route route-b" />
                                {[
                                    ["Bakı", "🇦🇿", "47%", "56%", "133"],
                                    ["İstanbul", "🇹🇷", "24%", "66%", "186"],
                                    ["Moskva", "🇷🇺", "54%", "22%", "82"],
                                    ["Tbilisi", "🇬🇪", "39%", "47%", "31"],
                                    ["Almatı", "🇰🇿", "78%", "52%", "47"],
                                ].map(([name, flag, x, y, count]) => (
                                    <button
                                        className="map-cluster"
                                        style={{ left: x, top: y }}
                                        key={name}
                                    >
                                        <b>{count}</b>
                                        <span>
                                            <CountryFlag flag={flag} /> {name}
                                        </span>
                                    </button>
                                ))}
                                <div className="map-search-pill">
                                    <Search size={17} />
                                    <span>
                                        Haradan · Haraya · Nəqliyyat növü
                                    </span>
                                </div>
                                <div className="map-legend-pill">
                                    <i /> Aktiv yüklər <i /> Marşrutlar
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="placeholder-page">
                            <div className="placeholder-icon">
                                <Package size={28} />
                            </div>
                            <span className="overline">
                                LOGISTICS WORKSPACE
                            </span>
                            <h2>{page}</h2>
                            <p>
                                Bu bölmənin interfeysi yeni dizayn sisteminə
                                uyğun hazırlanacaq.
                            </p>
                            <button
                                className="primary-button"
                                onClick={() => changePage("Bütün elanlar")}
                            >
                                Bütün elanlara qayıt <ArrowRight size={16} />
                            </button>
                        </section>
                    )}
                </main>
            </div>
            <LoadOriginMap open={mapOpen} onClose={() => setMapOpen(false)} focusLoadId={mapFocusLoadId} />
            <MarketplaceMobileNav
                page={page}
                onNavigate={changePage}
                onToggleMore={() => setShowMobileMenu(!showMobileMenu)}
            />
            <button className="mobile-create" aria-label="Elan yerləşdir">
                <Plus size={21} />
            </button>
        </div>
    );
}
