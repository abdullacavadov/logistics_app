import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Archive,
    ArrowDownToLine,
    CircleAlert,
    Clock3,
    FilePlus2,
    Package,
    RefreshCw,
} from "lucide-react";
import {
    useMyLoads,
    useCancelLoad,
    useArchiveLoad,
} from "./hooks/useLoads";
import type { Load, LoadStatus } from "./types";
import type { Listing } from "../marketplace/types";
import { ListingCard } from "../marketplace/components/ListingCard";
import { MarketplaceSidebar } from "../marketplace/components/MarketplaceSidebar";
import { MarketplaceTopbar } from "../marketplace/components/MarketplaceTopbar";
import { MarketplaceMobileNav } from "../marketplace/components/MarketplaceMobileNav";
import {
    primaryNav,
    secondaryNav,
    pagePaths,
} from "../marketplace/config/navigation";
import { useAuth, useLogout } from "../auth/hooks/useAuth";

type OwnerStatus = "pending" | "published" | "rejected";

function getOwnerStatus(status: LoadStatus): { label: string; tone: OwnerStatus } {
    if (status === "rejected") {
        return { label: "Rədd edildi", tone: "rejected" };
    }

    if (["published", "has_applications", "agreed", "in_transit", "completed"].includes(status)) {
        return { label: "Dərc edildi", tone: "published" };
    }

    return { label: "Moderasiya gözləyir", tone: "pending" };
}

function formatDate(value: string | null | undefined): string | null {
    if (!value) return null;
    const datePart = value.includes("T") ? value.split("T")[0] : value;
    const match = datePart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!match) return value;
    const [, year, month, day] = match;
    return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

function formatDateTime(value: string): string {
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

function toListing(load: Load): Listing {
    const application = String(load.applications ?? "").toLowerCase();

    return {
        id: `YD-${load.id}`,
        title: load.title,
        from: load.from_name ?? load.from_country_name ?? "—",
        to: load.to_name ?? load.to_country_name ?? "—",
        fromFlag: load.from_country_iso2 ?? "",
        toFlag: load.to_country_iso2 ?? "",
        cargo: load.cargo_type_name ?? "Digər yük",
        weight: `${(Number(load.weight_kg) / 1000).toLocaleString("az-AZ", { maximumFractionDigits: 2 })} ton`,
        vehicle: load.load_vehicle_type_name ?? load.vehicle_type_name ?? "Nəqliyyat növü göstərilməyib",
        price: load.price === null
            ? "Razılaşma ilə"
            : `${Number(load.price).toLocaleString("az-AZ")} ${load.currency ?? ""}`.trim(),
        application: application === "whatsapp"
            ? "WhatsApp-dan"
            : application === "telegram"
                ? "Telegram-dan"
                : "Saytdan",
        date: formatDateTime(load.created_at),
        isReadyForLoading: Boolean(load.is_ready_for_loading),
        pickupDate: load.is_ready_for_loading ? null : formatDate(load.pickup_from),
        pickupTo: formatDate(load.pickup_to),
        deliveryBy: formatDate(load.delivery_by),
        volume: load.volume_m3 === null ? null : `${Number(load.volume_m3).toLocaleString("az-AZ")} m³`,
        quantity: load.quantity ?? null,
        pallets: load.pallets ?? null,
        source: "Sayt",
        kind: "load",
    };
}

export default function MyLoadsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const logout = useLogout();
    const loads = useMyLoads({ per_page: 50 });
    const cancel = useCancelLoad();
    const archive = useArchiveLoad();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [showNotices, setShowNotices] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const rows = loads.data?.data ?? [];
    const page = Object.entries(pagePaths).find(
        ([, path]) => path === location.pathname,
    )?.[0] ?? "Mənim elanlarım";

    const changePage = (label: string) => {
        navigate(pagePaths[label] ?? "/");
        setShowMobileMenu(false);
    };

    return (
        <div className="app-shell" data-theme={theme}>
            <MarketplaceSidebar theme={theme} page={page} onNavigate={changePage} />
            <div className="workspace">
                <MarketplaceTopbar
                    page={page}
                    theme={theme}
                    country="🇦🇿 Azərbaycan"
                    onCountryChange={() => undefined}
                    onNavigate={changePage}
                    onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
                    showNotices={showNotices}
                    onToggleNotices={() => setShowNotices(!showNotices)}
                    onLogin={() => navigate("/login")}
                    userName={auth.data?.data.user.name ?? null}
                    onLogout={() => logout.mutate()}
                    onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
                />
                {showMobileMenu && (
                    <div className="mobile-menu-panel">
                        {primaryNav.map(({ label, icon: Icon }) => (
                            <button key={label} onClick={() => changePage(label)}>
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                        <div className="nav-divider" />
                        {secondaryNav.map(({ label, icon: Icon }) => (
                            <button key={label} onClick={() => changePage(label)}>
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>
                )}
                <main className="content-area my-loads-page">
                    <section className="my-loads-hero">
                        <div>
                            <span className="overline">LOAD MANAGEMENT</span>
                            <h2>Mənim elanlarım</h2>
                            <p>Yerləşdirdiyiniz yükləri, statusları və müraciətləri bir məkandan idarə edin.</p>
                        </div>
                        <button className="primary-button" onClick={() => navigate("/loads/new")}>
                            <FilePlus2 size={17} /> Yeni elan yarat
                        </button>
                    </section>

                    <section className="my-loads-stats" aria-label="Elan statistikası">
                        <article>
                            <span className="my-loads-stat-icon"><Package size={18} /></span>
                            <div><small>Ümumi elan</small><strong>{loads.isLoading ? "—" : rows.length}</strong></div>
                        </article>
                        <article>
                            <span className="my-loads-stat-icon is-active"><Clock3 size={18} /></span>
                            <div><small>Aktiv elan</small><strong>{rows.filter((load) => ["published", "has_applications", "agreed", "in_transit"].includes(load.status)).length}</strong></div>
                        </article>
                        <article>
                            <span className="my-loads-stat-icon is-archived"><Archive size={18} /></span>
                            <div><small>Arxiv / tamamlanan</small><strong>{rows.filter((load) => ["archived", "completed"].includes(load.status)).length}</strong></div>
                        </article>
                    </section>

                    <section className="my-loads-section">
                        <div className="my-loads-section-heading">
                            <div>
                                <h3>Bütün elanlar</h3>
                                <p>{loads.isLoading ? "Məlumatlar yüklənir" : `${rows.length} elan göstərilir`}</p>
                            </div>
                            <button className="my-loads-refresh" onClick={() => loads.refetch()} disabled={loads.isFetching}>
                                <RefreshCw size={15} className={loads.isFetching ? "is-spinning" : ""} />
                                Yenilə
                            </button>
                        </div>

                        {loads.isLoading ? (
                            <div className="my-loads-state">
                                <span className="my-loads-loader" />
                                <strong>Elanlar yüklənir…</strong>
                                <p>Məlumatlarınız hazırlanır.</p>
                            </div>
                        ) : loads.isError ? (
                            <div className="my-loads-state">
                                <CircleAlert size={30} />
                                <strong>Elanları yükləmək mümkün olmadı</strong>
                                <p>Server bağlantısını yoxlayın və yenidən cəhd edin.</p>
                                <button className="outline-action" onClick={() => loads.refetch()}>Yenidən yoxla</button>
                            </div>
                        ) : rows.length === 0 ? (
                            <div className="my-loads-state">
                                <span className="my-loads-empty-icon"><Package size={30} /></span>
                                <strong>Hələ elanınız yoxdur</strong>
                                <p>İlk yük elanınızı yaradın və uyğun daşıyıcılarla əlaqə qurun.</p>
                                <button className="primary-button" onClick={() => navigate("/loads/new")}>
                                    <FilePlus2 size={16} /> İlk elanı yarat
                                </button>
                            </div>
                        ) : (
                            <div className="listing-grid my-loads-card-grid">
                                {rows.map((load) => (
                                    <ListingCard
                                        key={load.id}
                                        item={toListing(load)}
                                        saved={false}
                                        onSave={() => undefined}
                                        onSelect={() => navigate(`/loads/${load.id}/edit`)}
                                        status={getOwnerStatus(load.status)}
                                        footerAction={
                                            <div className="my-load-actions">
                                                <button className="outline-action" onClick={() => navigate(`/loads/${load.id}/edit`)}>
                                                    Redaktə et
                                                </button>
                                                {["draft", "pending_moderation", "published", "has_applications", "agreed"].includes(load.status) && (
                                                    <button className="outline-action is-danger" disabled={cancel.isPending} onClick={() => cancel.mutate(load.id)}>
                                                        Ləğv et
                                                    </button>
                                                )}
                                                {["draft", "pending_moderation", "rejected", "published", "has_applications", "completed", "cancelled"].includes(load.status) && (
                                                    <button className="icon-button my-load-archive" title="Arxivlə" aria-label="Arxivlə" disabled={archive.isPending} onClick={() => archive.mutate(load.id)}>
                                                        <ArrowDownToLine size={17} />
                                                    </button>
                                                )}
                                            </div>
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
            <MarketplaceMobileNav
                page={page}
                onNavigate={changePage}
                onToggleMore={() => setShowMobileMenu(!showMobileMenu)}
            />
        </div>
    );
}
