import { ArrowRight, CalendarDays, MapPin, Package, Truck, X } from 'lucide-react'
import type { Load } from '../../../loads/types'
import { CountryFlag } from './CountryFlag'

const statusLabels: Record<string, string> = {
    draft: 'Qaralama', pending_moderation: 'Moderasiya gözləyir', rejected: 'Rədd edilib',
    published: 'Dərc edilib', has_applications: 'Müraciətlər var', agreed: 'Razılaşdırılıb',
    in_transit: 'Daşınır', completed: 'Tamamlanıb', cancelled: 'Ləğv edilib', archived: 'Arxivləşdirilib',
}
function valueOrDash(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === '' ? 'Göstərilməyib' : String(value)
}
function formatDate(value: string | null | undefined): string {
    if (!value) return 'Göstərilməyib'
    const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (match) {
        const [, year, month, day] = match
        return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`
    }
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? 'Göstərilməyib' : new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed)
}
function formatDateTime(value: string | null | undefined): string {
    if (!value) return 'Göstərilməyib'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return formatDate(value)
    return new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(parsed)
}
function formatWeight(value: number | string): string {
    const kg = Number(value)
    if (!Number.isFinite(kg)) return 'Göstərilməyib'
    return kg >= 1000 ? `${(kg / 1000).toLocaleString('az-AZ', { maximumFractionDigits: 2 })} ton (${kg.toLocaleString('az-AZ')} kq)` : `${kg.toLocaleString('az-AZ')} kq`
}
function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
    return <div className="dialog-field"><small>{label}</small><strong>{children}</strong></div>
}

export function DetailDialog({ load, loading = false, error = false, open, onClose }: {
    load: Load | null; loading?: boolean; error?: boolean; open: boolean; onClose: () => void
}) {
    if (!open) return null
    const fromCountry = load?.from_country_name ?? 'Yükləmə ölkəsi göstərilməyib'
    const toCountry = load?.to_country_name ?? 'Çatdırılma ölkəsi göstərilməyib'
    const fromPlace = load?.from_location_name ?? load?.from_name ?? load?.from_address ?? fromCountry
    const toPlace = load?.to_location_name ?? load?.to_name ?? load?.to_address ?? toCountry
    const hasCoordinates = load?.from_lat != null && load?.from_lng != null && load?.to_lat != null && load?.to_lng != null
    const mapUrl = hasCoordinates ? `https://www.google.com/maps/dir/${load!.from_lat},${load!.from_lng}/${load!.to_lat},${load!.to_lng}` : null
    const price = load?.price == null ? 'Razılaşma ilə' : `${Number(load.price).toLocaleString('az-AZ')} ${load.currency ?? ''}`.trim()

    return (
        <div className="dialog-backdrop" onClick={onClose}>
            <section className="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="load-detail-title" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-heading">
                    <div>
                        <span className="overline">ELAN DETALI · #{load?.id ?? '—'}</span>
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
                            <CountryFlag flag={load.from_country_iso2 ?? ''} className="dialog-flag" />
                            <strong>{fromPlace}</strong><small>{fromCountry}</small>
                            {load.from_address && <small>{load.from_address}</small>}
                        </div>
                        <ArrowRight aria-hidden="true" />
                        <div className="dialog-route-point">
                            <CountryFlag flag={load.to_country_iso2 ?? ''} className="dialog-flag" />
                            <strong>{toPlace}</strong><small>{toCountry}</small>
                            {load.to_address && <small>{load.to_address}</small>}
                        </div>
                    </div>
                    {mapUrl && <a className="dialog-map-link" href={mapUrl} target="_blank" rel="noreferrer"><MapPin size={16} /> Marşrutu xəritədə aç</a>}
                    <div className="dialog-price">
                        <small>Elanın qiyməti</small><strong>{price}</strong>
                        {load.price_negotiable && load.price !== null && <span>Qiymət razılaşdırıla bilər</span>}
                    </div>
                    {load.description && <section className="dialog-section"><h3>Yük haqqında məlumat</h3><p className="dialog-description">{load.description}</p></section>}
                    <section className="dialog-section">
                        <h3><Package size={16} /> Yük parametrləri</h3>
                        <div className="dialog-grid">
                            <DetailField label="Yükün növü">{valueOrDash(load.cargo_type_name)}</DetailField>
                            <DetailField label="Yükün forması / yeri">{valueOrDash(load.load_vehicle_type_name)}</DetailField>
                            <DetailField label="Çəki">{formatWeight(load.weight_kg)}</DetailField>
                            <DetailField label="Həcm">{load.volume_m3 == null ? 'Göstərilməyib' : `${Number(load.volume_m3).toLocaleString('az-AZ')} m³`}</DetailField>
                            <DetailField label="Miqdar">{valueOrDash(load.quantity)}</DetailField>
                            <DetailField label="Palet sayı">{valueOrDash(load.pallets)}</DetailField>
                            <DetailField label="Təhlükəli yük">{load.is_hazardous ? 'Bəli' : 'Xeyr'}</DetailField>
                        </div>
                    </section>
                    <section className="dialog-section">
                        <h3><Truck size={16} /> Daşıma şərtləri</h3>
                        <div className="dialog-grid">
                            <DetailField label="Tələb olunan nəqliyyat vasitəsi">{valueOrDash(load.vehicle_type_name)}</DetailField>
                            <DetailField label="Yükləmə tarixi">{load.is_ready_for_loading ? 'Yükləməyə hazırdır' : formatDate(load.pickup_from)}</DetailField>
                            <DetailField label="Yükləməyə hazır statusu">{load.is_ready_for_loading ? 'Bəli' : 'Xeyr'}</DetailField>
                            <DetailField label="Müraciət kanalı">{load.applications === 'whatsapp' ? 'WhatsApp' : 'Veb-sayt'}</DetailField>
                        </div>
                    </section>
                    <section className="dialog-section">
                        <h3><CalendarDays size={16} /> Elan məlumatları</h3>
                        <div className="dialog-grid">
                            <DetailField label="Elan ID-si">#{load.id}</DetailField>
                            <DetailField label="Status">{statusLabels[load.status] ?? load.status}</DetailField>
                            <DetailField label="Paylaşılma tarixi">{formatDateTime(load.created_at)}</DetailField>
                            <DetailField label="Elanı yerləşdirən">{valueOrDash(load.shipper_name)}</DetailField>
                        </div>
                    </section>
                </>}
                <button className="icon-button dialog-close-action" onClick={onClose}>Bağla</button>
            </section>
        </div>
    )
}
