import apiClient from '@/lib/api-client'
import { ApiResponse, PaginatedResponse, Purchase } from '@/types'

export interface CreatePurchaseData {
  supplierId: string
  items: {
    productId: string
    quantity: number
    cost: number
  }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled'
  notes?: string
}

export interface UpdatePurchaseData extends Partial<CreatePurchaseData> {
  id: string
}

const purchaseService = {
  getPurchases: async (params?: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
  }): Promise<PaginatedResponse<Purchase>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Purchase>>>(
      '/purchases',
      { params }
    )
    return response.data
  },

  getPurchase: async (id: string): Promise<Purchase> => {
    const response = await apiClient.get<ApiResponse<Purchase>>(`/purchases/${id}`)
    return response.data
  },

  createPurchase: async (data: CreatePurchaseData): Promise<Purchase> => {
    const response = await apiClient.post<ApiResponse<Purchase>>('/purchases', data)
    return response.data
  },

  updatePurchase: async (id: string, data: UpdatePurchaseData): Promise<Purchase> => {
    const response = await apiClient.put<ApiResponse<Purchase>>(`/purchases/${id}`, data)
    return response.data
  },

  deletePurchase: async (id: string): Promise<void> => {
    await apiClient.delete(`/purchases/${id}`)
  },

  approvePurchase: async (id: string): Promise<Purchase> => {
    const response = await apiClient.post<ApiResponse<Purchase>>(`/purchases/${id}/approve`)
    return response.data
  },

  receivePurchase: async (id: string): Promise<Purchase> => {
    const response = await apiClient.post<ApiResponse<Purchase>>(`/purchases/${id}/receive`)
    return response.data
  },
}

export default purchaseService
