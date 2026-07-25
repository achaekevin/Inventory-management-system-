import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import {
  SupportedLanguage,
  translations,
} from '@/features/localization/i18n'
import {
  localizationApi,
  LocalizationSettingsData,
} from '@/features/localization/api/localization-service'

interface LocalizationContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (key: string, fallback?: string) => string
  currency: string
  currencySymbol: string
  setCurrency: (curr: string) => void
  timezone: string
  setTimezone: (tz: string) => void
  dateFormat: string
  setDateFormat: (fmt: string) => void
  taxMode: 'inclusive' | 'exclusive'
  setTaxMode: (mode: 'inclusive' | 'exclusive') => void
  taxRate: number
  setTaxRate: (rate: number) => void
  taxName: string
  exchangeRates: Record<string, number>
  formatPrice: (amount: number, targetCurrency?: string) => string
  formatDateLocalized: (date: Date | string, customFormat?: string) => string
  calculateLocalizedTax: (subtotal: number) => { subtotal: number; taxAmount: number; total: number }
  direction: 'ltr' | 'rtl'
  isSyncing: boolean
  saveSettings: (updated: Partial<LocalizationSettingsData>) => Promise<void>
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  KES: 'KSh',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
  AED: 'AED',
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined)

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('sys_language') as SupportedLanguage) || 'en'
  })
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('sys_currency') || 'USD'
  })
  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    return CURRENCY_SYMBOLS[currency] || '$'
  })
  const [timezone, setTimezoneState] = useState<string>(() => {
    return localStorage.getItem('sys_timezone') || 'UTC'
  })
  const [dateFormat, setDateFormatState] = useState<string>(() => {
    return localStorage.getItem('sys_date_format') || 'MMM dd, yyyy'
  })
  const [taxMode, setTaxModeState] = useState<'inclusive' | 'exclusive'>('exclusive')
  const [taxRate, setTaxRateState] = useState<number>(16)
  const [taxName, setTaxNameState] = useState<string>('VAT')
  const [exchangeRates, setExchangeRatesState] = useState<Record<string, number>>({
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    KES: 130.0,
    JPY: 155.0,
    CAD: 1.36,
    AUD: 1.52,
    INR: 83.5,
    AED: 3.67,
  })
  const [isSyncing, setIsSyncing] = useState(false)

  // Load backend localization settings on mount
  useEffect(() => {
    const fetchBackendSettings = async () => {
      try {
        const response = await localizationApi.getSettings()
        if (response.success && response.data) {
          const d = response.data
          if (d.language && !localStorage.getItem('sys_language')) setLanguageState(d.language as any)
          if (d.currency && !localStorage.getItem('sys_currency')) setCurrencyState(d.currency)
          if (d.currencySymbol) setCurrencySymbol(d.currencySymbol)
          if (d.timezone && !localStorage.getItem('sys_timezone')) setTimezoneState(d.timezone)
          if (d.dateFormat && !localStorage.getItem('sys_date_format')) setDateFormatState(d.dateFormat)
          if (d.taxMode) setTaxModeState(d.taxMode)
          if (d.taxRate) setTaxRateState(d.taxRate)
          if (d.taxName) setTaxNameState(d.taxName)
          if (d.exchangeRates) setExchangeRatesState(d.exchangeRates)
        }
      } catch (error) {
        console.error('Failed to load localization settings:', error)
      }
    }
    fetchBackendSettings()
  }, [])

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang)
    localStorage.setItem('sys_language', lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  const setCurrency = (curr: string) => {
    setCurrencyState(curr)
    localStorage.setItem('sys_currency', curr)
    setCurrencySymbol(CURRENCY_SYMBOLS[curr.toUpperCase()] || curr)
  }

  const setTimezone = (tz: string) => {
    setTimezoneState(tz)
    localStorage.setItem('sys_timezone', tz)
  }

  const setDateFormat = (fmt: string) => {
    setDateFormatState(fmt)
    localStorage.setItem('sys_date_format', fmt)
  }

  const setTaxMode = (mode: 'inclusive' | 'exclusive') => {
    setTaxModeState(mode)
  }

  const setTaxRate = (rate: number) => {
    setTaxRateState(rate)
  }

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = translations[language] || translations.en
      return dict[key] || translations.en[key] || fallback || key
    },
    [language]
  )

  const formatPrice = useCallback(
    (amount: number, targetCurr?: string): string => {
      const curr = targetCurr || currency
      const symbol = CURRENCY_SYMBOLS[curr.toUpperCase()] || curr
      const rate = exchangeRates[curr.toUpperCase()] || 1.0

      const converted = amount * rate
      const val = Number(converted) || 0

      return `${symbol} ${val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    },
    [currency, exchangeRates]
  )

  const formatDateLocalized = useCallback(
    (date: Date | string, customFormat?: string): string => {
      try {
        const dObj = typeof date === 'string' ? new Date(date) : date
        if (isNaN(dObj.getTime())) return String(date)
        const fmtStr = customFormat || dateFormat || 'MMM dd, yyyy'
        return format(dObj, fmtStr)
      } catch {
        return String(date)
      }
    },
    [dateFormat]
  )

  const calculateLocalizedTax = useCallback(
    (subtotal: number) => {
      const rateDecimal = taxRate / 100
      let taxAmount = 0
      let total = subtotal

      if (taxMode === 'inclusive') {
        taxAmount = subtotal - subtotal / (1 + rateDecimal)
        total = subtotal
      } else {
        taxAmount = subtotal * rateDecimal
        total = subtotal + taxAmount
      }

      return {
        subtotal: Number(subtotal.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
      }
    },
    [taxRate, taxMode]
  )

  const saveSettings = async (updated: Partial<LocalizationSettingsData>) => {
    setIsSyncing(true)
    try {
      const response = await localizationApi.updateSettings(updated)
      if (response.success && response.data) {
        const d = response.data
        if (d.language) setLanguage(d.language as any)
        if (d.currency) setCurrency(d.currency)
        if (d.timezone) setTimezone(d.timezone)
        if (d.dateFormat) setDateFormat(d.dateFormat)
        if (d.taxMode) setTaxModeState(d.taxMode)
        if (d.taxRate) setTaxRateState(d.taxRate)
        if (d.taxName) setTaxNameState(d.taxName)
        if (d.exchangeRates) setExchangeRatesState(d.exchangeRates)
      }
    } catch (error) {
      console.error('Failed to save localization settings:', error)
      throw error
    } finally {
      setIsSyncing(false)
    }
  }

  const direction = language === 'ar' ? 'rtl' : 'ltr'

  return (
    <LocalizationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currency,
        currencySymbol,
        setCurrency,
        timezone,
        setTimezone,
        dateFormat,
        setDateFormat,
        taxMode,
        setTaxMode,
        taxRate,
        setTaxRate,
        taxName,
        exchangeRates,
        formatPrice,
        formatDateLocalized,
        calculateLocalizedTax,
        direction,
        isSyncing,
        saveSettings,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  )
}

export const useLocalization = () => {
  const context = useContext(LocalizationContext)
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider')
  }
  return context
}
