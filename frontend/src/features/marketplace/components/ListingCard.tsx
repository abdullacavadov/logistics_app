import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faTelegram } from "@fortawesome/free-brands-svg-icons";
import {
    Map,
    Bookmark,
    Package,
    Clock3,
    MoveRight,
    ThermometerSnowflake,
    Truck,
    Weight,
    Monitor,
    CalendarDays,
    Boxes,
} from "lucide-react";
import type { Listing } from "../types";
import { CountryFlag, getCountryIso3 } from "./CountryFlag";

function formatDate(date: string) {
    if (!date) return "";

    const normalized = date
        .trim()
        .replace("T", " ")
        .replace(/\.\d+Z?$/, "")
        .replace(/Z$/, "");

    const match = normalized.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
    );

    if (!match) return date;

    const [, year, month, day, hour, minute] = match;
    const formattedDate = `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;

    if (hour && minute) {
        return `${formattedDate} ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    }

    return formattedDate;
}

export function ListingCard({
    item,
    onSelect,
    saved,
    onSave,
    status,
    footerAction,
    showSave = true,
    showApplication = true,
}: {
    item: Listing;
    onSelect: () => void;
    saved: boolean;
    onSave: () => void;
    status?: { label: string; tone: "pending" | "published" | "rejected" | "archived" };
    footerAction?: ReactNode;
    showSave?: boolean;
    showApplication?: boolean;
}) {
    return (
        <article className="listing-card">
            <div className="listing-top">
                <h3>
                    <strong>{item.cargo}</strong>
                </h3>
                {item.title && item.title !== item.cargo && (
                    <small className="listing-title">{item.title}</small>
                )}
                {status && (
                    <span className={`listing-status is-${status.tone}`}>
                        {status.label}
                    </span>
                )}

                {showSave && (
                    <button
                        className={"icon-button save " + (saved ? "is-saved" : "")}
                        onClick={onSave}
                        aria-label="Yadda saxla"
                    >
                        <Bookmark
                            size={17}
                            fill={saved ? "currentColor" : "none"}
                        />
                    </button>
                )}
            </div>
            <button className="route-row" onClick={onSelect}>
                <div className="route-end">
                    <CountryFlag
                        flag={item.fromFlag}
                        className="country-flag"
                    />
                    <span>
                        <strong>{item.from}</strong>
                        <small>{getCountryIso3(item.fromFlag)}</small>
                    </span>
                </div>
                <div className="route-track">
                    <MoveRight size={15} />
                </div>
                <div className="route-end destination">
                    <CountryFlag flag={item.toFlag} className="country-flag" />
                    <span>
                        <strong>{item.to}</strong>
                        <small>{getCountryIso3(item.toFlag)}</small>
                    </span>
                </div>
            </button>
            <div className="listing-specs">
                <span>
                    <Weight size={15} />
                    {item.weight}
                </span>
                {item.vehicle === "Ref — rejimli" || item.vehicle === "Ref — rejimsiz" ? (
                    <span>
                        <Truck size={15} />
                        <span className="refrigeration-tag">
                        <ThermometerSnowflake size={15} />
                        {item.vehicle}
                    </span></span>
                ) : (
                    <span>
                        <Truck size={15} />
                        {item.vehicle}
                    </span>
                )}
                
                {item.volume !== null && item.volume !== undefined && (
                    <span>
                        <Package size={15} />
                        {item.volume}
                    </span>
                )}
                {item.quantity !== null && item.quantity !== undefined && (
                    <span>
                        <Boxes size={15} />
                        Say: {item.quantity}
                    </span>
                )}
                {item.pallets !== null &&
                    item.pallets !== undefined &&
                    item.pallets > 0 && <span>Palet: {item.pallets}</span>}
                {item.urgent && (
                    <span>
                        <span className="urgent-tag">Təcili yük</span>
                    </span>
                )}
            </div>
            {(item.isReadyForLoading || item.pickupDate) && (
                <div className="listing-meta">
                    <span>
                        <CalendarDays size={14} />
                        <b>Yükləmə:</b> {item.isReadyForLoading ? <span className="ready-loading">Hazır</span> : formatDate(item.pickupDate ?? "")}
                        {!item.isReadyForLoading && item.pickupTo ? ` – ${formatDate(item.pickupTo)}` : ""}
                    </span>
                </div>
            )}
            <div
                className={
                    typeof window !== "undefined" &&
                    window.location.pathname.replace(/\/$/, "") === "/my/loads"
                        ? "my-listing-footer"
                        : "listing-footer"
                }
            >
                <div>
                    <small><b>Təklif olunan qiymət</b></small>
                    <strong className="price">{item.price}</strong>
                </div>
                {footerAction ?? (
                    <button className="outline-action" onClick={onSelect}>
                        <Map size={15} /> Xəritədə bax
                    </button>
                )}
            </div>
            <div className="listing-meta">
                <span>
                    <Clock3 size={14} />
                    {formatDate(item.date)}
                </span>
                {showApplication && (item.application === "WhatsApp-dan" ? (
                    <span style={{ color: "#1db053" }}>
                        <FontAwesomeIcon icon={faWhatsapp} />
                        {item.application}
                    </span>
                ) : item.application === "Telegram-dan" ? (
                    <span style={{ color: "#0088cc" }}>
                        <FontAwesomeIcon icon={faTelegram} />
                        {item.application}
                    </span>
                ) : (
                    <span style={{ color: "var(--brand-orange)" }}>
                        <Monitor size={14} />
                        {item.application}
                    </span>
                ))}
            </div>
        </article>
    );
}
