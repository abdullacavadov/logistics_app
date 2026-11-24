import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, ExternalLink,
  MapPin, MessageSquare, Package, Phone, Snowflake, Truck,
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelegram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { useLoad } from './hooks/useLoads'
import type { Load } from './types'

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== ''
}

function enabled(value: boolean | number | string | null | undefined): boolean {
  return value === true || value === 1 || value === '1'
}

function dateLabel(value?: string | null): string {
  if (!value) return ''
  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (match) return `${match[3].padStart(2, '0')}.${match[2].padStart(2, '0')}.${match[1]}`
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('az-AZ').format(date)
}

function dateTimeLabel(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? dateLabel(value) : new Intl.DateTimeFormat('az-AZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(date)
}

function weightLabel(value: number | string): string {
  const kg = Number(value)
  if (!Number.isFinite(kg) || kg <= 0) return ''
  return kg >= 1000 ? `${(kg / 1000).toLocaleString('az-AZ', { maximumFractionDigits: 2 })} ton` : `${kg.toLocaleString('az-AZ')} kq`
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="load-detail-field"><small>{label}</small><strong>{children}</strong></div>
}

function sourceLabel(load: Load): string {
  if (load.applications === 'telegram') return 'Telegram'
  if (load.applications === 'whatsapp') return 'WhatsApp'
  return 'Sayt'
}

function safeExternalUrl(value?: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

function ContactPanel({ load }: { load: Load }) {
  const visible = enabled(load.contact_visible)
  const phone = visible && load.contact_phone ? load.contact_phone : null
  const profileUrl = visible ? safeExternalUrl(load.source_profile_url) : null
  const sourceUrl = safeExternalUrl(load.source_url)
  const isWebsite = load.applications === 'web'
  const whatsappUrl = phone && load.applications === 'whatsapp'
    ? `https://wa.me/${phone.replace(/\D/g, '')}`
    : null

  return (
    <section className="load-detail-card load-contact-card">
      <h2>Kontakt</h2>
      <div className="load-contact-person">
        <strong>{load.contact_name || load.shipper_name || 'Elan sahibi'}</strong>
        <span className={`load-source-pill source-${load.applications}`}>
          {load.applications === 'whatsapp' && <FontAwesomeIcon icon={faWhatsapp} />}
          {load.applications === 'telegram' && <FontAwesomeIcon icon={faTelegram} />}
          {sourceLabel(load)}
        </span>
      </div>

      {isWebsite ? (
        <a className="load-contact-action is-primary" href={`/messages?load_id=${load.id}`}>
          <MessageSquare size={19} /> Söhbətdə yaz
        </a>
      ) : (
        <>
          {phone && (
            <div className="load-contact-phone-row">
              <a className="load-contact-phone" href={`tel:${phone}`}><Phone size={17} /> {phone}</a>
              <button type="button" className="load-contact-copy" aria-label="Nömrəni kopyala" onClick={() => void navigator.clipboard?.writeText(phone)}>
                Kopyala
              </button>
            </div>
          )}
          {profileUrl && (
            <a className="load-contact-action is-outline" href={profileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={17} /> {load.applications === 'telegram' ? 'Telegram profilinə keç' : 'WhatsApp-a keç'}
            </a>
          )}
          {whatsappUrl && (
            <a className="load-contact-action is-primary is-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp-da yaz
            </a>
          )}
          {!phone && !profileUrl && (
            <p className="load-contact-empty">Əlaqə məlumatı paylaşılmayıb.</p>
          )}
        </>
      )}
      {sourceUrl && (
        <a className="load-source-link" href={sourceUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={14} /> Orijinal elana bax
        </a>
      )}
    </section>
  )
}

function LoadContent({ load }: { load: Load }) {
  const from = [load.from_location_name, load.from_country_name].filter(Boolean).join(', ')
  const to = [load.to_location_name, load.to_country_name].filter(Boolean).join(', ')
  const hasCoordinates = load.from_lat != null && load.from_lng != null && load.to_lat != null && load.to_lng != null
  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/${load.from_lat},${load.from_lng}/${load.to_lat},${load.to_lng}`
    : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`
  const price = load.price == null
    ? (load.price_negotiable ? 'Razılaşma ilə' : '')
    : `${Number(load.price).toLocaleString('az-AZ')} ${load.currency ?? ''}`.trim()
  const ready = enabled(load.is_ready_for_loading)

  return (
    <div className="load-details-layout">
      <div className="load-details-main">
        <section className="load-detail-card">
          <div className="load-detail-heading">
            <div>
              <span className="overline">ELAN DETALI · #YD-{load.id}</span>
              <h1>{load.title}</h1>
              <span className="load-source-pill">{sourceLabel(load)} yerləşdirilib</span>
            </div>
            {price && <strong className="load-detail-price">{price}</strong>}
          </div>
          <div className="load-detail-route">
            <div><span>Yükləmə yeri</span><strong>{from || load.from_name || '—'}</strong></div>
            <ArrowRight aria-hidden="true" />
            <div><span>Çatdırılma yeri</span><strong>{to || load.to_name || '—'}</strong></div>
          </div>
          <a className="load-map-button" href={mapUrl} target="_blank" rel="noopener noreferrer">
            <MapPin size={18} /> Marşrutu xəritədə göstər <ExternalLink size={15} />
          </a>
          {hasValue(load.description) && (
            <div className="load-detail-section">
              <h2>Yük haqqında məlumat</h2>
              <p className="load-detail-description">{load.description}</p>
            </div>
          )}
        </section>

        <section className="load-detail-card">
          <h2><Package size={18} /> Yük parametrləri</h2>
          <div className="load-detail-grid">
            {hasValue(load.cargo_type_name) && <Field label="Yükün növü">{load.cargo_type_name}</Field>}
            {weightLabel(load.weight_kg) && <Field label="Çəki">{weightLabel(load.weight_kg)}</Field>}
            {load.volume_m3 != null && Number(load.volume_m3) > 0 && <Field label="Həcm">{Number(load.volume_m3).toLocaleString('az-AZ')} m³</Field>}
            {load.quantity != null && <Field label="Miqdar">{Number(load.quantity).toLocaleString('az-AZ')}</Field>}
            {enabled(load.is_hazardous) && <div className="load-detail-hazard"><AlertTriangle size={17} /> ADR təhlükəli yük</div>}
          </div>
        </section>

        <section className="load-detail-card">
          <h2><Truck size={18} /> Daşıma şərtləri</h2>
          <div className="load-detail-grid">
            {hasValue(load.load_vehicle_type_name) && <Field label="Yük yeri növü">{load.load_vehicle_type_name}</Field>}
            {enabled(load.needs_refrigeration) && <Field label="Temperatur rejimi"><Snowflake size={15} /> Soyuduculu daşınma</Field>}
            {!ready && hasValue(load.pickup_from) && <Field label="Yükləmə tarixi">{dateLabel(load.pickup_from)}</Field>}
            {ready && <Field label="Yükləmə">Yükləməyə hazırdır</Field>}
          </div>
        </section>

        <section className="load-detail-card">
          <h2><CalendarDays size={18} /> Elan məlumatları</h2>
          <div className="load-detail-grid">
            <Field label="Elan ID-si">#YD-{load.id}</Field>
            {hasValue(load.created_at) && <Field label="Paylaşılma tarixi">{dateTimeLabel(load.created_at)}</Field>}
            {hasValue(load.shipper_name) && <Field label="Yük sahibi">{load.shipper_name}</Field>}
            {hasValue(load.source_name) && <Field label="Mənbə">{load.source_name}</Field>}
          </div>
        </section>
      </div>
      <aside className="load-details-aside">
        <ContactPanel load={load} />
      </aside>
    </div>
  )
}

export default function LoadDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const loadId = id && /^\d+$/.test(id) ? Number(id) : null
  const query = useLoad(loadId)

  return (
    <div className="app-shell load-details-shell">
      <main className="load-details-page">
        <header className="load-details-top">
          <button type="button" className="load-details-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={17} /> Geri
          </button>
          <button type="button" className="load-details-market" onClick={() => navigate('/')}>Bütün elanlar</button>
        </header>
        {query.isLoading ? (
          <div className="load-detail-card load-detail-state">Yük məlumatları yüklənir…</div>
        ) : query.isError || !query.data?.data ? (
          <div className="load-detail-card load-detail-state">
            <h1>Elan tapılmadı</h1>
            <p>Elan silinmiş, deaktiv edilmiş və ya mövcud olmaya bilər.</p>
            <button type="button" className="load-map-button" onClick={() => navigate('/')}>Bütün elanlara qayıt</button>
          </div>
        ) : (
          <LoadContent load={query.data.data} />
        )}
      </main>
    </div>
  )
}
