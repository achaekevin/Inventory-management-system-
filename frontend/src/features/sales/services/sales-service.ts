import apiClient from '@/lib/api-client'
import { ApiResponse, PaginatedResponse, Sale, SaleItem } from '@/types'

export interface CreateSaleData {
  customerId?: string
  items: {
    productId: string
    quantity: number
    price: number
    discount?: number
  }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money'
  paymentStatus: 'paid' | 'pending' | 'partial'
  notes?: string
}

const salesService = {
  getSales: async (params?: {
    page?: number
    pageSize?: number
    search?: string
    startDate?: string
    endDate?: string
  }): Promise<PaginatedResponse<Sale>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Sale>>>(
      '/sales',
      { params }
    )
    return response.data
  },

  getSale: async (id: string): Promise<Sale> => {
    const response = await apiClient.get<ApiResponse<Sale>>(`/sales/${id}`)
    return response.data
  },

  createSale: async (data: CreateSaleData): Promise<Sale> => {
    const response = await apiClient.post<ApiResponse<Sale>>('/sales', data)
    return response.data
  },

  deleteSale: async (id: string): Promise<void> => {
    await apiClient.delete(`/sales/${id}`)
  },

  getSalesStats: async (period?: string): Promise<{
    totalSales: number
    totalRevenue: number
    averageOrderValue: number
    topProducts: any[]
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/sales/stats', {
      params: { period },
    })
    return response.data
  },
}

export default salesService
