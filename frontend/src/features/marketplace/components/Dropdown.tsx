import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type DropdownOption = {
    value: string;
    label: string;
    description?: string;
    leading?: ReactNode;
    disabled?: boolean;
};

type DropdownProps = {
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
};

export function Dropdown({
    value,
    options,
    onChange,
    placeholder = "Seçin",
    ariaLabel,
    searchable = false,
    searchPlaceholder = "Axtar…",
    className = "",
    disabled = false,
}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const selected = options.find((option) => option.value === value);
    const filtered = useMemo(() => {
        const term = search.trim().toLocaleLowerCase("az");
        if (!term) return options;
        return options.filter((option) =>
            `${option.label} ${option.description ?? ""}`
                .toLocaleLowerCase("az")
                .includes(term),
        );
    }, [options, search]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        if (searchable) searchRef.current?.focus();
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open, searchable]);

    return (
        <div
            ref={rootRef}
            className={`custom-dropdown ${className} ${open ? "is-open" : ""}`}
        >
            <button
                type="button"
                className="custom-dropdown-trigger"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={disabled}
                onClick={() => {
                    setOpen((current) => !current);
                    setSearch("");
                }}
            >
                {selected?.leading && (
                    <span className="custom-dropdown-leading">{selected.leading}</span>
                )}
                <span className={selected ? "custom-dropdown-value" : "custom-dropdown-placeholder"}>
                    {selected?.label ?? placeholder}
                </span>
                <ChevronDown size={15} className="custom-dropdown-chevron" />
            </button>
            {open && (
                <div className="custom-dropdown-menu">
                    {searchable && (
                        <label className="custom-dropdown-search">
                            <Search size={15} />
                            <input
                                ref={searchRef}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={searchPlaceholder}
                                aria-label={searchPlaceholder}
                            />
                        </label>
                    )}
                    <div className="custom-dropdown-options" role="listbox" aria-label={ariaLabel}>
                        {filtered.map((option) => (
                            <button
                                type="button"
                                key={option.value}
                                role="option"
                                aria-selected={option.value === value}
                                disabled={option.disabled}
                                className={`custom-dropdown-option ${option.value === value ? "is-selected" : ""}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                    setSearch("");
                                }}
                            >
                                {option.leading && (
                                    <span className="custom-dropdown-leading">{option.leading}</span>
                                )}
                                <span className="custom-dropdown-option-copy">
                                    <span>{option.label}</span>
                                    {option.description && <small>{option.description}</small>}
                                </span>
                                {option.value === value && <Check size={15} className="custom-dropdown-check" />}
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="custom-dropdown-empty">Uyğun nəticə tapılmadı.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
