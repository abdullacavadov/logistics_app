import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from 'libphonenumber-js'
import examples from 'libphonenumber-js/examples.mobile.json'

interface PhoneNumberFieldProps {
  countryIso2: string
  value: string
  onCountryChange: (iso2: string) => void
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
  required?: boolean
  id?: string
}

const regionNames = new Intl.DisplayNames(['az'], { type: 'region' })
const phoneCountries = getCountries()
  .map(iso2 => ({ iso2, name: regionNames.of(iso2) ?? iso2 }))
  .sort((a, b) => a.name.localeCompare(b.name, 'az'))

function countryCode(iso2: string): CountryCode | null {
  const code = iso2.trim().toUpperCase()
  return phoneCountries.some(country => country.iso2 === code)
    ? code as CountryCode
    : null
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

/**
 * Returns a validated, human-readable international number for storage.
 * The national formatting is retained after the country calling code:
 * AZ: +994 55 514 95 55
 * RU: +7 8 (912) 123-12-31
 * US: +1 (201) 555-5555
 */
export function normalizePhoneNumber(value: string, countryIso2: string): string | null {
  const code = countryCode(countryIso2)
  if (!code) return null

  const phone = parsePhoneNumberFromString(value, code)
  if (!phone?.isValid()) return null

  let national = phone.formatNational()

  // Azerbaijan's domestic trunk prefix 0 is not part of the international number.
  if (code === 'AZ') {
    national = national.replace(/^0\\s*/, '')
  }

  return `+${phone.countryCallingCode} ${national}`.trim()
}

export default function PhoneNumberField({
  countryIso2,
  value,
  onCountryChange,
  onChange,
  autoComplete = 'tel-national',
  placeholder,
  required = false,
  id,
}: PhoneNumberFieldProps) {
  const selected = phoneCountries.find(country => country.iso2 === countryIso2.toUpperCase()) ?? phoneCountries[0]
  const selectedIso2 = selected?.iso2 ?? countryIso2.toUpperCase()
  const code = countryCode(selectedIso2)
  const callingCode = dialCode(selectedIso2)
  const exampleNumber = code ? getExampleNumber(code, examples)?.formatNational() : undefined
  const dynamicPlaceholder = exampleNumber ?? placeholder ?? 'Telefon nömrəsi'

  // Store only national digits; render a country-aware format while typing.
  const nationalDigits = value.replace(/\\D/g, '')
  const formatted = code && nationalDigits ? new AsYouType(code).input(nationalDigits) : nationalDigits

  function handleInput(nextValue: string) {
    let digits = nextValue.replace(/\\D/g, '')

    // Do not retain Azerbaijan's domestic leading zero after selecting +994.
    if (selectedIso2 === 'AZ' && digits.startsWith('0')) {
      digits = digits.replace(/^0+/, '')
    }

    if (!code) {
      onChange(digits)
      return
    }

    if (digits && validatePhoneNumberLength(digits, code) === 'TOO_LONG') return
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
          value={selectedIso2}
          onChange={event => onCountryChange(event.target.value)}
        >
          {phoneCountries.map(country => (
            <option key={country.iso2} value={country.iso2}>
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
