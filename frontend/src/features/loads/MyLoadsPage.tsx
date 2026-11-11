import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Archive,
    ArrowDownToLine,
    ArrowRight,
    CircleAlert,
    Clock3,
    FilePlus2,
    Package,
    RefreshCw,
    Truck,
} from "lucide-react";
import {
    useMyLoads,
    usePublishLoad,
    useCancelLoad,
    useArchiveLoad,
} from "./hooks/useLoads";
import type { LoadStatus } from "./types";
import { MarketplaceSidebar } from "../marketplace/components/MarketplaceSidebar";
import { MarketplaceTopbar } from "../marketplace/components/MarketplaceTopbar";
import { MarketplaceMobileNav } from "../marketplace/components/MarketplaceMobileNav";
import {
    primaryNav,
    secondaryNav,
    pagePaths,
} from "../marketplace/config/navigation";
import { useAuth, useLogout } from "../auth/hooks/useAuth";

const statusLabels: Record<LoadStatus, string> = {
    draft: "Qaralama",
    pending_moderation: "Moderasiya gözləyir",
    rejected: "Rədd edilib",
    published: "Dərc olunub",
    has_applications: "Müraciətlər var",
    agreed: "Razılaşdırılıb",
    in_transit: "Daşınır",
    completed: "Tamamlanıb",
    cancelled: "Ləğv edilib",
    archived: "Arxivdə",
};

export default function MyLoadsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const logout = useLogout();
    const loads = useMyLoads({ per_page: 50 });
    const publish = usePublishLoad();
    const cancel = useCancelLoad();
    const archive = useArchiveLoad();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [showNotices, setShowNotices] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const rows = loads.data?.data ?? [];
    const page =
        Object.entries(pagePaths).find(
            ([, path]) => path === location.pathname,
        )?.[0] ?? "Mənim elanlarım";

    const changePage = (label: string) => {
        navigate(pagePaths[label] ?? "/");
        setShowMobileMenu(false);
    };

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
                    country="🇦🇿 Azərbaycan"
                    onCountryChange={() => undefined}
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
                <main className="content-area my-loads-page">
                    <section className="my-loads-hero">
                        <div>
                            <span className="overline">LOAD MANAGEMENT</span>
                            <h2>Mənim elanlarım</h2>
                            <p>
                                Yerləşdirdiyiniz yükləri, statusları və
                                müraciətləri bir məkandan idarə edin.
                            </p>
                        </div>
                        <button
                            className="primary-button"
                            onClick={() => navigate("/loads/new")}
                        >
                            <FilePlus2 size={17} /> Yeni elan yarat
                        </button>
                    </section>

                    <section
                        className="my-loads-stats"
                        aria-label="Elan statistikası"
                    >
                        <article>
                            <span className="my-loads-stat-icon">
                                <Package size={18} />
                            </span>
                            <div>
                                <small>Ümumi elan</small>
                                <strong>
                                    {loads.isLoading ? "—" : rows.length}
                                </strong>
                            </div>
                        </article>
                        <article>
                            <span className="my-loads-stat-icon is-active">
                                <Clock3 size={18} />
                            </span>
                            <div>
                                <small>Aktiv elan</small>
                                <strong>
                                    {
                                        rows.filter((load) =>
                                            [
                                                "published",
                                                "has_applications",
                                                "agreed",
                                                "in_transit",
                                            ].includes(load.status),
                                        ).length
                                    }
                                </strong>
                            </div>
                        </article>
                        <article>
                            <span className="my-loads-stat-icon is-archived">
                                <Archive size={18} />
                            </span>
                            <div>
                                <small>Arxiv / tamamlanan</small>
                                <strong>
                                    {
                                        rows.filter((load) =>
                                            ["archived", "completed"].includes(
                                                load.status,
                                            ),
                                        ).length
                                    }
                                </strong>
                            </div>
                        </article>
                    </section>

                    <section className="my-loads-section">
                        <div className="my-loads-section-heading">
                            <div>
                                <h3>Bütün elanlar</h3>
                                <p>
                                    {loads.isLoading
                                        ? "Məlumatlar yüklənir"
                                        : `${rows.length} elan göstərilir`}
                                </p>
                            </div>
                            <button
                                className="my-loads-refresh"
                                onClick={() => loads.refetch()}
                                disabled={loads.isFetching}
                            >
                                <RefreshCw
                                    size={15}
                                    className={
                                        loads.isFetching ? "is-spinning" : ""
                                    }
                                />{" "}
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
                                <p>
                                    Server bağlantısını yoxlayın və yenidən cəhd
                                    edin.
                                </p>
                                <button
                                    className="outline-action"
                                    onClick={() => loads.refetch()}
                                >
                                    Yenidən yoxla
                                </button>
                            </div>
                        ) : rows.length === 0 ? (
                            <div className="my-loads-state">
                                <span className="my-loads-empty-icon">
                                    <Package size={30} />
                                </span>
                                <strong>Hələ elanınız yoxdur</strong>
                                <p>
                                    İlk yük elanınızı yaradın və uyğun
                                    daşıyıcılarla əlaqə qurun.
                                </p>
                                <button
                                    className="primary-button"
                                    disabled
                                    title="Elan yaratma formu növbəti mərhələdə qoşulacaq"
                                >
                                    <FilePlus2 size={16} /> İlk elanı yarat
                                </button>
                            </div>
                        ) : (
                            <div className="my-loads-list">
                                {rows.map((load) => (
                                    <article
                                        className="my-load-card"
                                        key={load.id}
                                    >
                                        <div className="my-load-card-main">
                                            <div className="my-load-card-top">
                                                <span className="my-load-id">
                                                    #YD-{load.id}
                                                </span>
                                                <span
                                                    className={`my-load-status status-${load.status}`}
                                                >
                                                    {statusLabels[load.status]}
                                                </span>
                                                <span className="my-load-date">
                                                    {new Date(
                                                        load.created_at,
                                                    ).toLocaleDateString(
                                                        "az-AZ",
                                                        {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            <h4>{load.title}</h4>
                                            <div className="my-load-route">
                                                <div>
                                                    <span className="my-load-route-dot" />
                                                    <span>
                                                        <small>YÜKLƏMƏ</small>
                                                        <strong>
                                                            {load.from_name ??
                                                                load.from_country_name ??
                                                                "—"}
                                                        </strong>
                                                    </span>
                                                </div>
                                                <span className="my-load-route-line">
                                                    <ArrowRight size={17} />
                                                </span>
                                                <div>
                                                    <span className="my-load-route-dot destination-dot" />
                                                    <span>
                                                        <small>TƏYİNAT</small>
                                                        <strong>
                                                            {load.to_name ??
                                                                load.to_country_name ??
                                                                "—"}
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="my-load-meta">
                                                <span>
                                                    <Package size={14} />{" "}
                                                    {(
                                                        Number(load.weight_kg) /
                                                        1000
                                                    ).toLocaleString(
                                                        "az-AZ",
                                                    )}{" "}
                                                    ton
                                                </span>
                                                <span>
                                                    <Truck size={14} />{" "}
                                                    {load.vehicle_type_name ??
                                                        "Nəqliyyat göstərilməyib"}
                                                </span>
                                                <span>{load.pickup_from}</span>
                                            </div>
                                        </div>
                                        <div className="my-load-card-aside">
                                            <small>Göstərilən qiymət</small>
                                            <strong>
                                                {load.price === null
                                                    ? "Razılaşma ilə"
                                                    : `${Number(load.price).toLocaleString("az-AZ")} ${load.currency ?? ""}`}
                                            </strong>
                                            <div className="my-load-actions">
                                                <button
                                                    className="outline-action"
                                                    onClick={() =>
                                                        navigate(
                                                            `/loads/${load.id}/edit`,
                                                        )
                                                    }
                                                >
                                                    Redaktə et
                                                </button>
                                                {load.status === "draft" && (
                                                    <button
                                                        className="outline-action"
                                                        disabled={
                                                            publish.isPending
                                                        }
                                                        onClick={() =>
                                                            publish.mutate(
                                                                load.id,
                                                            )
                                                        }
                                                    >
                                                        Dərc et
                                                    </button>
                                                )}
                                                {[
                                                    "draft",
                                                    "published",
                                                    "has_applications",
                                                    "agreed",
                                                ].includes(load.status) && (
                                                    <button
                                                        className="outline-action is-danger"
                                                        disabled={
                                                            cancel.isPending
                                                        }
                                                        onClick={() =>
                                                            cancel.mutate(
                                                                load.id,
                                                            )
                                                        }
                                                    >
                                                        Ləğv et
                                                    </button>
                                                )}
                                                {[
                                                    "draft",
                                                    "published",
                                                    "completed",
                                                    "cancelled",
                                                ].includes(load.status) && (
                                                    <button
                                                        className="icon-button my-load-archive"
                                                        title="Arxivlə"
                                                        aria-label="Arxivlə"
                                                        disabled={
                                                            archive.isPending
                                                        }
                                                        onClick={() =>
                                                            archive.mutate(
                                                                load.id,
                                                            )
                                                        }
                                                    >
                                                        <ArrowDownToLine
                                                            size={17}
                                                        />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
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
