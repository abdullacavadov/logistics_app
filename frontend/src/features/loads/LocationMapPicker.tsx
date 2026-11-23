import { useEffect, useRef, useState } from "react";
import { MapPin, RotateCcw } from "lucide-react";
import "./location-map-picker.css";

type Coordinates = { lat: number; lng: number };
type LeafletMarker = { setLatLng: (point: [number, number]) => LeafletMarker; addTo: (map: LeafletMap) => LeafletMarker; remove: () => void };
type LeafletMap = { setView: (point: [number, number], zoom: number) => LeafletMap; on: (event: string, callback: (event: { latlng: { lat: number; lng: number } }) => void) => LeafletMap; remove: () => void; invalidateSize: () => void };
type Leaflet = { map: (element: HTMLElement, options?: Record<string, unknown>) => LeafletMap; tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void }; marker: (point: [number, number]) => LeafletMarker };
declare global { interface Window { L?: Leaflet } }

let leafletPromise: Promise<Leaflet> | null = null;
function loadLeaflet(): Promise<Leaflet> {
    if (window.L) return Promise.resolve(window.L);
    if (!leafletPromise) {
        leafletPromise = new Promise((resolve, reject) => {
            if (!document.getElementById("leaflet-picker-css")) {
                const css = document.createElement("link");
                css.id = "leaflet-picker-css";
                css.rel = "stylesheet";
                css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(css);
            }
            const existing = document.getElementById("leaflet-picker-script") as HTMLScriptElement | null;
            const script = existing ?? document.createElement("script");
            script.id = "leaflet-picker-script";
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = () => window.L ? resolve(window.L) : reject(new Error("Map library did not initialize"));
            script.onerror = () => reject(new Error("Map library could not be loaded"));
            if (!existing) document.body.appendChild(script);
        });
    }
    return leafletPromise;
}

type Props = {
    label: string;
    focus?: Coordinates | null;
    selected?: Coordinates | null;
    onSelect: (coordinates: Coordinates) => void;
    onClear: () => void;
};

export default function LocationMapPicker({ label, focus, selected, onSelect, onClear }: Props) {
    const mapElement = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<LeafletMarker | null>(null);
    const onSelectRef = useRef(onSelect);
    const [mapError, setMapError] = useState(false);
    useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

    useEffect(() => {
        let cancelled = false;
        loadLeaflet().then((L) => {
            if (cancelled || !mapElement.current || mapRef.current) return;
            const initial = selected ?? focus ?? { lat: 40.4093, lng: 49.8671 };
            const map = L.map(mapElement.current, { zoomControl: true, scrollWheelZoom: true }).setView([initial.lat, initial.lng], selected ? 13 : focus ? 11 : 5);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
            map.on("click", (event) => {
                onSelectRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
            });
            mapRef.current = map;
            if (selected) markerRef.current = L.marker([selected.lat, selected.lng]).addTo(map);
            window.setTimeout(() => map.invalidateSize(), 120);
        }).catch(() => setMapError(true));
        return () => {
            cancelled = true;
            mapRef.current?.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (focus && Number.isFinite(focus.lat) && Number.isFinite(focus.lng)) {
            map.setView([focus.lat, focus.lng], selected ? 13 : 11);
        }
    }, [focus?.lat, focus?.lng]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (selected && Number.isFinite(selected.lat) && Number.isFinite(selected.lng)) {
            map.setView([selected.lat, selected.lng], 13);
            if (markerRef.current) markerRef.current.setLatLng([selected.lat, selected.lng]);
            else markerRef.current = window.L?.marker([selected.lat, selected.lng]).addTo(map) ?? null;
        } else if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }
    }, [selected?.lat, selected?.lng]);

    return (
        <div className="location-map-picker">
            <div className="location-map-picker-heading">
                <span><MapPin size={15} /> {label}</span>
                {selected && (
                    <button type="button" onClick={onClear} className="location-map-clear">
                        <RotateCcw size={14} /> Nöqtəni təmizlə
                    </button>
                )}
            </div>
            <div className="location-map-canvas" ref={mapElement} role="application" aria-label={label + " xəritəsi"} />
            {mapError ? <p className="location-map-error">Xəritə yüklənmədi. İnternet bağlantınızı yoxlayın.</p> : null}
            <div className="location-map-footer">
                {selected ? <span>Seçilən nöqtə: {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</span> : <span>Koordinat seçmək üçün xəritəyə toxunun (istəyə bağlı)</span>}
            </div>
        </div>
    );
}
