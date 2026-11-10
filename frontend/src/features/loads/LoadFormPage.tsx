import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, X, MapPin } from "lucide-react";
import {
    catalogApi,
    getCatalogLocale,
    type CatalogLocale,
    type Country,
    type LoadVehicleType,
    type Location,
} from "../catalog/catalogApi";
import "./load-body-picker.css";
import { loadsApi } from "./api/loadsApi";
import { useLoad, myLoadsQueryKey, loadsQueryKey } from "./hooks/useLoads";
import type { CreateLoadPayload } from "./types";
import logoLight from "../../assets/img/logo-light.png";

type Target = "from" | "to";

// Vite processes these assets and returns their production-safe URLs.
const vehicleTypeImageUrls = import.meta.glob(
    "../../assets/img/vehicle-types/*",
    { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

function getVehicleTypeImage(imagePath: string | null | undefined): string | undefined {
    if (!imagePath) return undefined;

    // DB values may be filenames, relative paths, or legacy Windows/URL paths.
    const filename = imagePath.replace(/\\/g, "/").split("/").pop();
    if (!filename) return undefined;

    const match = Object.entries(vehicleTypeImageUrls).find(([path]) =>
        path.split("/").pop()?.toLowerCase() === filename.toLowerCase(),
    );
    return match?.[1];
}
type State = {
    cargo_type_id: string;
    from_country_id: string;
    from_location_id: string;
    from_location_name: string;
    to_country_id: string;
    to_location_id: string;
    to_location_name: string;
    weight_ton: string;
    volume_m3: string;
    count: string;
    load_vehicle_type_id: string;
    date_mode: "ready" | "choose";
    pickup_from: string;
    notes: string;
    price_mode: "negotiable" | "fixed";
    price: string;
    currency: string;
};
const today = () => {
    const d = new Date();
    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0")
    );
};
const LOAD_BODY_CATEGORY_LABELS: Record<
    string,
    Record<CatalogLocale, string>
> = {
    tent: { az: "Tent", ru: "Тент", en: "Curtainsider", tr: "Tent" },
    mega_tent: {
        az: "Mega tent",
        ru: "Мега-тент",
        en: "Mega curtainsider",
        tr: "Mega tent",
    },
    refrigerator: {
        az: "Soyuduculu yarımqoşqu",
        ru: "Рефрижератор",
        en: "Refrigerated trailer",
        tr: "Frigorifik",
    },
    car_carrier: {
        az: "Avtodaşıyan",
        ru: "Автовоз",
        en: "Car carrier",
        tr: "Araç taşıyıcı",
    },
    low_loader: {
        az: "Alçaq platformalı",
        ru: "Низкорамный трал",
        en: "Low loader",
        tr: "Lowbed",
    },
    container_carrier: {
        az: "Konteyner daşıyıcı",
        ru: "Контейнеровоз",
        en: "Container carrier",
        tr: "Konteyner taşıyıcı",
    },
    other: { az: "Digər", ru: "Другое", en: "Other", tr: "Diğer" },
};

function loadBodyCategoryLabel(
    category: string,
    locale: CatalogLocale,
): string {
    return (
        LOAD_BODY_CATEGORY_LABELS[category]?.[locale] ??
        category.replaceAll("_", " ")
    );
}

const initial: State = {
    cargo_type_id: "",
    from_country_id: "",
    from_location_id: "",
    from_location_name: "",
    to_country_id: "",
    to_location_id: "",
    to_location_name: "",
    weight_ton: "",
    volume_m3: "",
    count: "",
    load_vehicle_type_id: "",
    date_mode: "ready",
    pickup_from: today(),
    notes: "",
    price_mode: "negotiable",
    price: "",
    currency: "USD",
};

export default function LoadFormPage() {
    const { id } = useParams();
    const loadId = id ? Number(id) : null;
    const editing = loadId !== null && Number.isFinite(loadId);
    const navigate = useNavigate();
    const qc = useQueryClient();
    const catalogLocale = getCatalogLocale();
    const loadQuery = useLoad(editing ? loadId : null);
    const countriesQ = useQuery({
        queryKey: ["catalog", "countries", catalogLocale],
        queryFn: catalogApi.countries,
    });
    const cargoQ = useQuery({
        queryKey: ["catalog", "cargo-types"],
        queryFn: catalogApi.cargoTypes,
    });
    const bodiesQ = useQuery({
        queryKey: ["catalog", "load-vehicle-types", catalogLocale],
        queryFn: catalogApi.loadVehicleTypes,
    });
    const [form, setForm] = useState<State>(initial);
    const [target, setTarget] = useState<Target | null>(null);
    const [step, setStep] = useState<"country" | "city">("country");
    const [country, setCountry] = useState<Country | null>(null);
    const [search, setSearch] = useState("");
    const [bodyModalOpen, setBodyModalOpen] = useState(false);
    const [bodySearch, setBodySearch] = useState("");
    const [activeBodyCategory, setActiveBodyCategory] = useState<string | null>(
        null,
    );
    const modalCities = useQuery({
        queryKey: [
            "catalog",
            "locations",
            country?.id,
            "modal",
            search,
            catalogLocale,
        ],
        queryFn: () => catalogApi.locations(country!.id, search),
        enabled: !!country && step === "city",
    });
    const countries = countriesQ.data ?? [];
    const bodies = bodiesQ.data ?? [];
    const bodyGroups = useMemo(() => {
        const grouped = new Map<string, LoadVehicleType[]>();
        for (const body of bodies) {
            const items = grouped.get(body.category) ?? [];
            items.push(body);
            grouped.set(body.category, items);
        }
        return Array.from(grouped, ([key, items]) => ({
            key,
            label: loadBodyCategoryLabel(key, catalogLocale),
            imagePath: items[0]?.image_path ?? "",
            items,
        }));
    }, [bodies, catalogLocale]);
    const bodyGroupsFiltered = useMemo(() => {
        const query = bodySearch.trim().toLocaleLowerCase();
        if (!query) return bodyGroups;
        return bodyGroups.filter(
            (group) =>
                group.label.toLocaleLowerCase().includes(query) ||
                group.items.some((item) =>
                    item.name.toLocaleLowerCase().includes(query),
                ),
        );
    }, [bodyGroups, bodySearch]);
    const activeBodyGroup =
        bodyGroups.find((group) => group.key === activeBodyCategory) ?? null;
    const activeBodyItems = useMemo(() => {
        if (!activeBodyGroup) return [];
        const query = bodySearch.trim().toLocaleLowerCase();
        if (
            !query ||
            activeBodyGroup.label.toLocaleLowerCase().includes(query)
        ) {
            return activeBodyGroup.items;
        }
        return activeBodyGroup.items.filter((item) =>
            item.name.toLocaleLowerCase().includes(query),
        );
    }, [activeBodyGroup, bodySearch]);
    const cargo = (cargoQ.data ?? []).find(
        (x) => String(x.id) === form.cargo_type_id,
    );
    useEffect(() => {
        const l = loadQuery.data?.data;
        if (!l) return;
        setForm({
            cargo_type_id: String(l.cargo_type_id ?? ""),
            from_country_id: String(l.from_country_id),
            from_location_id: String(l.from_location_id ?? ""),
            from_location_name: l.from_location_name ?? "",
            to_country_id: String(l.to_country_id),
            to_location_id: String(l.to_location_id ?? ""),
            to_location_name: l.to_location_name ?? "",
            weight_ton: String(Number(l.weight_kg ?? 0) / 1000),
            volume_m3: String(l.volume_m3 ?? ""),
            count: String(l.quantity ?? l.pallets ?? ""),
            load_vehicle_type_id: String(l.load_vehicle_type_id ?? ""),
            date_mode: "choose",
            pickup_from: l.pickup_from ?? today(),
            notes: l.notes ?? "",
            price_mode: l.price_negotiable ? "negotiable" : "fixed",
            price: String(l.price ?? ""),
            currency: l.currency ?? "USD",
        });
    }, [loadQuery.data]);
    const mutation = useMutation({
        mutationFn: (p: CreateLoadPayload) =>
            editing ? loadsApi.update(loadId!, p) : loadsApi.create(p),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: loadsQueryKey }),
                qc.invalidateQueries({ queryKey: myLoadsQueryKey }),
            ]);
            navigate("/my/loads", { replace: true });
        },
    });
    function set<K extends keyof State>(key: K, value: State[K]) {
        setForm((v) => ({ ...v, [key]: value }));
    }
    function openPlace(t: Target) {
        setTarget(t);
        setStep("country");
        setCountry(null);
        setSearch("");
    }
    function pickCountry(c: Country) {
        setCountry(c);
        setStep("city");
        setSearch("");
    }
    function pickCity(city: Location | null) {
        if (!target || !country) return;
        setForm((v) =>
            target === "from"
                ? {
                      ...v,
                      from_country_id: String(country.id),
                      from_location_id: city ? String(city.id) : "",
                      from_location_name: city?.name ?? "",
                  }
                : {
                      ...v,
                      to_country_id: String(country.id),
                      to_location_id: city ? String(city.id) : "",
                      to_location_name: city?.name ?? "",
                  },
        );
        setTarget(null);
    }
    const countriesFiltered = useMemo(
        () =>
            countries.filter((x) =>
                x.name.toLowerCase().includes(search.toLowerCase()),
            ),
        [countries, search],
    );
    const citiesFiltered = useMemo(
        () =>
            (modalCities.data ?? []).filter((x) =>
                x.name.toLowerCase().includes(search.toLowerCase()),
            ),
        [modalCities.data, search],
    );
    const countryLabel = (id: string) =>
        countries.find((x) => String(x.id) === id)?.name ?? "Ölkə seçin";
    function submit(e: FormEvent) {
        e.preventDefault();
        const p: CreateLoadPayload = {
            title: cargo?.name ?? "Yük",
            cargo_type_id: Number(form.cargo_type_id),
            from_country_id: Number(form.from_country_id),
            from_location_id: Number(form.from_location_id) || null,
            to_country_id: Number(form.to_country_id),
            to_location_id: Number(form.to_location_id) || null,
            pickup_from:
                form.date_mode === "ready" ? today() : form.pickup_from,
            weight_kg: Number(form.weight_ton) * 1000,
            volume_m3: form.volume_m3 ? Number(form.volume_m3) : null,
            quantity: Number(form.count),
            load_vehicle_type_id: Number(form.load_vehicle_type_id),
            notes: form.notes.trim() || null,
            price:
                form.price_mode === "fixed" && form.price
                    ? Number(form.price)
                    : null,
            currency:
                form.price_mode === "fixed" && form.price
                    ? form.currency
                    : null,
            price_negotiable: form.price_mode === "negotiable",
            publish: true,
        };
        mutation.mutate(p);
    }
    const busy =
        countriesQ.isLoading ||
        cargoQ.isLoading ||
        bodiesQ.isLoading ||
        (editing && loadQuery.isLoading);
    const err = mutation.error as {
        response?: {
            data?: {
                error?: { message?: string };
                errors?: Record<string, string[]>;
                message?: string;
            };
        };
    } | null;
    const error =
        err?.response?.data?.error?.message ??
        (err?.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(" ")
            : err?.response?.data?.message) ??
        (mutation.isError ? "Elanı göndərmək mümkün olmadı." : "");
    return (
        <div className="app-shell" data-theme="light">
            <aside className="sidebar form-sidebar">
                <Link to="/" className="brand-lockup">
                    <img className="brand-logo" src={logoLight} alt="Yoldaş" />
                </Link>
                <nav className="sidebar-scroll">
                    <Link className="side-link" to="/my/loads">
                        <ArrowLeft size={18} /> Mənim elanlarım
                    </Link>
                </nav>
            </aside>
            <div className="workspace">
                <header className="topbar">
                    <div className="page-title">
                        <h1>
                            {editing ? "Elanı redaktə et" : "Yeni yük elanı"}
                        </h1>
                    </div>
                </header>
                <main className="content-area">
                    <section className="form-page">
                        <div className="form-page-heading">
                            <div>
                                <span className="overline">
                                    LOAD MANAGEMENT
                                </span>
                                <h2>Yeni yük elanı yaradın</h2>
                                <p>
                                    Yük məlumatlarını daxil edin və moderasiyaya
                                    göndərin.
                                </p>
                            </div>
                            <Link to="/my/loads" className="outline-action">
                                Geri qayıt
                            </Link>
                        </div>
                        {busy ? (
                            <div className="my-loads-state">
                                Məlumatlar yüklənir…
                            </div>
                        ) : (
                            <form
                                className="data-form load-ad-form"
                                onSubmit={submit}
                            >
                                <section className="data-form-section">
                                    <h3>Yük məlumatları</h3>
                                    <label className="data-field data-field-wide">
                                        <span>Yük növü *</span>
                                        <select
                                            required
                                            value={form.cargo_type_id}
                                            onChange={(e) =>
                                                set(
                                                    "cargo_type_id",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Yük növünü seçin
                                            </option>
                                            {(cargoQ.data ?? []).map((x) => (
                                                <option key={x.id} value={x.id}>
                                                    {x.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <div className="data-form-grid">
                                        <div className="data-field">
                                            <span>Haradan *</span>
                                            <button
                                                type="button"
                                                className="load-place-trigger"
                                                onClick={() =>
                                                    openPlace("from")
                                                }
                                            >
                                                <MapPin size={17} />
                                                {countryLabel(
                                                    form.from_country_id,
                                                )}
                                                {form.from_location_name
                                                    ? ", " +
                                                      form.from_location_name
                                                    : ""}
                                                <Search size={16} />
                                            </button>
                                        </div>
                                        <div className="data-field">
                                            <span>Haraya *</span>
                                            <button
                                                type="button"
                                                className="load-place-trigger"
                                                onClick={() => openPlace("to")}
                                            >
                                                <MapPin size={17} />
                                                {countryLabel(
                                                    form.to_country_id,
                                                )}
                                                {form.to_location_name
                                                    ? ", " +
                                                      form.to_location_name
                                                    : ""}
                                                <Search size={16} />
                                            </button>
                                        </div>
                                        <label className="data-field">
                                            <span>Çəki (ton) *</span>
                                            <input
                                                required
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={form.weight_ton}
                                                onChange={(e) =>
                                                    set(
                                                        "weight_ton",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Məs. 20"
                                            />
                                        </label>
                                        <label className="data-field">
                                            <span>Həcm (m³)</span>
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={form.volume_m3}
                                                onChange={(e) =>
                                                    set(
                                                        "volume_m3",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </label>
                                        <label className="data-field">
                                            <span>Say *</span>
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={form.count}
                                                onChange={(e) =>
                                                    set("count", e.target.value)
                                                }
                                            />
                                        </label>
                                    </div>
                                </section>
                                <section className="data-form-section">
                                    <h3>Yük yeri növü *</h3>
                                    <button
                                        type="button"
                                        className="load-place-trigger load-body-type-trigger"
                                        aria-haspopup="dialog"
                                        aria-expanded={bodyModalOpen}
                                        onClick={() => {
                                            setBodySearch("");
                                            setBodyModalOpen(true);
                                        }}
                                    >
                                        <span>
                                            {bodies.find(
                                                (x) =>
                                                    String(x.id) ===
                                                    form.load_vehicle_type_id,
                                            )?.name ?? "Yük yeri növünü seçin"}
                                        </span>
                                        <Search size={16} />
                                    </button>
                                </section>
                                <section className="data-form-section">
                                    <h3>Yükləmə tarixi</h3>
                                    <div className="load-choice-row">
                                        <label
                                            className={
                                                form.date_mode === "ready"
                                                    ? "load-choice is-selected"
                                                    : "load-choice"
                                            }
                                        >
                                            <input
                                                type="radio"
                                                checked={
                                                    form.date_mode === "ready"
                                                }
                                                onChange={() =>
                                                    set("date_mode", "ready")
                                                }
                                            />
                                            Yükləməyə hazır
                                        </label>
                                        <label
                                            className={
                                                form.date_mode === "choose"
                                                    ? "load-choice is-selected"
                                                    : "load-choice"
                                            }
                                        >
                                            <input
                                                type="radio"
                                                checked={
                                                    form.date_mode === "choose"
                                                }
                                                onChange={() =>
                                                    set("date_mode", "choose")
                                                }
                                            />
                                            Tarix seçin
                                        </label>
                                    </div>
                                    {form.date_mode === "choose" && (
                                        <label className="data-field load-date-field">
                                            <span>Yükləmə tarixi *</span>
                                            <input
                                                required
                                                type="date"
                                                min={today()}
                                                value={form.pickup_from}
                                                onChange={(e) =>
                                                    set(
                                                        "pickup_from",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </label>
                                    )}
                                </section>
                                <section className="data-form-section">
                                    <h3>Əlavə məlumat</h3>
                                    <label className="data-field data-field-wide">
                                        <textarea
                                            rows={4}
                                            maxLength={3000}
                                            value={form.notes}
                                            onChange={(e) =>
                                                set("notes", e.target.value)
                                            }
                                            placeholder="Əlavə məlumat…"
                                        />
                                    </label>
                                </section>
                                <section className="data-form-section">
                                    <h3>Qiymət</h3>
                                    <div className="load-choice-row">
                                        <label
                                            className={
                                                form.price_mode === "negotiable"
                                                    ? "load-choice is-selected"
                                                    : "load-choice"
                                            }
                                        >
                                            <input
                                                type="radio"
                                                checked={
                                                    form.price_mode ===
                                                    "negotiable"
                                                }
                                                onChange={() =>
                                                    set(
                                                        "price_mode",
                                                        "negotiable",
                                                    )
                                                }
                                            />
                                            Razılaşma ilə
                                        </label>
                                        <label
                                            className={
                                                form.price_mode === "fixed"
                                                    ? "load-choice is-selected"
                                                    : "load-choice"
                                            }
                                        >
                                            <input
                                                type="radio"
                                                checked={
                                                    form.price_mode === "fixed"
                                                }
                                                onChange={() =>
                                                    set("price_mode", "fixed")
                                                }
                                            />
                                            Qiymət təyin et
                                        </label>
                                    </div>
                                    {form.price_mode === "fixed" && (
                                        <div className="data-form-grid">
                                            <label className="data-field">
                                                <span>Qiymət *</span>
                                                <input
                                                    required
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.price}
                                                    onChange={(e) =>
                                                        set(
                                                            "price",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label className="data-field">
                                                <span>Valyuta</span>
                                                <input
                                                    disabled
                                                    value="USD"
                                                ></input>
                                            </label>
                                        </div>
                                    )}
                                </section>
                                {error && (
                                    <div className="form-error" role="alert">
                                        {error}
                                    </div>
                                )}
                                <div className="data-form-actions">
                                    <button
                                        type="submit"
                                        className="primary-button"
                                        disabled={
                                            mutation.isPending ||
                                            !form.cargo_type_id ||
                                            !form.from_country_id ||
                                            !form.to_country_id ||
                                            !form.load_vehicle_type_id
                                        }
                                    >
                                        {mutation.isPending
                                            ? "Göndərilir…"
                                            : "Moderasiyaya göndər"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </main>
            </div>
            {target && (
                <div
                    className="load-modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setTarget(null);
                    }}
                >
                    <section
                        className="load-place-modal"
                        role="dialog"
                        aria-modal="true"
                    >
                        <header>
                            <div>
                                <h3>
                                    {step === "country"
                                        ? "Ölkə seçin"
                                        : "Şəhər seçin"}
                                </h3>
                                <p>
                                    {step === "city"
                                        ? country?.name
                                        : "Əvvəlcə ölkə, sonra şəhər seçin"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTarget(null)}
                                aria-label="Bağla"
                            >
                                <X />
                            </button>
                        </header>
                        <label className="load-modal-search">
                            <Search size={18} />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={
                                    step === "country"
                                        ? "Ölkə axtar…"
                                        : "Şəhər axtar…"
                                }
                            />
                        </label>
                        <div className="load-modal-list">
                            {step === "country" ? (
                                countriesFiltered.map((c) => (
                                    <button
                                        type="button"
                                        key={c.id}
                                        onClick={() => pickCountry(c)}
                                    >
                                        {c.name}
                                        <small>{c.iso2}</small>
                                    </button>
                                ))
                            ) : (
                                <>
                                    {modalCities.isLoading ? (
                                        <p>Şəhərlər yüklənir…</p>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => pickCity(null)}
                                            >
                                                Şəhər göstərilməsin
                                            </button>
                                            {citiesFiltered.map((c) => (
                                                <button
                                                    type="button"
                                                    key={c.id}
                                                    onClick={() => pickCity(c)}
                                                >
                                                    {c.name}
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        {step === "city" && (
                            <button
                                type="button"
                                className="load-modal-back"
                                onClick={() => {
                                    setStep("country");
                                    setCountry(null);
                                    setSearch("");
                                }}
                            >
                                Ölkə siyahısına qayıt
                            </button>
                        )}
                    </section>
                </div>
            )}
            {bodyModalOpen && (
                <div
                    className="load-modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setBodyModalOpen(false);
                            setActiveBodyCategory(null);
                        }
                    }}
                >
                    <section
                        className="load-place-modal load-body-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="load-body-modal-title"
                    >
                        <header>
                            <div>
                                <h3 id="load-body-modal-title">
                                    {activeBodyGroup?.label ??
                                        "Yük yeri növünü seçin"}
                                </h3>
                                <p>
                                    {activeBodyGroup
                                        ? "Alt kateqoriyanı seçin"
                                        : "Əsas kateqoriyanı seçin"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setBodyModalOpen(false);
                                    setActiveBodyCategory(null);
                                }}
                                aria-label="Bağla"
                            >
                                <X />
                            </button>
                        </header>
                        <label className="load-modal-search">
                            <Search size={18} />
                            <input
                                autoFocus
                                value={bodySearch}
                                onChange={(e) => setBodySearch(e.target.value)}
                                placeholder="Kateqoriya və ya növ axtar…"
                            />
                        </label>
                        {!activeBodyGroup ? (
                            <div className="load-body-category-grid">
                                {bodyGroupsFiltered.map((group) => (
                                    <button
                                        type="button"
                                        key={group.key}
                                        className="load-body-category-card"
                                        onClick={() =>
                                            setActiveBodyCategory(group.key)
                                        }
                                    >
                                        {getVehicleTypeImage(group.imagePath) && (
                                            <img
                                                src={getVehicleTypeImage(group.imagePath)}
                                                alt={group.label}
                                            />
                                        )}
                                        <span>{group.label}</span>
                                        <small>
                                            {group.items.length} alt növ
                                        </small>
                                    </button>
                                ))}
                                {bodyGroupsFiltered.length === 0 && (
                                    <p className="load-body-empty">
                                        Uyğun kateqoriya və ya növ tapılmadı.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="load-body-subcategory-list">
                                    {activeBodyItems.map((item) => (
                                        <button
                                            type="button"
                                            key={item.id}
                                            className={
                                                form.load_vehicle_type_id ===
                                                String(item.id)
                                                    ? "load-body-subcategory-option is-selected"
                                                    : "load-body-subcategory-option"
                                            }
                                            onClick={() => {
                                                set(
                                                    "load_vehicle_type_id",
                                                    String(item.id),
                                                );
                                                setBodyModalOpen(false);
                                                setActiveBodyCategory(null);
                                            }}
                                        >
                                            <span>{item.name}</span>
                                            {item.capacity_m3 ? (
                                                <small>
                                                    {item.capacity_m3} m³
                                                </small>
                                            ) : null}
                                        </button>
                                    ))}
                                    {activeBodyItems.length === 0 && (
                                        <p className="load-body-empty">
                                            Bu kateqoriyada uyğun növ tapılmadı.
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="load-modal-back"
                                    onClick={() => setActiveBodyCategory(null)}
                                >
                                    Əsas kateqoriyalara qayıt
                                </button>
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
