import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, MapPin, ArrowRight, Truck, List, LoaderCircle } from 'lucide-react'
import { loadsApi } from './api/loadsApi'
import { useQuery } from '@tanstack/react-query'
import './load-origin-map.css'

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker
  on: (event: string, callback: () => void) => LeafletMarker
  remove: () => void
}
type LeafletMap = {
  setView: (point: [number, number], zoom: number) => LeafletMap
  fitBounds: (bounds: [number, number][]) => LeafletMap
  remove: () => void
  invalidateSize: () => void
}
type Leaflet = {
  map: (element: HTMLElement, options?: Record<string, unknown>) => LeafletMap
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void }
  divIcon: (options: Record<string, unknown>) => unknown
  marker: (point: [number, number], options?: Record<string, unknown>) => LeafletMarker
}
function currentLeaflet(): Leaflet | undefined {
  return (window as unknown as { L?: Leaflet }).L
}

let leafletLoad: Promise<Leaflet> | null = null
function getLeaflet(): Promise<Leaflet> {
  const loadedLeaflet = currentLeaflet()
  if (loadedLeaflet) return Promise.resolve(loadedLeaflet)
  if (!leafletLoad) {
    leafletLoad = new Promise((resolve, reject) => {
      if (!document.getElementById('leaflet-map-css')) {
        const css = document.createElement('link')
        css.id = 'leaflet-map-css'
        css.rel = 'stylesheet'
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(css)
      }
      let script = document.getElementById('leaflet-picker-script') as HTMLScriptElement | null
      if (!script) {
        script = document.createElement('script')
        script.id = 'leaflet-picker-script'
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        document.body.appendChild(script)
      }
      script.addEventListener('load', () => { const L = currentLeaflet(); L ? resolve(L) : reject(new Error('Leaflet yüklənmədi')) }, { once: true })
      script.addEventListener('error', () => reject(new Error('Leaflet yüklənmədi')), { once: true })
    })
  }
  return leafletLoad
}

function Flag({ code }: { code?: string | null }) {
  if (!code) return <span className="load-map-flag">📍</span>
  return <img className="load-map-flag" src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} alt="" />
}

export default function LoadOriginMap({ open, onClose, focusLoadId }: {
  open: boolean
  onClose: () => void
  focusLoadId?: number
}) {
  const navigate = useNavigate()
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [mapError, setMapError] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const pointsQuery = useQuery({
    queryKey: ['loads', 'map-points'],
    queryFn: loadsApi.mapPoints,
    enabled: open,
    staleTime: 30_000,
  })
  const points = pointsQuery.data ?? []
  const selected = useMemo(() => points.find(point => point.key === selectedKey) ?? null, [points, selectedKey])

  useEffect(() => {
    if (!open || !mapElement.current || mapRef.current) return
    setMapError(false)
    let cancelled = false
    getLeaflet().then(L => {
      if (cancelled || !mapElement.current || mapRef.current) return
      const map = L.map(mapElement.current, { zoomControl: true, scrollWheelZoom: true }).setView([40.4093, 49.8671], 5)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)
      mapRef.current = map
      setMapReady(true)
      window.setTimeout(() => map.invalidateSize(), 150)
    }).catch(() => { leafletLoad = null; setMapError(true) })
    return () => { cancelled = true }
  }, [open])

  useEffect(() => {
    const map = mapRef.current
    const L = currentLeaflet()
    if (!open || !map || !L || !points.length) return
    const valid = points.filter(point => point.lat !== null && point.lng !== null)
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    const bounds: [number, number][] = []
    valid.forEach(point => {
      const marker = L.marker([point.lat as number, point.lng as number], {
        icon: L.divIcon({
          className: 'load-map-marker-wrap',
          html: `<span class="load-map-marker">${point.count}</span>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        }),
      }).addTo(map)
      marker.on('click', () => setSelectedKey(point.key))
      markersRef.current.push(marker)
      bounds.push([point.lat as number, point.lng as number])
    })
    if (bounds.length > 1) map.fitBounds(bounds)
    else if (bounds.length === 1) map.setView(bounds[0], 7)
    if (focusLoadId) {
      const focused = valid.find(point => point.load_ids.includes(focusLoadId))
      if (focused) {
        setSelectedKey(focused.key)
        map.setView([focused.lat as number, focused.lng as number], 8)
      }
    }
  }, [open, points, focusLoadId, mapReady])

  useEffect(() => {
    if (!open) {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      mapRef.current?.remove()
      mapRef.current = null
      setMapReady(false)
      setSelectedKey(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const showLoads = () => {
    if (!selected) return
    onClose()
    navigate(`/?load_ids=${selected.load_ids.join(',')}`)
  }

  return (
    <div className="load-origin-map-overlay" role="dialog" aria-modal="true" aria-label="Yükləmə ünvanları xəritəsi">
      <div className="load-origin-map-header">
        <div><MapPin size={18} /><strong>Yükləmə ünvanları</strong></div>
        <button type="button" onClick={onClose} aria-label="Xəritəni bağla"><X size={20} /></button>
      </div>
      <div className="load-origin-map-canvas" ref={mapElement} />
      {pointsQuery.isLoading && <div className="load-origin-map-state"><LoaderCircle className="spin" /> Xəritə məlumatları yüklənir…</div>}
      {(pointsQuery.isError || mapError) && <div className="load-origin-map-state is-error">Xəritəni yükləmək mümkün olmadı. Yenidən cəhd edin.</div>}
      {!pointsQuery.isLoading && !pointsQuery.isError && points.every(point => point.lat === null || point.lng === null) && (
        <div className="load-origin-map-state">Xəritədə göstərmək üçün koordinatı olan yükləmə ünvanı tapılmadı.</div>
      )}
      {selected && (
        <section className="load-origin-map-popup">
          <button className="load-origin-map-popup-close" type="button" onClick={() => setSelectedKey(null)} aria-label="Məlumatı bağla"><X size={17} /></button>
          <div className="load-origin-map-location">
            <Flag code={selected.from_country_iso2} />
            <strong>{selected.from_name}</strong>
            <span>{selected.from_country_name}</span>
          </div>
          <div className="load-origin-map-total"><b>{selected.count}</b><span>Buradan yüklər</span></div>
          <h4>HARA GEDİR</h4>
          <div className="load-origin-map-destinations">
            {selected.destinations.map(destination => (
              <div className="load-origin-map-destination" key={destination.name + destination.country_name}>
                <Flag code={destination.country_iso2} />
                <div><strong>{destination.country_name}</strong><small>{destination.name}</small></div>
                <b>{destination.count}</b>
              </div>
            ))}
          </div>
          <h4>NƏQLİYYAT NÖVÜ</h4>
          <div className="load-origin-map-vehicles">
            {selected.vehicles.map(vehicle => <span key={vehicle.name}><Truck size={14} /> {vehicle.name} <b>{vehicle.count}</b></span>)}
          </div>
          <button className="load-origin-map-show" type="button" onClick={showLoads}>
            <List size={17} /> Yükləri göstər · {selected.count} <ArrowRight size={16} />
          </button>
        </section>
      )}
    </div>
  )
}
