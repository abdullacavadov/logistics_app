import { AsYouType, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'
import type { Country } from '../catalog/catalogApi'

interface PhoneNumberFieldProps {
  countries: Country[]
  countryIso2: string
  value: string
  onCountryChange: (iso2: string) => void
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
  required?: boolean
  id?: string
}

function dialCode(iso2: string): string {
  try {
    return `+${getCountryCallingCode(iso2 as CountryCode)}`
  } catch {
    return ''
  }
}

export function normalizePhoneNumber(value: string, countryIso2: string): string | null {
  const phone = parsePhoneNumberFromString(value, countryIso2 as CountryCode)
  return phone?.isValid() ? phone.number : null
}

export default function PhoneNumberField({
  countries,
  countryIso2,
  value,
  onCountryChange,
  onChange,
  autoComplete = 'tel-national',
  placeholder = 'Telefon nömrəsi',
  required = false,
  id,
}: PhoneNumberFieldProps) {
  const selected = countries.find(country => country.iso2 === countryIso2) ?? countries[0]
  const selectedIso2 = selected?.iso2 ?? countryIso2
  const callingCode = dialCode(selectedIso2)
  const formatted = value
    ? new AsYouType(selectedIso2 as CountryCode).input(value)
    : ''

  return (
    <div className="phone-number-control">
      <label className="phone-country-picker" aria-label="Telefon ölkə kodu">
        {selected && <img src={`https://flagcdn.com/w40/${selected.iso2.toLowerCase()}.png`} alt="" width="24" height="18" loading="lazy" />}
        <span>{callingCode}</span>
        <span className="phone-country-chevron">▾</span>
        <select
          aria-label="Telefon ölkə kodu"
          value={selectedIso2}
          onChange={event => onCountryChange(event.target.value)}
          disabled={!countries.length}
        >
          {countries.map(country => (
            <option key={country.id} value={country.iso2}>{country.name} ({dialCode(country.iso2)})</option>
          ))}
        </select>
      </label>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        required={required}
        value={formatted}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
