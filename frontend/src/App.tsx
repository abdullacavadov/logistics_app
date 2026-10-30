import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import {
  ArrowDownRight, ArrowUpRight, Bell, Box, Building2, ChevronDown,
  CircleHelp, Command, Compass, LayoutDashboard, MapPinned, Menu,
  Package, Plus, Search, Settings2, Truck, Users, Wallet,
} from 'lucide-react'

const navigation = [
  { label: 'İcmal', to: '/', icon: LayoutDashboard },
  { label: 'Yüklər', to: '/loads', icon: Package, count: '128' },
  { label: 'Daşıyıcılar', to: '/carriers', icon: Truck },
  { label: 'Nəqliyyat', to: '/vehicles', icon: Box },
  { label: 'Müraciətlər', to: '/applications', icon: Users, count: '12' },
  { label: 'Biznes məkanları', to: '/business-places', icon: Building2 },
]
const secondary = [
  { label: 'Xəritə', to: '/map', icon: MapPinned },
  { label: 'Abunəlik və ödəniş', to: '/subscription', icon: Wallet },
  { label: 'Tənzimləmələr', to: '/settings', icon: Settings2 },
]

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark"><Command size={21} strokeWidth={2.4} /></div><div><strong>logistics<span>app</span></strong><small>LOGISTICS NETWORK</small></div></div>
    <div className="workspace"><div className="workspace-avatar">N</div><div className="workspace-copy"><strong>Northstar Logistics</strong><small>İş sahəsi</small></div><ChevronDown size={15} /></div>
    <div className="nav-label">İŞ MASASI</div>
    <nav>{navigation.map(({ label, to, icon: Icon, count }) => <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span>{count && <small className="nav-count">{count}</small>}</NavLink>)}</nav>
    <div className="nav-label secondary-label">İDARƏETMƏ</div>
    <nav>{secondary.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
    <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><strong>Kömək lazımdır?</strong><p>Komandamız sizə dəstək olmağa hazırdır.</p><button>Yardım mərkəzi <ArrowUpRight size={13} /></button></div><div className="profile"><div className="profile-avatar">AC</div><div className="profile-copy"><strong>Admin hesabı</strong><small>Administrator</small></div><ChevronDown size={15} /></div></div>
  </aside>
}

function Metric({ title, value, delta, positive, icon: Icon, note }: { title: string; value: string; delta: string; positive: boolean; icon: typeof Package; note: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{title}</span><div className="metric-icon"><Icon size={18} /></div></div><div className="metric-value">{value}</div><div className="metric-foot"><span className={positive ? 'trend up' : 'trend down'}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{delta}</span><span>{note}</span></div></article>
}

function Overview() {
  return <div className="page-content">
    <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot" /> PLATFORMAYA ÜMUMİ BAXIŞ</div><h1>İcmal</h1><p className="page-subtitle">Logistika əməliyyatlarınızın cari vəziyyəti.</p></div><button className="primary-button"><Plus size={17} /> Yeni yük yarat</button></div>
    <div className="metrics-grid">
      <Metric title="Aktiv yüklər" value="1,284" delta="+12.8%" positive icon={Package} note="ötən aya nisbətən" />
      <Metric title="Aktiv daşıyıcılar" value="846" delta="+8.2%" positive icon={Truck} note="ötən aya nisbətən" />
      <Metric title="Açıq müraciətlər" value="326" delta="+4.6%" positive icon={Users} note="ötən aya nisbətən" />
      <Metric title="Ümumi dövriyyə" value="₼284,650" delta="-2.4%" positive={false} icon={Wallet} note="ötən aya nisbətən" />
    </div>
    <div className="content-grid">
      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Son yüklər</h2><p>Platformaya əlavə edilən son elanlar</p></div><NavLink to="/loads" className="text-link">Hamısına bax <ArrowUpRight size={14} /></NavLink></div>
        <div className="table-wrap"><table><thead><tr><th>YÜK / İSTİQAMƏT</th><th>YÜK SAHİBİ</th><th>ÇƏKİ</th><th>QİYMƏT</th><th>STATUS</th></tr></thead><tbody>
          <tr><td><strong className="load-id">#LD-2048</strong><span className="route">Bakı <i>→</i> Tbilisi</span></td><td>AzTrade MMC</td><td>12,5 ton</td><td className="price">₼ 1,850</td><td><span className="status published">Aktiv</span></td></tr>
          <tr><td><strong className="load-id">#LD-2047</strong><span className="route">İstanbul <i>→</i> Bakı</span></td><td>Caspian Foods</td><td>8 ton</td><td className="price">₼ 2,400</td><td><span className="status pending">Yoxlanılır</span></td></tr>
          <tr><td><strong className="load-id">#LD-2046</strong><span className="route">Gəncə <i>→</i> Almatı</span></td><td>West Cargo</td><td>20 ton</td><td className="price">₼ 3,100</td><td><span className="status published">Aktiv</span></td></tr>
          <tr><td><strong className="load-id">#LD-2045</strong><span className="route">Bursa <i>→</i> Tbilisi</span></td><td>Global Supply</td><td>6 ton</td><td className="price">₼ 1,250</td><td><span className="status closed">Tamamlanıb</span></td></tr>
        </tbody></table></div>
      </section>
      <section className="panel quick-panel"><div className="panel-heading"><div><h2>Sürətli keçidlər</h2><p>Əsas əməliyyatlar</p></div></div><div className="quick-links">
        <NavLink to="/loads"><span className="quick-icon violet"><Package size={18} /></span><span><strong>Yükləri idarə et</strong><small>Elanlara bax və yenilə</small></span><ArrowUpRight size={15} /></NavLink>
        <NavLink to="/vehicles"><span className="quick-icon blue"><Truck size={18} /></span><span><strong>Nəqliyyat vasitələri</strong><small>Parkı və təklifləri idarə et</small></span><ArrowUpRight size={15} /></NavLink>
        <NavLink to="/map"><span className="quick-icon green"><Compass size={18} /></span><span><strong>Canlı xəritə</strong><small>Marşrutları araşdır</small></span><ArrowUpRight size={15} /></NavLink>
      </div><div className="notice"><div className="notice-icon"><Bell size={16} /></div><div><strong>İnteqrasiya mərhələsi</strong><p>Bu ilkin interfeysdir. Göstərilən rəqəmlər demo məlumatlardır; API qoşulduqda real məlumatlarla əvəz ediləcək.</p></div></div></section>
    </div>
    <footer className="page-footer"><span>© 2026 LogisticsApp</span><span>Logistika daha ağıllı idarə olunur.</span></footer>
  </div>
}

function Placeholder({ title }: { title: string }) {
  return <div className="page-content"><div className="welcome-row"><div><div className="eyebrow">LOGISTICSAPP / İŞ MASASI</div><h1>{title}</h1><p className="page-subtitle">Bu modulun interfeysi növbəti mərhələdə hazırlanacaq.</p></div></div><section className="panel placeholder"><div className="placeholder-icon"><Package size={24} /></div><h2>{title}</h2><p>Bu səhifə üçün API müqaviləsi və məlumat axını dəqiqləşdirildikdən sonra real funksionallıq əlavə ediləcək.</p><span className="status pending">Hazırlanır</span></section></div>
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return <div className="app-shell"><div className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} />
    <Sidebar onNavigate={() => setMobileOpen(false)} />
    <main className="main-area"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menyunu aç"><Menu size={19} /></button><div className="breadcrumbs">İş masası <span>/</span> <strong>İcmal</strong></div><div className="topbar-actions"><button className="search-trigger"><Search size={16} /><span>Axtarış...</span><kbd>⌘ K</kbd></button><button className="icon-button notification-button" aria-label="Bildirişlər"><Bell size={18} /><i /></button><div className="top-avatar">AC</div></div></header>
      <Routes><Route path="/" element={<Overview />} /><Route path="/loads" element={<Placeholder title="Yüklər" />} /><Route path="/carriers" element={<Placeholder title="Daşıyıcılar" />} /><Route path="/vehicles" element={<Placeholder title="Nəqliyyat vasitələri" />} /><Route path="/applications" element={<Placeholder title="Müraciətlər" />} /><Route path="/business-places" element={<Placeholder title="Biznes məkanları" />} /><Route path="/map" element={<Placeholder title="Xəritə" />} /><Route path="/subscription" element={<Placeholder title="Abunəlik və ödəniş" />} /><Route path="/settings" element={<Placeholder title="Tənzimləmələr" />} /></Routes>
    </main>
  </div>
}
