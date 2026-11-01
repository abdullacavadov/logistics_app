import logoLight from '../../../assets/img/logo-light.png'
import logoDark from '../../../assets/img/logo-dark.png'
import { primaryNav, secondaryNav } from '../config/navigation'

interface MarketplaceSidebarProps {
  theme: 'light' | 'dark'
  page: string
  onNavigate: (label: string) => void
}

export function MarketplaceSidebar({ theme, page, onNavigate }: MarketplaceSidebarProps) {
  return (
    <aside className="sidebar">
                    <button
                        className="brand-lockup"
                        onClick={() => onNavigate("Bütün elanlar")}
                        aria-label="Yoldaş — Bütün elanlar"
                    >
                        <img
                            className="brand-logo"
                            src={theme === "dark" ? logoDark : logoLight}
                            alt="Yoldaş"
                        />
                    </button>
                    <div className="sidebar-scroll">
                        <div className="nav-group">
                            {primaryNav.map(({ label, icon: Icon }) => (
                                <button
                                    key={label}
                                    className={
                                        "side-link " +
                                        (page === label ? "selected" : "")
                                    }
                                    onClick={() => onNavigate(label)}
                                >
                                    <Icon size={19} />
                                    <span>{label}</span>
                                    {label === "Bütün elanlar" && (
                                        <i className="nav-indicator" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="nav-divider" />
                        <div className="nav-group muted-group">
                            {secondaryNav.map(({ label, icon: Icon }) => (
                                <button
                                    key={label}
                                    className={
                                        "side-link " +
                                        (page === label ? "selected" : "")
                                    }
                                    onClick={() => onNavigate(label)}
                                >
                                    <Icon size={18} />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="sidebar-version">
                        <span className="status-light" /> LogisticsApp{" "}
                        <span>v1.0</span>
                    </div>
                </aside>
  )
}
