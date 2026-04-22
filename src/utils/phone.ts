export function stripPhoneDigits(value: string | null | undefined) {
  return (value ?? '').replace(/\D/g, '')
}

export function normalizeBrazilPhone(value: string | null | undefined) {
  const digits = stripPhoneDigits(value)
  if (!digits) return null

  let normalized = digits
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    normalized = digits.slice(2)
  }

  if (normalized.length === 10 || normalized.length === 11) {
    return normalized
  }

  return null
}

export function formatBrazilPhone(value: string | null | undefined) {
  const digits = stripPhoneDigits(value)
  if (!digits) return ''

  const withoutCountryCode = digits.startsWith('55') && digits.length > 11
    ? digits.slice(2)
    : digits

  const limited = withoutCountryCode.slice(0, 11)
  if (limited.length <= 2) return limited ? `(${limited}` : ''

  const ddd = limited.slice(0, 2)
  const number = limited.slice(2)

  if (limited.length <= 6) return `(${ddd}) ${number}`
  if (limited.length <= 10) return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`
  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5, 9)}`
}

export function isValidBrazilPhone(value: string | null | undefined) {
  return normalizeBrazilPhone(value) !== null
}
