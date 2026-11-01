import { House, Map, MessageSquare, MoreHorizontal, Network } from 'lucide-react'

interface MarketplaceMobileNavProps {
  page: string
  onNavigate: (label: string) => void
  onToggleMore: () => void
}

export function MarketplaceMobileNav({ page, onNavigate, onToggleMore }: MarketplaceMobileNavProps) {
  const isMap = page === 'Yük xəritəsi'

  return (
    <nav className="mobile-bottom-nav">
                    <button
                        className={page === "Bütün elanlar" ? "active" : ""}
                        onClick={() => onNavigate("Bütün elanlar")}
                    >
                        <House />
                        <small>Əsas</small>
                    </button>
                    <button
                        className={page === "Xidmətlərimiz" ? "active" : ""}
                        onClick={() => onNavigate("Xidmətlərimiz")}
                    >
                        <Network />
                        <small>Xidmətlər</small>
                    </button>
                    <button
                        className={"mobile-map-tab " + (isMap ? "active" : "")}
                        onClick={() => onNavigate("Yük xəritəsi")}
                    >
                        <span>
                            <Map size={23} />
                        </span>
                        <small>Xəritə</small>
                    </button>
                    <button
                        onClick={() => onNavigate("Mesajlar")}
                        className={page === "Mesajlar" ? "active" : ""}
                    >
                        <MessageSquare />
                        <small>Mesajlar</small>
                    </button>
                    <button onClick={() => onToggleMore()}>
                        <MoreHorizontal />
                        <small>Daha çox</small>
                    </button>
                </nav>
  )
}
