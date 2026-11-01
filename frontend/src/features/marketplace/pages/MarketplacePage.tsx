import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, MapPin, Package, Truck, MessageSquare, Plus, ChevronDown, Check, Flag, LayoutGrid, ListFilter, ArrowRight } from "lucide-react";
import { pagePaths, primaryNav, secondaryNav } from "../config/navigation";
import { listings, type Listing } from "../data/listings";
import { CountryFlag } from "../components/CountryFlag";
import { ListingCard } from "../components/ListingCard";
import { DetailDialog } from "../components/DetailDialog";
import { MarketplaceSidebar } from "../components/MarketplaceSidebar";
import { MarketplaceTopbar } from "../components/MarketplaceTopbar";
import { MarketplaceMobileNav } from "../components/MarketplaceMobileNav";
export default function MarketplacePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname.replace(/\/+$/, "") || "/";
    const page = Object.entries(pagePaths).find(([, path]) => path === currentPath)?.[0] ?? "Bütün elanlar";
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [kind, setKind] = useState<"load" | "vehicle">("load");
    const [query, setQuery] = useState("");
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [sort, setSort] = useState("Əvvəlcə yenilər");
    const [country, setCountry] = useState("🇦🇿 Azərbaycan");
    const [selected, setSelected] = useState<Listing | null>(null);
    const [saved, setSaved] = useState<string[]>([]);
    const [showNotices, setShowNotices] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const filtered = useMemo(
        () =>
            listings.filter(
                (x) =>
                    x.kind === kind &&
                    [x.from, x.to, x.cargo, x.source, x.vehicle]
                        .join(" ")
                        .toLocaleLowerCase("az")
                        .includes(query.toLocaleLowerCase("az")) &&
                    (!origin ||
                        x.from
                            .toLocaleLowerCase("az")
                            .includes(origin.toLocaleLowerCase("az"))) &&
                    (!destination ||
                        x.to
                            .toLocaleLowerCase("az")
                            .includes(destination.toLocaleLowerCase("az"))),
            ),
        [kind, query, origin, destination],
    );
    const changePage = (label: string) => {
        navigate(pagePaths[label] ?? "/");
        setShowMobileMenu(false);
    };
    const toggleSaved = (id: string) =>
        setSaved((s) =>
            s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
        );
    const isMap = page === "Yük xəritəsi";
    return (
        <div className="app-shell" data-theme={theme}>
            <MarketplaceSidebar theme={theme} page={page} onNavigate={changePage} />
            <div className="workspace">
                <MarketplaceTopbar
                    page={page}
                    theme={theme}
                    country={country}
                    onCountryChange={setCountry}
                    onNavigate={changePage}
                    onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
                    onToggleNotices={() => setShowNotices(!showNotices)}
                    onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
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
                                    <Package size={18} /> Yüklər <b>7 156</b>
                                </button>
                                <button
                                    className={
                                        kind === "vehicle" ? "active" : ""
                                    }
                                    onClick={() => setKind("vehicle")}
                                >
                                    <Truck size={18} /> Maşınlar <b>606</b>
                                </button>
                            </div>
                            <section className="search-tools">
                                <label className="search-field">
                                    <Truck size={18} />
                                    <input
                                        placeholder="Nəqliyyat növünü seçin"
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                    />
                                </label>
                                <label className="search-field">
                                    <MapPin size={18} />
                                    <input
                                        placeholder="Haradan"
                                        value={origin}
                                        onChange={(e) =>
                                            setOrigin(e.target.value)
                                        }
                                    />
                                </label>
                                <label className="search-field">
                                    <Flag size={18} />
                                    <input
                                        placeholder="Haraya"
                                        value={destination}
                                        onChange={(e) =>
                                            setDestination(e.target.value)
                                        }
                                    />
                                </label>
                                <button
                                    className={
                                        "filter-button " +
                                        (filterOpen ? "filter-on" : "")
                                    }
                                    onClick={() => setFilterOpen(!filterOpen)}
                                >
                                    <SlidersHorizontal size={17} /> Daha çox{" "}
                                    <ChevronDown size={15} />
                                </button>
                                <button className="filter-button channel-filter">
                                    <MessageSquare size={16} />{" "}
                                    <Check size={15} />
                                    <span>WhatsApp-dan</span>
                                </button>
                                <label className="sort-select">
                                    <ListFilter size={16} />
                                    <select
                                        value={sort}
                                        onChange={(e) =>
                                            setSort(e.target.value)
                                        }
                                    >
                                        <option>Əvvəlcə yenilər</option>
                                        <option>Əvvəlcə köhnələr</option>
                                    </select>
                                    <ChevronDown size={14} />
                                </label>
                            </section>
                            {filterOpen && (
                                <section className="expanded-filters">
                                    <div>
                                        <strong>Elan filtrləri</strong>
                                        <small>Nəticələri dəqiqləşdirin</small>
                                    </div>
                                    <label>
                                        <span>Minimum çəki</span>
                                        <input placeholder="ton" />
                                    </label>
                                    <label>
                                        <span>Maksimum çəki</span>
                                        <input placeholder="ton" />
                                    </label>
                                    <label>
                                        <span>Yük növü</span>
                                        <select>
                                            <option>Bütün növlər</option>
                                            <option>Qida</option>
                                            <option>
                                                Tikinti materialları
                                            </option>
                                        </select>
                                    </label>
                                    <button
                                        className="text-action"
                                        onClick={() => {
                                            setOrigin("");
                                            setDestination("");
                                            setQuery("");
                                        }}
                                    >
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
                                                {kind === "load"
                                                    ? "7 156"
                                                    : "606"}
                                            </strong>{" "}
                                            aktiv elan
                                        </span>
                                        <i />
                                        <span>
                                            <strong>+238</strong> son 1 saatda
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
                            <div className="results-heading">
                                <div>
                                    
                                    <h2>
                                        {kind === "load"
                                            ? "Bütün yük elanları"
                                            : "Boş nəqliyyat vasitələri"}{" "}
                                        <span className="span-round">{filtered.length}</span>
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
                                {filtered.length ? (
                                    filtered.map((item) => (
                                        <ListingCard
                                            key={item.id}
                                            item={item}
                                            onSelect={() => setSelected(item)}
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
            <MarketplaceMobileNav page={page} onNavigate={changePage} onToggleMore={() => setShowMobileMenu(!showMobileMenu)} />
            <button className="mobile-create" aria-label="Elan yerləşdir">
                <Plus size={21} />
            </button>
            <DetailDialog item={selected} onClose={() => setSelected(null)} />
        </div>
    );
}
