import type { ReactNode } from 'react'
import { AlertTriangle, ArrowRight, CalendarDays, MapPin, Package, Truck, X } from 'lucide-react'
import type { Load } from '../../loads/types'
import { CountryFlag } from './CountryFlag'

const statusLabels: Record<string, string> = {
    draft: 'Qaralama',
    pending_moderation: 'Moderasiya gözləyir',
    rejected: 'Rədd edilib',
    published: 'Dərc edilib',
    has_applications: 'Müraciətlər var',
    agreed: 'Razılaşdırılıb',
    in_transit: 'Daşınır',
    completed: 'Tamamlanıb',
    cancelled: 'Ləğv edilib',
    archived: 'Arxivləşdirilib',
}

const channelLabels: Record<Load['applications'], string> = {
    web: 'Sayt',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
}

function hasValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== ''
}

function formatDate(value: string | null | undefined): string {
    if (!value) return ''
    const match = value.match(/^(\\d{4})-(\\d{1,2})-(\\d{1,2})/)
    if (match) {
        const [, year, month, day] = match
        return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`
    }
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime())
        ? ''
        : new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed)
}

function formatDateTime(value: string | null | undefined): string {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return formatDate(value)
    return new Intl.DateTimeFormat('az-AZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(parsed)
}

function formatWeight(value: number | string): string {
    const kg = Number(value)
    if (!Number.isFinite(kg) || kg <= 0) return ''
    return kg >= 1000
        ? `${(kg / 1000).toLocaleString('az-AZ', { maximumFractionDigits: 2 })} ton`
        : `${kg.toLocaleString('az-AZ')} kq`
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
    return <div className="dialog-field"><small>{label}</small><strong>{children}</strong></div>
}

export function DetailDialog({ load, loading = false, error = false, open, onClose }: {
    load: Load | null
    loading?: boolean
    error?: boolean
    open: boolean
    onClose: () => void
}) {
    if (!open) return null

    const fromCountry = load?.from_country_name
    const toCountry = load?.to_country_name
    const fromPlace = load?.from_location_name
    const toPlace = load?.to_location_name
    const hasCoordinates = load?.from_lat != null && load?.from_lng != null
        && load?.to_lat != null && load?.to_lng != null
    const mapUrl = hasCoordinates
        ? `https://www.google.com/maps/dir/${load!.from_lat},${load!.from_lng}/${load!.to_lat},${load!.to_lng}`
        : null
    const price = load?.price == null
        ? (load?.price_negotiable ? 'Razılaşma ilə' : null)
        : `${Number(load.price).toLocaleString('az-AZ')}${load.currency ? ` ${load.currency}` : ''}`
    const channel = load?.applications && channelLabels[load.applications]
    const pickupDate = load?.is_ready_for_loading ? null : formatDate(load?.pickup_from)
    const publishedAt = formatDateTime(load?.created_at)

    return (
        <div className="dialog-backdrop" onClick={onClose}>
            <section className="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="load-detail-title" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-heading">
                    <div>
                        <span className="overline">ELAN DETALI · #{load?.id ? `YD-${load.id}` : '—'}</span>
                        <h2 id="load-detail-title">{load?.title ?? 'Yük elanı'}</h2>
                        {load && <span className="dialog-status">{statusLabels[load.status] ?? load.status}</span>}
                    </div>
                    <button className="icon-button" onClick={onClose} aria-label="Modalı bağla"><X /></button>
                </div>

                {loading ? <div className="dialog-state">Elan məlumatları yüklənir…</div> : error || !load ? (
                    <div className="dialog-state dialog-error">Elan məlumatlarını əldə etmək mümkün olmadı. Yenidən cəhd edin.</div>
                ) : <>
                    <div className="dialog-route">
                        <div className="dialog-route-point">
                            {load.from_country_iso2 && <CountryFlag flag={load.from_country_iso2} className="dialog-flag" />}
                            {hasValue(fromPlace) && <strong>{fromPlace}</strong>}
                            {hasValue(fromCountry) && <small>{fromCountry}</small>}
                            {hasValue(load.from_address) && <small>{load.from_address}</small>}
                        </div>
                        <ArrowRight aria-hidden="true" />
                        <div className="dialog-route-point">
                            {load.to_country_iso2 && <CountryFlag flag={load.to_country_iso2} className="dialog-flag" />}
                            {hasValue(toPlace) && <strong>{toPlace}</strong>}
                            {hasValue(toCountry) && <small>{toCountry}</small>}
                            {hasValue(load.to_address) && <small>{load.to_address}</small>}
                        </div>
                    </div>

                    {mapUrl && <a className="dialog-map-link" href={mapUrl} target="_blank" rel="noreferrer"><MapPin size={16} /> Marşrutu xəritədə aç</a>}

                    {price && (
                        <div className="dialog-price">
                            <strong>{load.price_negotiable && load.price != null ? `${price} · Razılaşma mümkündür` : price}</strong>
                        </div>
                    )}

                    {hasValue(load.description) && (
                        <section className="dialog-section">
                            <h3>Yük haqqında məlumat</h3>
                            <p className="dialog-description">{load.description}</p>
                        </section>
                    )}

                    <section className="dialog-section">
                        <h3><Package size={16} /> Yük parametrləri</h3>
                        <div className="dialog-grid">
                            {hasValue(load.cargo_type_name) && <DetailField label="Yükün növü">{load.cargo_type_name}</DetailField>}
                            {hasValue(load.load_vehicle_type_name) && <DetailField label="Yük yeri növü">{load.load_vehicle_type_name}</DetailField>}
                            {formatWeight(load.weight_kg) && <DetailField label="Çəki">{formatWeight(load.weight_kg)}</DetailField>}
                            {load.volume_m3 != null && Number(load.volume_m3) > 0 && <DetailField label="Həcm">{Number(load.volume_m3).toLocaleString('az-AZ')} m³</DetailField>}
                            {load.quantity != null && <DetailField label="Miqdar">{Number(load.quantity).toLocaleString('az-AZ')}</DetailField>}
                            {load.pallets != null && <DetailField label="Palet sayı">{Number(load.pallets).toLocaleString('az-AZ')}</DetailField>}
                            {load.is_hazardous && (
                                <div className="dialog-hazard" role="note" aria-label="ADR təhlükəli yük">
                                    <AlertTriangle size={18} />
                                    <strong>ADR</strong>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="dialog-section">
                        <h3><Truck size={16} /> Daşıma şərtləri</h3>
                        <div className="dialog-grid">
                            {hasValue(load.vehicle_type_name) && <DetailField label="Tələb olunan nəqliyyat vasitəsi">{load.vehicle_type_name}</DetailField>}
                            {pickupDate && <DetailField label="Yükləmə tarixi">{pickupDate}</DetailField>}
                            {load.is_ready_for_loading && <DetailField label="Yükləmə">Yükləməyə hazırdır</DetailField>}
                            {channel && <DetailField label="Elanın kanalı">{channel}</DetailField>}
                        </div>
                    </section>

                    <section className="dialog-section">
                        <h3><CalendarDays size={16} /> Elan məlumatları</h3>
                        <div className="dialog-grid">
                            <DetailField label="Elan ID-si">YD-{load.id}</DetailField>
                            {publishedAt && <DetailField label="Paylaşılma tarixi">{publishedAt}</DetailField>}
                            {hasValue(load.shipper_name) && <DetailField label="Elanı yerləşdirən">{load.shipper_name}</DetailField>}
                        </div>
                    </section>
                </>}

                <button className="icon-button dialog-close-action" onClick={onClose}>Bağla</button>
            </section>
        </div>
    )
}
