import { format, formatDistance, formatRelative } from 'date-fns'

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

// Number formatting
export const formatNumber = (value: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(value)
}

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`
}

// Date formatting
export const formatDate = (
  date: Date | string,
  formatStr: string = 'MMM dd, yyyy'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

// DateTime formatting
export const formatDateTime = (
  date: Date | string,
  formatStr: string = 'MMM dd, yyyy hh:mm a'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

// Time formatting
export const formatTime = (
  date: Date | string,
  formatStr: string = 'hh:mm a'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

// Relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

// Relative date (e.g., "today at 3:00 PM")
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatRelative(dateObj, new Date())
}

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Capitalize each word
export const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ')
}

// Truncate text
export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (str.length <= length) return str
  return str.slice(0, length) + suffix
}

// Slugify string
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Generate initials
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Mask email
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@')
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1)
  return `${maskedUsername}@${domain}`
}

// Mask phone
export const maskPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) ***-$3')
  }
  return phone
}

// Mask credit card
export const maskCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '')
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4)
}

// Format barcode
export const formatBarcode = (barcode: string): string => {
  // Remove any non-alphanumeric characters
  return barcode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

// Format SKU
export const formatSKU = (sku: string): string => {
  return sku.toUpperCase().replace(/\s+/g, '-')
}
