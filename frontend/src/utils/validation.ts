// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-+()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

// Password strength
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number
} => {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { strength: 'weak', score }
  if (score === 3) return { strength: 'medium', score }
  if (score === 4) return { strength: 'strong', score }
  return { strength: 'very-strong', score }
}

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Number validation
export const isValidNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && value.trim() !== ''
}

// Positive number validation
export const isPositiveNumber = (value: number): boolean => {
  return value > 0
}

// Required field validation
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

// Min length validation
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min
}

// Max length validation
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max
}

// Range validation
export const inRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

// Date validation
export const isValidDate = (date: string | Date): boolean => {
  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime())
}

// Future date validation
export const isFutureDate = (date: string | Date): boolean => {
  const dateObj = new Date(date)
  return dateObj > new Date()
}

// Past date validation
export const isPastDate = (date: string | Date): boolean => {
  const dateObj = new Date(date)
  return dateObj < new Date()
}

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '')
  if (cleaned.length < 13 || cleaned.length > 19) return false

  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// File size validation
export const isValidFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// File type validation
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}
