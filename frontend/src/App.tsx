import { useMemo, useState } from 'react'
import {
  Bell, Search, SlidersHorizontal, MapPin, Package, Truck, MessageSquare,
  UserRound, House, Map, Plus, ChevronDown, ChevronRight,
  Clock3, Weight, X, Check, Bookmark, FileText, BookOpen, ChartNoAxesCombined,
  Route, Network, Info, Shield, CircleHelp, Sun, Moon, LogOut, Menu, Flag,
  LayoutGrid, ListFilter, ArrowRight, MoreHorizontal
} from 'lucide-react'

type Listing = {
  id: string; from: string; to: string; fromFlag: string; toFlag: string;
  cargo: string; weight: string; vehicle: string; price: string; date: string;
  source: string; urgent?: boolean; kind: 'load' | 'vehicle'
}
const listings: Listing[] = [
  {id:'LA-72418',from:'Bakı',to:'İstanbul',fromFlag:'🇦🇿',toFlag:'🇹🇷',cargo:'Məişət texnikası',weight:'20 ton',vehicle:'Tent / Ref',price:'3 450 AZN',date:'Bu gün, 14:30',source:'Caspian Trade',urgent:true,kind:'load'},
  {id:'LA-72417',from:'Tbilisi',to:'Almatı',fromFlag:'🇬🇪',toFlag:'🇰🇿',cargo:'Tikinti materialları',weight:'22 ton',vehicle:'Tent',price:'Razılaşma ilə',date:'Bu gün, 13:10',source:'Geo Cargo',kind:'load'},
  {id:'LA-72416',from:'Moskva',to:'Bakı',fromFlag:'🇷🇺',toFlag:'🇦🇿',cargo:'Sənaye avadanlığı',weight:'12 ton',vehicle:'Qapalı furqon',price:'4 100 AZN',date:'Bu gün, 11:45',source:'North Logistics',kind:'load'},
  {id:'LA-72415',from:'İstanbul',to:'Bakı',fromFlag:'🇹🇷',toFlag:'🇦🇿',cargo:'Tekstil məhsulları',weight:'8 ton',vehicle:'Mega',price:'2 200 AZN',date:'Dünən, 18:20',source:'Anadolu Group',kind:'load'},
  {id:'LA-72414',from:'Gəncə',to:'Tbilisi',fromFlag:'🇦🇿',toFlag:'🇬🇪',cargo:'Kənd təsərrüfatı',weight:'15 ton',vehicle:'Soyuduculu',price:'1 600 AZN',date:'Dünən, 16:05',source:'West Supply',kind:'load'},
  {id:'TR-3092',from:'Bakı',to:'Bütün istiqamətlər',fromFlag:'🇦🇿',toFlag:'🌍',cargo:'Tentli yük maşını',weight:'20 ton',vehicle:'Tent',price:'Boş maşın',date:'Bu gün, 10:20',source:'Araz Transport',kind:'vehicle'},
]
const primaryNav = [
  {label:'Bütün elanlar',icon:House},{label:'Mənim elanlarım',icon:LayoutGrid},
  {label:'Yük xəritəsi',icon:Map},{label:'Marşrutlarım',icon:Route},
  {label:'Xidmətlərimiz',icon:Network},{label:'Tariflər və Analitika',icon:ChartNoAxesCombined},
  {label:'Sənədlər',icon:FileText},{label:'Bilik bazası',icon:BookOpen},{label:'Profil',icon:UserRound},
]
const secondaryNav = [
  {label:'Platforma haqqında',icon:Info},{label:'İstifadə şərtləri',icon:FileText},
  {label:'Məxfilik Siyasəti',icon:Shield},{label:'Kömək',icon:CircleHelp},
]
function ListingCard({item,onSelect,saved,onSave}:{item:Listing;onSelect:()=>void;saved:boolean;onSave:()=>void}) {
  return <article className="listing-card">
    <div className="listing-top"><span className="listing-id">{item.id}</span><span className="source"><span className="source-dot"/> {item.source}</span><button className={'icon-button save '+(saved?'is-saved':'')} onClick={onSave} aria-label="Yadda saxla"><Bookmark size={17} fill={saved?'currentColor':'none'}/></button></div>
    <button className="route-row" onClick={onSelect}>
      <div className="route-end"><span className="country-flag">{item.fromFlag}</span><span><strong>{item.from}</strong><small>Yükləmə nöqtəsi</small></span></div>
      <div className="route-track"><i/><span/><i/></div>
      <div className="route-end destination"><span className="country-flag">{item.toFlag}</span><span><strong>{item.to}</strong><small>Təyinat nöqtəsi</small></span></div>
    </button>
    <div className="listing-specs"><span><Package size={15}/>{item.cargo}</span><span><Weight size={15}/>{item.weight}</span><span><Truck size={15}/>{item.vehicle}</span></div>
    <div className="listing-footer"><div><small>Təklif olunan qiymət</small><strong className="price">{item.price}</strong></div><button className="outline-action" onClick={onSelect}>Ətraflı <ArrowRight size={15}/></button></div>
    <div className="listing-meta"><span><Clock3 size={14}/>{item.date}</span>{item.urgent&&<span className="urgent-tag">Təcili yük</span>}</div>
  </article>
}
function DetailDialog({item,onClose}:{item:Listing|null;onClose:()=>void}) {
  if(!item)return null
  return <div className="dialog-backdrop" onClick={onClose}><section className="detail-dialog" onClick={e=>e.stopPropagation()}>
    <div className="dialog-heading"><div><span className="overline">{item.id} · ELAN DETALI</span><h2>Daşıma məlumatları</h2></div><button className="icon-button" onClick={onClose}><X/></button></div>
    <div className="dialog-route"><div><span>{item.fromFlag}</span><strong>{item.from}</strong><small>Yükləmə şəhəri</small></div><ArrowRight/><div><span>{item.toFlag}</span><strong>{item.to}</strong><small>Təyinat şəhəri</small></div></div>
    <div className="dialog-price"><small>Qiymət</small><strong>{item.price}</strong></div>
    <div className="dialog-grid"><div><small>Yük növü</small><strong>{item.cargo}</strong></div><div><small>Çəki</small><strong>{item.weight}</strong></div><div><small>Nəqliyyat növü</small><strong>{item.vehicle}</strong></div><div><small>Elan sahibi</small><strong>{item.source}</strong></div></div>
    <button className="primary-button full-width">Bu elana müraciət et <ArrowRight size={16}/></button>
    <p className="dialog-note">Müraciət funksiyası hesab və abunəlik statusuna uyğun aktivləşdiriləcək.</p>
  </section></div>
}
export default function App() {
  const [page,setPage]=useState('Bütün elanlar')
  const [theme,setTheme]=useState<'light'|'dark'>('light')
  const [kind,setKind]=useState<'load'|'vehicle'>('load')
  const [query,setQuery]=useState('')
  const [origin,setOrigin]=useState('')
  const [destination,setDestination]=useState('')
  const [filterOpen,setFilterOpen]=useState(false)
  const [sort,setSort]=useState('Əvvəlcə yenilər')
  const [country,setCountry]=useState('🇦🇿 Azərbaycan')
  const [selected,setSelected]=useState<Listing|null>(null)
  const [saved,setSaved]=useState<string[]>([])
  const [showNotices,setShowNotices]=useState(false)
  const [showMobileMenu,setShowMobileMenu]=useState(false)
  const filtered=useMemo(()=>listings.filter(x=>x.kind===kind && [x.from,x.to,x.cargo,x.source,x.vehicle].join(' ').toLocaleLowerCase('az').includes(query.toLocaleLowerCase('az')) && (!origin||x.from.toLocaleLowerCase('az').includes(origin.toLocaleLowerCase('az'))) && (!destination||x.to.toLocaleLowerCase('az').includes(destination.toLocaleLowerCase('az')))),[kind,query,origin,destination])
  const changePage=(label:string)=>{setPage(label);setShowMobileMenu(false)}
  const toggleSaved=(id:string)=>setSaved(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
  const isMap=page==='Yük xəritəsi'
  return <div className="app-shell" data-theme={theme}>
    <aside className="sidebar">
      <button className="brand-lockup" onClick={()=>changePage('Bütün elanlar')} aria-label="Yoldaş — Bütün elanlar"><span className="brand-mark" aria-hidden="true"><i/><b/><em/></span><span className="brand-wordmark"><span className="brand-yol">Yol</span><span className="brand-dash">daş</span><small>FREIGHT NETWORK</small></span></button>
      <div className="sidebar-scroll">
        <div className="nav-group">{primaryNav.map(({label,icon:Icon})=><button key={label} className={'side-link '+(page===label?'selected':'')} onClick={()=>changePage(label)}><Icon size={19}/><span>{label}</span>{label==='Bütün elanlar'&&<i className="nav-indicator"/>}</button>)}</div>
        <div className="nav-divider"/>
        <div className="nav-group muted-group">{secondaryNav.map(({label,icon:Icon})=><button key={label} className={'side-link '+(page===label?'selected':'')} onClick={()=>changePage(label)}><Icon size={18}/><span>{label}</span></button>)}</div>
      </div>
      <div className="sidebar-version"><span className="status-light"/> LogisticsApp <span>v1.0</span></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <button className="mobile-menu-trigger icon-button" onClick={()=>setShowMobileMenu(!showMobileMenu)}><Menu/></button>
        <div className="page-title"><span className="overline">LOGISTICS NETWORK</span><h1>{page}</h1></div>
        <div className="top-actions">
          <label className="country-select"><span>{country}</span><select aria-label="Ölkə seçimi" value={country} onChange={e=>setCountry(e.target.value)}><option>🇦🇿 Azərbaycan</option><option>🇬🇪 Gürcüstan</option><option>🇹🇷 Türkiyə</option><option>🇰🇿 Qazaxıstan</option></select><ChevronDown size={15}/></label>
          <button className="icon-button desktop-only" aria-label="Yadda saxlanılanlar" onClick={()=>changePage('Yadda saxlanılanlar')}><Bookmark/></button>
          <div className="notice-wrap"><button className="icon-button" aria-label="Bildirişlər" onClick={()=>setShowNotices(!showNotices)}><Bell/><i className="notification-dot"/></button>{showNotices&&<div className="notice-popover"><strong>Bildirişlər</strong><p>Yeni elanlar və müraciət yenilikləri burada görünəcək.</p></div>}</div>
          <button className="theme-toggle" onClick={()=>setTheme(theme==='light'?'dark':'light')} aria-label="Mövzunu dəyiş">{theme==='light'?<Moon size={17}/>:<Sun size={17}/>}</button>
          <button className="login-button"><LogOut size={16}/> Daxil ol</button>
        </div>
      </header>
      {showMobileMenu&&<div className="mobile-menu-panel">{primaryNav.map(({label,icon:Icon})=><button key={label} onClick={()=>changePage(label)}><Icon size={18}/>{label}</button>)}<div className="nav-divider"/>{secondaryNav.map(({label,icon:Icon})=><button key={label} onClick={()=>changePage(label)}><Icon size={18}/>{label}</button>)}</div>}
      <main className="content-area">
        {page==='Bütün elanlar' ? <>
          <div className="market-tabs"><button className={kind==='load'?'active':''} onClick={()=>setKind('load')}><Package size={18}/> Yüklər <b>7 156</b></button><button className={kind==='vehicle'?'active':''} onClick={()=>setKind('vehicle')}><Truck size={18}/> Maşınlar <b>606</b></button></div>
          <section className="search-tools">
            <label className="search-field"><Truck size={18}/><input placeholder="Nəqliyyat növünü seçin" value={query} onChange={e=>setQuery(e.target.value)}/></label>
            <label className="search-field"><MapPin size={18}/><input placeholder="Haradan" value={origin} onChange={e=>setOrigin(e.target.value)}/></label>
            <label className="search-field"><Flag size={18}/><input placeholder="Haraya" value={destination} onChange={e=>setDestination(e.target.value)}/></label>
            <button className={'filter-button '+(filterOpen?'filter-on':'')} onClick={()=>setFilterOpen(!filterOpen)}><SlidersHorizontal size={17}/> Daha çox <ChevronDown size={15}/></button>
            <button className="filter-button channel-filter"><MessageSquare size={16}/> <Check size={15}/><span>WhatsApp</span></button>
            <label className="sort-select"><ListFilter size={16}/><select value={sort} onChange={e=>setSort(e.target.value)}><option>Əvvəlcə yenilər</option><option>Əvvəlcə köhnələr</option></select><ChevronDown size={14}/></label>
          </section>
          {filterOpen&&<section className="expanded-filters"><div><strong>Elan filtrləri</strong><small>Nəticələri dəqiqləşdirin</small></div><label><span>Minimum çəki</span><input placeholder="ton"/></label><label><span>Maksimum çəki</span><input placeholder="ton"/></label><label><span>Yük növü</span><select><option>Bütün növlər</option><option>Qida</option><option>Tikinti materialları</option></select></label><button className="text-action" onClick={()=>{setOrigin('');setDestination('');setQuery('')}}>Filtrləri sıfırla</button></section>}
          <section className="welcome-banner"><div className="banner-copy"><span className="banner-kicker">LOGISTICS MARKETPLACE</span><h2>Doğru yük. Doğru marşrut. <em>Vaxtında çatdırılma.</em></h2><p>Platformada {kind==='load'?'yük':'nəqliyyat'} imkanlarını araşdırın və növbəti daşınmanızı planlaşdırın.</p><div className="banner-stats"><span><strong>{kind==='load'?'7 156':'606'}</strong> aktiv elan</span><i/><span><strong>+238</strong> son 1 saatda</span></div></div><div className="banner-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-pin"><MapPin size={27}/></div><span className="art-node node-one">🇦🇿</span><span className="art-node node-two">🇹🇷</span><span className="art-node node-three">🇬🇪</span></div></section>
          <div className="results-heading"><div><span className="overline">MARKETPLACE / {kind==='load'?'LOADS':'VEHICLES'}</span><h2>{kind==='load'?'Bütün yük elanları':'Boş nəqliyyat vasitələri'} <span>{filtered.length}</span></h2></div><div className="view-switch"><button className="selected"><LayoutGrid size={17}/></button><button><ListFilter size={17}/></button></div></div>
          <div className="listing-grid">{filtered.length?filtered.map(item=><ListingCard key={item.id} item={item} onSelect={()=>setSelected(item)} saved={saved.includes(item.id)} onSave={()=>toggleSaved(item.id)}/>):<div className="no-results"><Search size={25}/><strong>Elan tapılmadı</strong><span>Axtarış şərtlərini dəyişərək yenidən yoxlayın.</span></div>}</div>
        </> : page==='Yük xəritəsi' ? <section className="map-page"><div className="map-toolbar"><div><span className="overline">LIVE FREIGHT MAP</span><h2>Yüklər xəritədə</h2><p>Marşrutları və yük sıxlığını interaktiv xəritədə izləyin.</p></div><button className="primary-button"><MapPin size={16}/> Yaxınlıqdakı yüklər</button></div><div className="map-placeholder"><div className="map-land map-land-a"/><div className="map-land map-land-b"/><div className="map-route route-a"/><div className="map-route route-b"/>{[['Bakı','🇦🇿','47%','56%','133'],['İstanbul','🇹🇷','24%','66%','186'],['Moskva','🇷🇺','54%','22%','82'],['Tbilisi','🇬🇪','39%','47%','31'],['Almatı','🇰🇿','78%','52%','47']].map(([name,flag,x,y,count])=><button className="map-cluster" style={{left:x,top:y}} key={name}><b>{count}</b><span>{flag} {name}</span></button>)}<div className="map-search-pill"><Search size={17}/><span>Haradan · Haraya · Nəqliyyat növü</span></div><div className="map-legend-pill"><i/> Aktiv yüklər <i/> Marşrutlar</div></div></section> : <section className="placeholder-page"><div className="placeholder-icon"><Package size={28}/></div><span className="overline">LOGISTICS WORKSPACE</span><h2>{page}</h2><p>Bu bölmənin interfeysi yeni dizayn sisteminə uyğun hazırlanacaq.</p><button className="primary-button" onClick={()=>changePage('Bütün elanlar')}>Bütün elanlara qayıt <ArrowRight size={16}/></button></section>}
      </main>
    </div>
    <nav className="mobile-bottom-nav">
      <button className={page==='Bütün elanlar'?'active':''} onClick={()=>changePage('Bütün elanlar')}><House/><small>Əsas</small></button>
      <button className={page==='Xidmətlərimiz'?'active':''} onClick={()=>changePage('Xidmətlərimiz')}><Network/><small>Xidmətlər</small></button>
      <button className={'mobile-map-tab '+(isMap?'active':'')} onClick={()=>changePage('Yük xəritəsi')}><span><Map size={23}/></span><small>Xəritə</small></button>
      <button onClick={()=>changePage('Mesajlar')} className={page==='Mesajlar'?'active':''}><MessageSquare/><small>Mesajlar</small></button>
      <button onClick={()=>setShowMobileMenu(!showMobileMenu)}><MoreHorizontal/><small>Daha çox</small></button>
    </nav>
    <button className="mobile-create" aria-label="Elan yerləşdir"><Plus size={21}/></button>
    <DetailDialog item={selected} onClose={()=>setSelected(null)}/>
  </div>
}
