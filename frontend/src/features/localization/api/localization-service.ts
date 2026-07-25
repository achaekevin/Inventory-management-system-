import apiClient from '@/lib/api-client'
import { ApiResponse } from '@/types'

export interface TaxRule {
  id: string
  name: string
  rate: number
  mode: 'inclusive' | 'exclusive'
  isDefault?: boolean
}

export interface LocalizationSettingsData {
  language: string
  currency: string
  currencySymbol: string
  timezone: string
  dateFormat: string
  taxMode: 'inclusive' | 'exclusive'
  taxRate: number
  taxName: string
  exchangeRates: Record<string, number>
  taxRules: TaxRule[]
}

export interface CurrencyConversionResult {
  amount: number
  convertedAmount: number
  fromCurrency: string
  toCurrency: string
  rate: number
}

export interface TaxCalculationResult {
  subtotal: number
  taxAmount: number
  total: number
  taxRate: number
  mode: 'inclusive' | 'exclusive'
}

export const localizationApi = {
  getSettings: async (): Promise<ApiResponse<LocalizationSettingsData>> => {
    const response = await apiClient.get('/localization/settings')
    return response as any
  },

  updateSettings: async (
    data: Partial<LocalizationSettingsData>
  ): Promise<ApiResponse<LocalizationSettingsData>> => {
    const response = await apiClient.put('/localization/settings', data)
    return response as any
  },

  convertCurrency: async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ApiResponse<CurrencyConversionResult>> => {
    const response = await apiClient.post('/localization/convert-currency', {
      amount,
      fromCurrency,
      toCurrency,
    })
    return response as any
  },

  calculateTax: async (
    subtotal: number,
    taxRate: number,
    mode: 'inclusive' | 'exclusive'
  ): Promise<ApiResponse<TaxCalculationResult>> => {
    const response = await apiClient.post('/localization/calculate-tax', {
      subtotal,
      taxRate,
      mode,
    })
    return response as any
  },
}
