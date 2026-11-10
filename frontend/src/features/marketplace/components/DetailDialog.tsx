import { ArrowRight, X } from 'lucide-react'
import type { Listing } from '../types'
import { CountryFlag } from './CountryFlag'

export function DetailDialog({
    item,
    onClose,
}: {
    item: Listing | null;
    onClose: () => void;
}) {
    if (!item) return null;
    return (
        <div className="dialog-backdrop" onClick={onClose}>
            <section className="detail-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-heading">
                    <div>
                        <span className="overline">REF: {item.id} · ELAN DETALI</span>
                        <h2>Daşıma məlumatları</h2>
                    </div>
                    <button className="icon-button" onClick={onClose}><X /></button>
                </div>
                <div className="dialog-route">
                    <div>
                        <CountryFlag flag={item.fromFlag} className="dialog-flag" />
                        <strong>{item.from}</strong>
                        <small>Yükləmə şəhəri</small>
                    </div>
                    <ArrowRight />
                    <div>
                        <CountryFlag flag={item.toFlag} className="dialog-flag" />
                        <strong>{item.to}</strong>
                        <small>Təyinat şəhəri</small>
                    </div>
                </div>
                <div className="dialog-price">
                    <small>Qiymət</small>
                    <strong>{item.price}</strong>
                </div>
                <div className="dialog-grid">
                    <div><small>Yük növü</small><strong>{item.cargo}</strong></div>
                    <div><small>Çəki</small><strong>{item.weight}</strong></div>
                    <div><small>Nəqliyyat növü</small><strong>{item.vehicle}</strong></div>
                    <div><small>Həcm</small><strong>{item.volume ?? "Göstərilməyib"}</strong></div>
                    <div><small>Yük sayı</small><strong>{item.quantity ?? "Göstərilməyib"}</strong></div>
                    <div><small>Palet sayı</small><strong>{item.pallets ?? "Göstərilməyib"}</strong></div>
                    <div><small>Yükləmə tarixi</small><strong>{item.pickupDate ?? "Göstərilməyib"}{item.pickupTo ? ` – ${item.pickupTo}` : ""}</strong></div>
                    <div><small>Son çatdırılma tarixi</small><strong>{item.deliveryBy ?? "Göstərilməyib"}</strong></div>
                    <div><small>Elan tarixi</small><strong>{item.date}</strong></div>
                    <div><small>Elan kanalı</small><strong>{item.application}</strong></div>
                    <div><small>Elan sahibi</small><strong>{item.source}</strong></div>
                </div>
                <button className="primary-button full-width">
                    Bu elana müraciət et <ArrowRight size={16} />
                </button>
                <p className="dialog-note">
                    Müraciət funksiyası hesab və abunəlik statusuna uyğun aktivləşdiriləcək.
                </p>
            </section>
        </div>
    );
}
