import { Bell, Bookmark, ChevronDown, LogOut, Menu, Moon, Sun } from 'lucide-react'
import { CountryFlag } from './CountryFlag'

interface MarketplaceTopbarProps {
  page: string
  theme: 'light' | 'dark'
  country: string
  onCountryChange: (country: string) => void
  onNavigate: (label: string) => void
  onToggleTheme: () => void
  onToggleNotices: () => void
  onToggleMobileMenu: () => void
}

export function MarketplaceTopbar({
  page,
  theme,
  country,
  onCountryChange,
  onNavigate,
  onToggleTheme,
  onToggleNotices,
  onToggleMobileMenu,
}: MarketplaceTopbarProps) {
  return (
    <header className="topbar">
                        <button
                            className="mobile-menu-trigger icon-button"
                            onClick={() => onToggleMobileMenu()}
                        >
                            <Menu />
                        </button>
                        <div className="page-title">
                            <h1>{page}</h1>
                        </div>
                        <div className="top-actions">
                            <label className="country-select">
                                <span className="country-select-value">
                                    <CountryFlag flag={country.split(" ")[0]} />
                                    {country
                                        .replace(country.split(" ")[0], "")
                                        .trim()}
                                </span>
                                <select
                                    aria-label="Ölkə seçimi"
                                    value={country}
                                    onChange={(e) => onCountryChange(e.target.value)}
                                >
                                    <option value="AZ Azərbaycanca">
                                        Azərbaycan
                                    </option>
                                    <option value="RU Русский">
                                        Русский
                                    </option>
                                    <option value="TR Türkçe">
                                        Türkiyə
                                    </option>
                                    <option value="GB English">
                                        English
                                    </option>
                                </select>
                                <ChevronDown size={15} />
                            </label>
                            <button
                                className="icon-button desktop-only"
                                aria-label="Yadda saxlanılanlar"
                                onClick={() => onNavigate("Yadda saxlanılanlar")}
                            >
                                <Bookmark />
                            </button>
                            <div className="notice-wrap">
                                <button
                                    className="icon-button"
                                    aria-label="Bildirişlər"
                                    onClick={() => onToggleNotices()}
                                >
                                    <Bell />
                                    <i className="notification-dot" />
                                </button>
                                {showNotices && (
                                    <div className="notice-popover">
                                        <strong>Bildirişlər</strong>
                                        <p>
                                            Yeni elanlar və müraciət yenilikləri
                                            burada görünəcək.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <button
                                className="theme-toggle"
                                onClick={() =>
                                    onToggleTheme()
                                }
                                aria-label="Mövzunu dəyiş"
                            >
                                {theme === "light" ? (
                                    <Moon size={17} />
                                ) : (
                                    <Sun size={17} />
                                )}
                            </button>
                            <button className="login-button">
                                <LogOut size={16} /> Daxil ol
                            </button>
                        </div>
                    </header>
  )
}
