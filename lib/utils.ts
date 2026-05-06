import crypto from 'crypto'

export function formatPrice(amount: number, currency = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function generateLicenseKey(): string {
  const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase()
  return `ZENY-${seg()}-${seg()}-${seg()}-${seg()}`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
