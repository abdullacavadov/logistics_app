import { AsYouType, getCountryCallingCode, getExampleNumber, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'
import examples from 'libphonenumber-js/examples.mobile.json'
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
  const exampleNumber = selectedIso2
    ? getExampleNumber(selectedIso2 as CountryCode, examples)?.formatNational()
    : undefined
  const dynamicPlaceholder = placeholder === 'Telefon nömrəsi' || !placeholder
    ? (exampleNumber ?? 'Telefon nömrəsi')
    : (exampleNumber ?? placeholder)
  const formatted = value
    ? new AsYouType(selectedIso2 as CountryCode).input(value)
    : ''

  return (
    <div className="phone-number-control">
      <div className="phone-country-picker" role="group" aria-label="Telefon ölkə kodu">
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
      </div>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        required={required}
        value={formatted}
        onChange={event => onChange(event.target.value)}
        placeholder={dynamicPlaceholder}
      />
    </div>
  )
}
