import {
  AsYouType,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from 'libphonenumber-js'
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

function countryCode(iso2: string): CountryCode | null {
  const code = iso2.trim().toUpperCase()
  return /^[A-Z]{2}$/.test(code) ? code as CountryCode : null
}

function dialCode(iso2: string): string {
  const code = countryCode(iso2)
  if (!code) return ''
  try {
    return `+${getCountryCallingCode(code)}`
  } catch {
    return ''
  }
}

export function normalizePhoneNumber(value: string, countryIso2: string): string | null {
  const code = countryCode(countryIso2)
  if (!code) return null
  const phone = parsePhoneNumberFromString(value, code)
  return phone?.isValid() ? phone.number : null
}

export default function PhoneNumberField({
  countries,
  countryIso2,
  value,
  onCountryChange,
  onChange,
  autoComplete = 'tel-national',
  placeholder,
  required = false,
  id,
}: PhoneNumberFieldProps) {
  const selected = countries.find(country => country.iso2.toUpperCase() === countryIso2.toUpperCase()) ?? countries[0]
  const selectedIso2 = selected?.iso2.toUpperCase() ?? countryIso2.toUpperCase()
  const code = countryCode(selectedIso2)
  const callingCode = dialCode(selectedIso2)

  const exampleNumber = code
    ? getExampleNumber(code, examples)?.formatNational()
    : undefined
  const dynamicPlaceholder = exampleNumber ?? placeholder ?? 'Telefon nömrəsi'

  // Store only national digits; formatting is derived for the selected country.
  const nationalDigits = value.replace(/\\D/g, '')
  const formatted = code && nationalDigits
    ? new AsYouType(code).input(nationalDigits)
    : nationalDigits

  function handleInput(nextValue: string) {
    const digits = nextValue.replace(/\\D/g, '')
    if (!code) {
      onChange(digits)
      return
    }

    // Reject input beyond the maximum possible national-number length.
    if (digits && validatePhoneNumberLength(digits, code) === 'TOO_LONG') {
      return
    }

    onChange(digits)
  }

  return (
    <div className="phone-number-control">
      <div className="phone-country-picker" role="group" aria-label="Telefon ölkə kodu">
        {selected && (
          <img
            src={`https://flagcdn.com/w40/${selected.iso2.toLowerCase()}.png`}
            alt=""
            width="24"
            height="18"
            loading="lazy"
          />
        )}
        <span>{callingCode}</span>
        <span className="phone-country-chevron">▾</span>
        <select
          aria-label="Telefon ölkə kodu"
          value={selected?.iso2 ?? countryIso2}
          onChange={event => onCountryChange(event.target.value)}
          disabled={!countries.length}
        >
          {countries.map(country => (
            <option key={country.id} value={country.iso2}>
              {country.name} ({dialCode(country.iso2)})
            </option>
          ))}
        </select>
      </div>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        required={required}
        value={formatted}
        onChange={event => handleInput(event.target.value)}
        placeholder={dynamicPlaceholder}
      />
    </div>
  )
}
