const flagCodes: Record<string, string> = {
    "AZ": "az",
    "TR": "tr",
    "GE": "ge",
    "KZ": "kz",
    "RU": "ru",
    "GB": "gb",
    "CN": "cn",
};

export function CountryFlag({
    flag,
    className = "",
}: {
    flag: string;
    className?: string;
}) {
    const code = flagCodes[flag];
    return code ? (
        <img
            className={className}
            src={`https://flagcdn.com/w40/${code}.png`}
            srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
            alt={`${code.toUpperCase()} flag`}
            loading="lazy"
        />
    ) : (
        <span
            className={className}
            role="img"
            aria-label="Beynəlxalq istiqamət"
        >
            {flag}
        </span>
    );
}
