import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Filter, MapPin, X, ChevronLeft, ChevronRight, LoaderCircle, Truck, CalendarDays, RefreshCw, List, Map as MapIcon } from 'lucide-react'
import { api } from '../../../lib/api'
import { loadsApi } from '../api/loadsApi'
import type { Load, LoadFilters } from '../types'
import { ListingCard } from '../../marketplace/components/ListingCard'
import { MarketplaceSidebar } from '../../marketplace/components/MarketplaceSidebar'
import { MarketplaceTopbar } from '../../marketplace/components/MarketplaceTopbar'
import { MarketplaceMobileNav } from '../../marketplace/components/MarketplaceMobileNav'
import { primaryNav, secondaryNav, pagePaths } from '../../marketplace/config/navigation'
import { useAuth, useLogout } from '../../auth/hooks/useAuth'
import './loads-map.css'

type CatalogItem = { id: number; name: string; iso2?: string | null }
type LeafletMarker = { addTo: (map: LeafletMap) => LeafletMarker; on: (event: string, callback: () => void) => LeafletMarker; remove: () => void }
type LeafletMap = { setView: (point: [number, number], zoom: number) => LeafletMap; fitBounds: (bounds: [number, number][], options?: Record<string, unknown>) => LeafletMap; remove: () => void; invalidateSize: () => void }
type Leaflet = { map: (element: HTMLElement, options?: Record<string, unknown>) => LeafletMap; tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void }; divIcon: (options: Record<string, unknown>) => unknown; marker: (point: [number, number], options?: Record<string, unknown>) => LeafletMarker }
function currentLeaflet(): Leaflet | undefined { return (window as unknown as { L?: Leaflet }).L }
let leafletLoad: Promise<Leaflet> | null = null
function getLeaflet(): Promise<Leaflet> {
  const existing = currentLeaflet()
  if (existing) return Promise.resolve(existing)
  if (!leafletLoad) leafletLoad = new Promise((resolve, reject) => {
    if (!document.getElementById('leaflet-map-css')) {
      const css = document.createElement('link')
      css.id = 'leaflet-map-css'; css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(css)
    }
    let script = document.getElementById('leaflet-picker-script') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script'); script.id = 'leaflet-picker-script'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; document.body.appendChild(script)
    }
    script.addEventListener('load', () => { const L = currentLeaflet(); L ? resolve(L) : reject(new Error('Leaflet yüklənmədi')) }, { once: true })
    script.addEventListener('error', () => reject(new Error('Leaflet yüklənmədi')), { once: true })
  })
  return leafletLoad
}
const emptyFilters = {
  from_country_id: '', from_location_id: '', to_country_id: '', to_location_id: '',
  cargo_type_id: '', load_vehicle_type_id: '', min_weight: '', max_weight: '',
  min_volume: '', max_volume: '', is_hazardous: '', needs_refrigeration: '',
  applications: '', created_from: '', created_to: '',
}
type FilterState = typeof emptyFilters
function dateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date)
}
function toListing(load: Load) {
  const source = load.applications === 'whatsapp' ? 'WhatsApp-dan' : load.applications === 'telegram' ? 'Telegram-dan' : 'Saytdan'
  return {
    id: String(load.id), title: load.title, from: load.from_name ?? load.from_country_name ?? '—',
    to: load.to_name ?? load.to_country_name ?? '—', fromFlag: load.from_country_iso2 ?? '',
    toFlag: load.to_country_iso2 ?? '', cargo: load.cargo_type_name ?? 'Digər yük',
    weight: `${(Number(load.weight_kg) / 1000).toLocaleString('az-AZ', { maximumFractionDigits: 2 })} ton`,
    vehicle: load.load_vehicle_type_name ?? 'Nəqliyyat növü göstərilməyib',
    price: load.price === null ? 'Razılaşma ilə' : `${Number(load.price).toLocaleString('az-AZ')} ${load.currency ?? ''}`.trim(),
    application: source, date: dateTime(load.created_at),
    pickupDate: load.is_ready_for_loading ? null : load.pickup_from,
    isReadyForLoading: Boolean(load.is_ready_for_loading), isHazardous: Boolean(load.is_hazardous),
    needsRefrigeration: Boolean(load.needs_refrigeration), volume: load.volume_m3 == null ? null : `${Number(load.volume_m3).toLocaleString('az-AZ')} m³`,
    quantity: load.quantity ?? null, source, kind: 'load' as const,
  }
}

export default function LoadsMapPage() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [country, setCountry] = useState('AZ Azərbaycanca')
  const [showNotices, setShowNotices] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [page, setPage] = useState(1)
  const [mapError, setMapError] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])
  const lastAutoFitFiltersRef = useRef<string | null>(null)
  const auth = useAuth()
  const logout = useLogout()
  const changePage = (label: string) => { navigate(pagePaths[label] ?? '/'); setShowMobileMenu(false) }

  const countries = useQuery({ queryKey: ['catalog', 'countries'], queryFn: async () => (await api.get<{ data: CatalogItem[] }>('/catalog/countries')).data.data, staleTime: 300000 })
  const cargoTypes = useQuery({ queryKey: ['catalog', 'cargo-types'], queryFn: async () => (await api.get<{ data: CatalogItem[] }>('/catalog/cargo-types')).data.data, staleTime: 300000 })
  const vehicleTypes = useQuery({ queryKey: ['catalog', 'load-vehicle-types'], queryFn: async () => (await api.get<{ data: CatalogItem[] }>('/catalog/load-vehicle-types')).data.data, staleTime: 300000 })
  const fromCities = useQuery({ queryKey: ['catalog', 'locations', filters.from_country_id], queryFn: async () => (await api.get<{ data: CatalogItem[] }>('/catalog/locations', { params: { country_id: filters.from_country_id, per_page: 100 } })).data.data, enabled: Boolean(filters.from_country_id), staleTime: 300000 })
  const toCities = useQuery({ queryKey: ['catalog', 'locations', filters.to_country_id], queryFn: async () => (await api.get<{ data: CatalogItem[] }>('/catalog/locations', { params: { country_id: filters.to_country_id, per_page: 100 } })).data.data, enabled: Boolean(filters.to_country_id), staleTime: 300000 })

  const apiFilters = useMemo(() => {
    const result: Record<string, string | number> = {}
    Object.entries(filters).forEach(([key, value]) => { if (value !== '') result[key] = ['min_weight', 'max_weight'].includes(key) ? Number(value) * 1000 : value })
    return result as unknown as LoadFilters
  }, [filters])
  const pointsQuery = useQuery({
    queryKey: ['loads', 'map-points', apiFilters],
    queryFn: () => loadsApi.mapPoints(apiFilters),
    staleTime: 20000,
    refetchOnWindowFocus: false,
  })
  const selected = useMemo(() => (pointsQuery.data ?? []).find(point => point.key === selectedKey) ?? null, [pointsQuery.data, selectedKey])
  const listFilters = useMemo(() => ({ ...apiFilters, ...(selectedKey ? { map_point_key: selectedKey } : {}), per_page: 8, page }), [apiFilters, selectedKey, page])
  const loadsQuery = useQuery({
    queryKey: ['loads', 'map-results', listFilters],
    queryFn: () => loadsApi.list(listFilters),
    enabled: showResults && Boolean(selectedKey),
  })
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(current => ({ ...current, [key]: value, ...(key === 'from_country_id' ? { from_location_id: '' } : {}), ...(key === 'to_country_id' ? { to_location_id: '' } : {}) }))
    setPage(1)
  }
  const resetFilters = () => { setFilters(emptyFilters); setSelectedKey(null); setShowResults(false); setPage(1) }
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return
    let cancelled = false
    getLeaflet().then(L => {
      if (cancelled || !mapElement.current || mapRef.current) return
      const map = L.map(mapElement.current, { zoomControl: true, scrollWheelZoom: true }).setView([40.4093, 49.8671], 4)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(map)
      mapRef.current = map
      setMapReady(true)
      window.setTimeout(() => map.invalidateSize(), 120)
    }).catch(() => { leafletLoad = null; setMapError(true) })
    return () => { cancelled = true; markersRef.current.forEach(marker => marker.remove()); mapRef.current?.remove(); mapRef.current = null; setMapReady(false) }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const L = currentLeaflet()
    if (!map || !L || !pointsQuery.data) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    const valid = pointsQuery.data.filter(point =>
      typeof point.lat === 'number' &&
      typeof point.lng === 'number' &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng)
    )

    valid.forEach(point => {
      const marker = L.marker([point.lat as number, point.lng as number], {
        icon: L.divIcon({
          className: 'loads-map-marker-wrap',
          html: `<span class="loads-map-marker">${point.count}</span>`,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        }),
      }).addTo(map)

      marker.on('click', () => {
        setSelectedKey(point.key)
        setShowResults(false)
        setPage(1)
      })
      markersRef.current.push(marker)
    })

    // Auto-fit only on first load or when filters change.
    // Background refetches must not reset the user's current map position.
    const filtersKey = JSON.stringify(apiFilters)
    if (lastAutoFitFiltersRef.current !== filtersKey) {
      lastAutoFitFiltersRef.current = filtersKey
      const bounds: [number, number][] = valid.map(point => [point.lat as number, point.lng as number])

      if (bounds.length > 1) map.fitBounds(bounds, { padding: [35, 35] })
      else if (bounds.length === 1) map.setView(bounds[0], 7)
      else map.setView([40.4093, 49.8671], 4)
    }
  }, [pointsQuery.data, mapReady, apiFilters])

  useEffect(() => { setPage(1) }, [selectedKey, filters])
  useEffect(() => { if (mobileView === 'map') window.setTimeout(() => mapRef.current?.invalidateSize(), 120) }, [mobileView])
  const visibleLoads = (loadsQuery.data?.data ?? []).map(toListing)

  const field = (label: string, key: keyof FilterState, options: { value: string; label: string }[], disabled = false) => (
    <label className="loads-map-field"><span>{label}</span><select value={filters[key]} disabled={disabled} onChange={event => updateFilter(key, event.target.value)}><option value="">Hamısı</option>{options.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
  )
  const rangeField = (label: string, minKey: keyof FilterState, maxKey: keyof FilterState, step = '1') => (
    <div className="loads-map-range"><span>{label}</span><div><input type="number" min="0" step={step} placeholder="Min" value={filters[minKey]} onChange={event => updateFilter(minKey, event.target.value)} /><input type="number" min="0" step={step} placeholder="Max" value={filters[maxKey]} onChange={event => updateFilter(maxKey, event.target.value)} /></div></div>
  )

  return (
    <div className="app-shell loads-map-app" data-theme={theme}>
      <MarketplaceSidebar theme={theme} page="Yük xəritəsi" onNavigate={changePage} />
      <div className="workspace">
        <MarketplaceTopbar page="Yüklər xəritədə" theme={theme} country={country} onCountryChange={setCountry} onNavigate={changePage} onToggleTheme={() => setTheme(value => value === 'light' ? 'dark' : 'light')} showNotices={showNotices} onToggleNotices={() => setShowNotices(value => !value)} onLogin={() => navigate('/login')} userName={auth.data?.data.user.name ?? null} onLogout={() => logout.mutate()} onToggleMobileMenu={() => setShowMobileMenu(value => !value)} />
        {showMobileMenu && <div className="mobile-menu-panel">{[...primaryNav, ...secondaryNav].map(({ label, icon: Icon }) => <button key={label} onClick={() => changePage(label)}><Icon size={18} />{label}</button>)}</div>}
        <main className="content-area loads-map-content">
          <div className="loads-map-heading">
            <div><span className="overline">LIVE FREIGHT MAP</span><h2>Yüklər xəritədə</h2><p>Yükləmə məntəqələrini, istiqamətləri və aktiv elanları araşdırın.</p></div>
            <div className="loads-map-heading-actions">
              <span className="loads-map-total"><strong>{pointsQuery.data?.reduce((sum, point) => sum + point.count, 0) ?? 0}</strong> xəritədə yük</span>
              <button className="loads-map-filter-toggle" onClick={() => setFiltersOpen(true)}><Filter size={17} /> Filtrlər {activeFilterCount > 0 && <b>{activeFilterCount}</b>}</button>
              <button className="loads-map-reset" onClick={resetFilters}><RefreshCw size={15} /> Sıfırla</button>
            </div>
          </div>
          <div className="loads-map-layout">
            <aside className={`loads-map-filters ${filtersOpen ? 'is-open' : ''}`}>
              <div className="loads-map-panel-heading"><strong>Filterlər</strong><button onClick={() => setFiltersOpen(false)} aria-label="Bağla"><X size={18} /></button></div>
              {field('Yükləmə ölkəsi', 'from_country_id', (countries.data ?? []).map(item => ({ value: String(item.id), label: item.name })))}
              {field('Yükləmə şəhəri', 'from_location_id', (fromCities.data ?? []).map(item => ({ value: String(item.id), label: item.name })), !filters.from_country_id)}
              {field('Çatdırılma ölkəsi', 'to_country_id', (countries.data ?? []).map(item => ({ value: String(item.id), label: item.name })))}
              {field('Çatdırılma şəhəri', 'to_location_id', (toCities.data ?? []).map(item => ({ value: String(item.id), label: item.name })), !filters.to_country_id)}
              {field('Yükün növü', 'cargo_type_id', (cargoTypes.data ?? []).map(item => ({ value: String(item.id), label: item.name })))}
              {field('Yük yeri / maşın növü', 'load_vehicle_type_id', (vehicleTypes.data ?? []).map(item => ({ value: String(item.id), label: item.name })))}
              {rangeField('Çəki (ton)', 'min_weight', 'max_weight', '0.1')}
              {rangeField('Həcm (m³)', 'min_volume', 'max_volume', '0.1')}
              {field('ADR', 'is_hazardous', [{ value: '1', label: 'Tələb olunur' }, { value: '0', label: 'Tələb olunmur' }])}
              {field('Soyuducu', 'needs_refrigeration', [{ value: '1', label: 'Tələb olunur' }, { value: '0', label: 'Tələb olunmur' }])}
              {field('Elanın mənbəyi', 'applications', [{ value: 'web', label: 'Sayt' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'telegram', label: 'Telegram' }])}
              <div className="loads-map-date-fields"><span><CalendarDays size={14} /> Elanın tarixi</span><input type="date" value={filters.created_from} onChange={event => updateFilter('created_from', event.target.value)} /><input type="date" value={filters.created_to} onChange={event => updateFilter('created_to', event.target.value)} /></div>
              <button className="loads-map-apply" onClick={() => setFiltersOpen(false)}>Tətbiq et</button>
            </aside>
            <section className={`loads-map-map-panel ${mobileView === 'list' ? 'mobile-hidden' : ''}`}>
              <div className="loads-map-map" ref={mapElement} />
              {(pointsQuery.isLoading || mapError) && <div className="loads-map-map-state">{mapError ? 'Xəritə yüklənmədi. İnternet bağlantısını yoxlayın.' : <><LoaderCircle className="spin" /> Xəritə məlumatları yüklənir…</>}</div>}
              {pointsQuery.isError && <div className="loads-map-map-state is-error">Yükləri xəritədə göstərmək mümkün olmadı.</div>}
              {!pointsQuery.isLoading && !pointsQuery.isError && pointsQuery.data?.length === 0 && <div className="loads-map-map-state">Seçilmiş filterlərə uyğun koordinatlı yük tapılmadı.</div>}
              {selected && <div className="loads-map-mobile-sheet">
                <button className="loads-map-sheet-close" onClick={() => setSelectedKey(null)} aria-label="Bağla"><X size={18} /></button>
                <div className="loads-map-point-title"><MapPin size={18} /><div><strong>{selected.from_name}</strong><small>{selected.from_country_name}</small></div><b>{selected.count}</b></div>
                <h4>ÇATDIRILMA İSTİQAMƏTLƏRİ</h4>
                {selected.destinations.map(item => <div className="loads-map-destination" key={item.name + item.country_name}><span>{item.name}, {item.country_name}</span><b>{item.count}</b></div>)}
                <h4>NƏQLİYYAT NÖVLƏRİ</h4>
                {selected.vehicles.map(item => <div className="loads-map-destination" key={item.name}><span>{item.name}</span><b>{item.count}</b></div>)}
                <div className="loads-map-sheet-actions"><button onClick={() => { setShowResults(true); setMobileView('list') }}><List size={16} /> Yükləri göstər ({selected.count})</button><button onClick={() => setSelectedKey(null)}><X size={16} /> Bağla</button></div>
              </div>}
            </section>
            <aside className={`loads-map-results ${mobileView === 'list' ? 'mobile-visible' : ''}`}>
              {!selected ? <div className="loads-map-empty-results"><MapPin size={30} /><strong>Məntəqə seçin</strong><p>Elanların siyahısını görmək üçün xəritədə markerə klikləyin.</p></div> : <>
                <div className="loads-map-results-heading"><div><span className="overline">SEÇİLMİŞ MƏNTƏQƏ</span><h3>{selected.from_name}</h3><p>{selected.from_country_name} · {selected.count} elan</p></div><button onClick={() => { setSelectedKey(null); setShowResults(false) }} aria-label="Seçimi sil"><X size={18} /></button></div>
                <div className="loads-map-destination-summary"><strong>İstiqamətlər</strong>{selected.destinations.map(item => <div className="loads-map-destination" key={item.name + item.country_name}><span>{item.name}, {item.country_name}</span><b>{item.count}</b></div>)}</div>
                <div className="loads-map-vehicle-summary"><strong><Truck size={15} /> Nəqliyyat növləri</strong><div>{selected.vehicles.map(item => <span key={item.name}>{item.name} <b>{item.count}</b></span>)}</div></div>
                <button className="loads-map-show-results" onClick={() => { setShowResults(true); setMobileView('list') }}>Yükləri göstər <span>{selected.count}</span></button>
                {showResults && <div className="loads-map-list">
                  <div className="loads-map-list-heading"><strong>Elanlar</strong><span>{loadsQuery.data?.meta.total ?? selected.count} nəticə</span></div>
                  {loadsQuery.isLoading ? <div className="loads-map-list-state"><LoaderCircle className="spin" /> Yüklər yüklənir…</div> : loadsQuery.isError ? <div className="loads-map-list-state is-error">Elanları yükləmək mümkün olmadı.</div> : visibleLoads.length ? visibleLoads.map(item => <ListingCard key={item.id} item={item} onSelect={() => navigate(`/loads/${item.id}`)} saved={false} onSave={() => undefined} showSave={false} />) : <div className="loads-map-list-state">Bu məntəqə üzrə elan tapılmadı.</div>}
                  {loadsQuery.data?.meta && loadsQuery.data.meta.last_page > 1 && <div className="loads-map-pagination"><button disabled={page <= 1 || loadsQuery.isFetching} onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span>{loadsQuery.data.meta.current_page} / {loadsQuery.data.meta.last_page}</span><button disabled={page >= loadsQuery.data.meta.last_page || loadsQuery.isFetching} onClick={() => setPage(value => Math.min(loadsQuery.data!.meta.last_page, value + 1))}><ChevronRight size={16} /></button></div>}
                </div>}
              </>}
            </aside>
          </div>
          <div className={`loads-map-mobile-switch ${selected ? "has-selection" : ""}`}><button className={mobileView === 'map' ? 'active' : ''} onClick={() => setMobileView('map')}><MapIcon size={16} /> Xəritə</button><button className={mobileView === 'list' ? 'active' : ''} onClick={() => { setShowResults(true); setMobileView('list') }} disabled={!selected}><List size={16} /> Elanlar</button></div>
        </main>
        <MarketplaceMobileNav page="Yük xəritəsi" onNavigate={changePage} onToggleMore={() => setShowMobileMenu(value => !value)} />
      </div>
    </div>
  )
}
