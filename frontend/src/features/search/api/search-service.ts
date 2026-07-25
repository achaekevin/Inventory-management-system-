import apiClient from '@/lib/api-client'
import { ApiResponse, PaginationMeta } from '@/types'

export type EntityType = 'all' | 'products' | 'customers' | 'suppliers' | 'orders' | 'invoices' | 'users'

export interface SearchResultItem {
  id: string
  type: 'product' | 'customer' | 'supplier' | 'order' | 'invoice' | 'user'
  subType?: string
  title: string
  subtitle: string
  url: string
  status: string
  createdAt: string
  details?: Record<string, any>
}

export interface SearchCounts {
  all: number
  products: number
  customers: number
  suppliers: number
  orders: number
  invoices: number
  users: number
}

export interface GlobalSearchData {
  results: SearchResultItem[]
  counts: SearchCounts
}

export interface SearchQueryParams {
  q?: string
  type?: EntityType
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export const searchApi = {
  globalSearch: async (params: SearchQueryParams): Promise<ApiResponse<GlobalSearchData> & { pagination?: PaginationMeta }> => {
    const response = await apiClient.get('/search', { params })
    return response as any
  },

  autocomplete: async (q: string): Promise<ApiResponse<SearchResultItem[]>> => {
    const response = await apiClient.get('/search/autocomplete', { params: { q } })
    return response as any
  },
}
