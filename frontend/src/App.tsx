import { useMemo, useState } from 'react'
import {
  Bell, Search, SlidersHorizontal, MapPin, CalendarDays, Package,
  Truck, MessageCircle, UserRound, Home, Map, Plus, ChevronRight,
  ArrowUpDown, Clock3, Weight, X, Check, Navigation, Filter,
  Bookmark, MoreHorizontal, Send, Phone, ShieldCheck, Menu,
} from 'lucide-react'

type Load = {
  id: string; from: string; to: string; fromFlag: string; toFlag: string;
  cargo: string; weight: string; truck: string; price: string; date: string;
  distance: string; owner: string; verified: boolean; urgent?: boolean;
}
const loads: Load[] = [
  { id:'LS-2048', from:'Bakı', to:'Tbilisi', fromFlag:'🇦🇿', toFlag:'🇬🇪', cargo:'Meyvə və tərəvəz', weight:'12 ton', truck:'Tentli', price:'₼ 1 850', date:'Bu gün, 14:00', distance:'568 km', owner:'Caspian Trade', verified:true, urgent:true },
  { id:'LS-2047', from:'İstanbul', to:'Bakı', fromFlag:'🇹🇷', toFlag:'🇦🇿', cargo:'Məişət texnikası', weight:'8 ton', truck:'Qapalı furqon', price:'₼ 2 400', date:'Sabah, 09:00', distance:'1 245 km', owner:'Anadolu Logistics', verified:true },
  { id:'LS-2046', from:'Gəncə', to:'Almatı', fromFlag:'🇦🇿', toFlag:'🇰🇿', cargo:'Tikinti materialları', weight:'20 ton', truck:'Tentli', price:'₼ 3 100', date:'31 Okt, 08:00', distance:'2 890 km', owner:'West Cargo', verified:false },
  { id:'LS-2045', from:'Bursa', to:'Tbilisi', fromFlag:'🇹🇷', toFlag:'🇬🇪', cargo:'Tekstil məhsulları', weight:'6 ton', truck:'Soyuduculu', price:'₼ 1 250', date:'01 Noy, 12:00', distance:'1 380 km', owner:'Global Supply', verified:true },
  { id:'LS-2044', from:'Sumqayıt', to:'Moskva', fromFlag:'🇦🇿', toFlag:'🇷🇺', cargo:'Plastik xammal', weight:'18 ton', truck:'Mega', price:'₼ 4 600', date:'02 Noy, 07:00', distance:'2 240 km', owner:'AzPolymer', verified:true },
]
type Tab = 'home'|'market'|'map'|'applications'|'messages'|'profile'
const tabs: {id:Tab; label:string; icon:typeof Home}[] = [
  {id:'home',label:'Ana səhifə',icon:Home},{id:'market',label:'Yüklər',icon:Package},
  {id:'map',label:'Xəritə',icon:Map},{id:'applications',label:'Müraciətlər',icon:Truck},
  {id:'messages',label:'Mesajlar',icon:MessageCircle},{id:'profile',label:'Profil',icon:UserRound},
]
function LoadCard({load,onOpen,saved,onSave}:{load:Load;onOpen:()=>void;saved:boolean;onSave:()=>void}) {
  return <article className="load-card">
    <div className="load-card-top"><span className="load-id">{load.id}</span><div className="load-tags">{load.urgent&&<span className="tag urgent">Təcili</span>}<span className="tag open">Aktiv</span></div><button className={'save-btn '+(saved?'saved':'')} onClick={onSave} aria-label="Yadda saxla"><Bookmark size={17} fill={saved?'currentColor':'none'}/></button></div>
    <button className="route-block" onClick={onOpen}>
      <div className="route-city"><span className="flag">{load.fromFlag}</span><div><strong>{load.from}</strong><small>Yükləmə nöqtəsi</small></div></div>
      <div className="route-line"><span/><i/><span/></div>
      <div className="route-city"><span className="flag">{load.toFlag}</span><div><strong>{load.to}</strong><small>Çatdırılma nöqtəsi</small></div></div>
    </button>
    <div className="load-meta"><span><Package size={14}/>{load.cargo}</span><span><Weight size={14}/>{load.weight}</span><span><Truck size={14}/>{load.truck}</span></div>
    <div className="load-card-bottom"><div><strong className="load-price">{load.price}</strong><small>{load.distance} · {load.date}</small></div><button className="details-btn" onClick={onOpen}>Ətraflı <ChevronRight size={15}/></button></div>
    <div className="owner-line"><span className="owner-avatar">{load.owner.slice(0,1)}</span><span>{load.owner}{load.verified&&<ShieldCheck size={13} className="verified"/>}</span><small>Yük sahibi</small></div>
  </article>
}
function DetailModal({load,onClose}:{load:Load|null;onClose:()=>void}) {
  if(!load)return null
  return <div className="modal-backdrop" onClick={onClose}><section className="detail-modal" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow">{load.id} · YÜK ELANI</span><h2>Yük məlumatları</h2></div><button className="icon-btn" onClick={onClose}><X size={20}/></button></div>
    <div className="modal-route"><div><span>{load.fromFlag}</span><strong>{load.from}</strong><small>Yükləmə şəhəri</small></div><ArrowUpDown size={20}/><div><span>{load.toFlag}</span><strong>{load.to}</strong><small>Təyinat şəhəri</small></div></div>
    <div className="detail-price"><small>Təklif olunan qiymət</small><strong>{load.price}</strong></div>
    <div className="detail-grid"><div><small>Yük növü</small><strong>{load.cargo}</strong></div><div><small>Çəki</small><strong>{load.weight}</strong></div><div><small>Nəqliyyat</small><strong>{load.truck}</strong></div><div><small>Tarix</small><strong>{load.date}</strong></div><div><small>Məsafə</small><strong>{load.distance}</strong></div><div><small>Yük sahibi</small><strong>{load.owner}</strong></div></div>
    <button className="primary-action" onClick={()=>alert('Müraciət üçün daşıyıcı hesabı və aktiv abunəlik tələb olunur.')}>Bu yükə müraciət et <ChevronRight size={17}/></button>
    <p className="modal-note">Müraciət göndərmək üçün daşıyıcı hesabı ilə daxil olun və aktiv abunəliyiniz olduğuna əmin olun.</p>
  </section></div>
}
export default function App() {
  const [tab,setTab]=useState<Tab>('home')
  const [query,setQuery]=useState('')
  const [filter,setFilter]=useState('Hamısı')
  const [selected,setSelected]=useState<Load|null>(null)
  const [saved,setSaved]=useState<string[]>([])
  const [showFilters,setShowFilters]=useState(false)
  const [notice,setNotice]=useState(false)
  const [menu,setMenu]=useState(false)
  const filtered=useMemo(()=>loads.filter(l=>(filter==='Hamısı'||(filter==='Təcili'&&l.urgent))&&[l.from,l.to,l.cargo,l.owner].join(' ').toLowerCase().includes(query.toLowerCase())),[filter,query])
  const toggleSave=(id:string)=>setSaved(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
  const title=tab==='home'?'Daşıma bazarı':tabs.find(t=>t.id===tab)?.label||'Daşıma bazarı'
  return <div className="mobile-app">
    <header className="app-header">
      <div className="brand-row"><button className="menu-button" onClick={()=>setMenu(!menu)}><Menu size={21}/></button><div className="brand-symbol"><Truck size={21}/></div><div className="brand-name">load<span>ship</span><small>YÜK DAŞIMA BAZARI</small></div><button className="notification-btn" onClick={()=>setNotice(!notice)}><Bell size={20}/><i/></button></div>
      {notice&&<div className="notification-pop"><strong>Bildirişlər</strong><p>Yeni yüklər və müraciət statusları burada görünəcək.</p></div>}
      {menu&&<div className="menu-pop"><button onClick={()=>{setTab('profile');setMenu(false)}}>Profil və hesab</button><button onClick={()=>{setTab('applications');setMenu(false)}}>Müraciətlərim</button><button onClick={()=>{setTab('messages');setMenu(false)}}>Mesajlar</button></div>}
      <div className="header-greeting"><div><small>30 OKTYABR, CÜMƏ</small><h1>{tab==='home'?'Salam! 👋':title}</h1><p>{tab==='home'?'Bu gün sizin üçün yeni yük imkanları var.':'Logistika əməliyyatlarınızı idarə edin.'}</p></div><div className="user-bubble">AC</div></div>
      <div className="search-row"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Şəhər, marşrut və ya yük axtar..."/><button onClick={()=>setShowFilters(!showFilters)} className={showFilters?'filter-active':''}><SlidersHorizontal size={18}/></button></div>
      {showFilters&&<div className="filter-panel"><strong>Yükləri filtrlə</strong><div className="filter-options">{['Hamısı','Təcili'].map(x=><button key={x} className={filter===x?'selected':''} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="filter-hint"><Filter size={14}/> Digər filtrlər növbəti mərhələdə genişləndiriləcək.</div></div>}
    </header>
    <main className="main-content">
      {tab==='home'&&<><div className="section-heading"><div><h2>Yaxınlıqdakı yüklər</h2><p>Platformadakı ən son yük elanları</p></div><button className="view-all" onClick={()=>setTab('market')}>Hamısına bax <ChevronRight size={15}/></button></div>
        <div className="quick-stats"><div><span className="stat-icon blue"><Package size={17}/></span><div><strong>128</strong><small>Aktiv yük</small></div></div><div><span className="stat-icon green"><Truck size={17}/></span><div><strong>64</strong><small>Yeni daşıyıcı</small></div></div><div><span className="stat-icon orange"><Navigation size={17}/></span><div><strong>12</strong><small>Marşrut</small></div></div></div>
        <div className="section-heading map-heading"><div><h2>Marşrut xəritəsi</h2><p>Aktiv daşımaların coğrafiyası</p></div><button className="view-all" onClick={()=>setTab('map')}>Xəritə <ChevronRight size={15}/></button></div>
        <button className="map-preview" onClick={()=>setTab('map')}><div className="map-grid"><div className="map-water"/><svg viewBox="0 0 360 170" preserveAspectRatio="none"><path d="M30 115 C90 35 135 135 205 65 S300 45 330 85" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="5 5"/><path d="M80 35 Q140 80 185 90 T300 145" fill="none" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 5"/></svg><span className="map-pin pin-a">🇦🇿</span><span className="map-pin pin-b">🇬🇪</span><span className="map-pin pin-c">🇹🇷</span><span className="map-label">Bakı</span><span className="map-label label-b">Tbilisi</span><span className="map-zoom">Xəritəni aç <ChevronRight size={14}/></span></div></button>
        <div className="section-heading"><div><h2>Yeni elanlar</h2><p>Ən son əlavə olunan yüklər</p></div><span className="live-label"><i/> CANLI</span></div>
        {loads.slice(0,3).map(l=><LoadCard key={l.id} load={l} onOpen={()=>setSelected(l)} saved={saved.includes(l.id)} onSave={()=>toggleSave(l.id)}/>)}
      </>}
      {tab==='market'&&<><div className="market-heading"><div><h2>Bütün yüklər</h2><p>{filtered.length} elan tapıldı</p></div><button className="filter-pill" onClick={()=>setShowFilters(!showFilters)}><SlidersHorizontal size={16}/> Filtr</button></div><div className="chip-row">{['Hamısı','Təcili'].map(x=><button key={x} className={'chip '+(filter===x?'chip-active':'')} onClick={()=>setFilter(x)}>{x}</button>)}</div>{filtered.map(l=><LoadCard key={l.id} load={l} onOpen={()=>setSelected(l)} saved={saved.includes(l.id)} onSave={()=>toggleSave(l.id)}/>)}</>}
      {tab==='map'&&<><div className="section-heading"><div><h2>Yüklər xəritədə</h2><p>Marşrutları və aktiv yükləri kəşf edin</p></div></div><div className="large-map"><div className="map-grid"><div className="map-water"/><svg viewBox="0 0 360 390" preserveAspectRatio="none"><path d="M25 290 C75 190 130 250 170 155 S280 90 330 135" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="6 6"/><path d="M40 90 Q125 150 180 210 T320 300" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeDasharray="5 5"/></svg>{[['🇦🇿','pin-a'],['🇬🇪','pin-b'],['🇹🇷','pin-c'],['🇰🇿','pin-d']].map(([f,c])=><span className={'map-pin '+c} key={c}>{f}</span>)}<span className="map-city city-a">Bakı</span><span className="map-city city-b">Tbilisi</span><span className="map-city city-c">İstanbul</span></div></div><div className="map-legend"><span><i className="legend-blue"/> Aktiv marşrut</span><span><i className="legend-green"/> Alternativ marşrut</span></div><h3 className="subheading">Xəritədəki yüklər</h3>{loads.slice(0,3).map(l=><LoadCard key={l.id} load={l} onOpen={()=>setSelected(l)} saved={saved.includes(l.id)} onSave={()=>toggleSave(l.id)}/>)}</>}
      {tab==='applications'&&<div className="empty-state"><span><Truck size={28}/></span><h2>Müraciətləriniz</h2><p>Göndərdiyiniz yük müraciətləri və onların statusları burada görünəcək.</p><button className="primary-action" onClick={()=>setTab('market')}>Yüklərə bax <ChevronRight size={16}/></button></div>}
      {tab==='messages'&&<div className="empty-state"><span><MessageCircle size={28}/></span><h2>Mesajlar</h2><p>Yük sahibləri və daşıyıcılarla yazışmalarınız burada olacaq.</p></div>}
      {tab==='profile'&&<div className="profile-screen"><div className="profile-hero"><div className="profile-large">AC</div><h2>İstifadəçi hesabı</h2><p>Hesab məlumatları və platforma parametrləri</p><span><ShieldCheck size={14}/> Təsdiqlənmiş hesab</span></div><div className="profile-menu">{[['Şəxsi məlumatlar','Hesab məlumatlarını yenilə'],['Abunəlik və ödəniş','Daşıyıcı planını idarə et'],['Yadda saxlanılan yüklər',saved.length+' elan'],['Bildiriş parametrləri','Bildiriş seçimləri'],['Dəstək mərkəzi','Bizimlə əlaqə']].map(([a,b])=><button key={a}><span><strong>{a}</strong><small>{b}</small></span><ChevronRight size={18}/></button>)}</div></div>}
    </main>
    <button className="floating-create" onClick={()=>alert('Yük yaratmaq forması növbəti mərhələdə API ilə birləşdiriləcək.')}><Plus size={20}/><span>Yük yerləşdir</span></button>
    <nav className="bottom-nav">{tabs.map(t=>{const Icon=t.icon;return <button key={t.id} className={tab===t.id?'active':''} onClick={()=>setTab(t.id)}><span className="nav-icon"><Icon size={20}/>{t.id==='messages'&&<i/>}</span><small>{t.label}</small></button>})}</nav>
    <DetailModal load={selected} onClose={()=>setSelected(null)}/>
  </div>
}
