import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { ArrowRight, Bookmark, Clock3, MoveRight, Package, Truck, Weight, Monitor, CalendarDays, Ruler, Boxes, Snowflake } from 'lucide-react'
import type { Listing } from '../types'
import { CountryFlag } from './CountryFlag'

export function ListingCard({
    item,
    onSelect,
    saved,
    onSave,
}: {
    item: Listing;
    onSelect: () => void;
    saved: boolean;
    onSave: () => void;
}) {
    return (
        <article className="listing-card">
            <div className="listing-top">
                <span className="listing-id">REF: {item.id}</span>
                <span className="source">
                    <span className="source-dot" /> {item.source}
                </span>
                <button
                    className={"icon-button save " + (saved ? "is-saved" : "")}
                    onClick={onSave}
                    aria-label="Yadda saxla"
                >
                    <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
                </button>
            </div>
            <button className="route-row" onClick={onSelect}>
                <div className="route-end">
                    <CountryFlag flag={item.fromFlag} className="country-flag" />
                    <span>
                        <strong>{item.from}</strong>
                        <small>Yükləmə nöqtəsi</small>
                    </span>
                </div>
                <div className="route-track"><MoveRight size={15} /></div>
                <div className="route-end destination">
                    <CountryFlag flag={item.toFlag} className="country-flag" />
                    <span>
                        <strong>{item.to}</strong>
                        <small>Təyinat nöqtəsi</small>
                    </span>
                </div>
            </button>
            <div className="listing-specs">
                <span><Package size={15} />{item.cargo}</span>
                <span><Weight size={15} />{item.weight}</span>
                <span><Truck size={15} />{item.vehicle}</span>
                {item.volume && <span><Ruler size={15} />{item.volume}</span>}
                {item.needsRefrigeration && <span className="refrigeration-tag"><Snowflake size={15} />Soyuduculu nəqliyyat</span>}
                {item.quantity !== null && item.quantity !== undefined && (
                    <span><Boxes size={15} />Say: {item.quantity}</span>
                )}
                {item.pallets !== null && item.pallets !== undefined && item.pallets > 0 && (
                    <span>Palet: {item.pallets}</span>
                )}
                {item.urgent && <span><span className="urgent-tag">Təcili yük</span></span>}
            </div>
            <div className="listing-meta">
                <span>
                    <CalendarDays size={14} />
                    Yükləmə: {item.isReadyForLoading ? "Yükləməyə hazır" : (item.pickupDate ?? "Tarix göstərilməyib")}{item.pickupTo ? ` – ${item.pickupTo}` : ""}
                </span>
                {item.deliveryBy && <span>Çatdırılma: {item.deliveryBy}</span>}
            </div>
            <div className="listing-footer">
                <div>
                    <small>Təklif olunan qiymət</small>
                    <strong className="price">{item.price}</strong>
                </div>
                <button className="outline-action" onClick={onSelect}>
                    Ətraflı <ArrowRight size={15} />
                </button>
            </div>
            <div className="listing-meta">
                <span><Clock3 size={14} />Elan tarixi: {item.date}</span>
                {item.application === "WhatsApp-dan" ? (
                    <span style={{ color: "#1db053" }}>
                        <FontAwesomeIcon icon={faWhatsapp} />{item.application}
                    </span>
                ) : (
                    <span style={{ color: "var(--brand-orange)" }}>
                        <Monitor size={14} />{item.application}
                    </span>
                )}
            </div>
        </article>
    );
}
