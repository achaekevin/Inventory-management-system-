import apiClient from '@/lib/api-client'
import { ApiResponse, PaginationMeta } from '@/types'

export interface PaymentItem {
  id: string
  saleId?: string
  amount: number
  method: 'cash' | 'mpesa' | 'card' | 'bank_transfer' | 'check' | string
  reference?: string
  status: 'completed' | 'pending' | 'failed' | string
  notes?: string
  createdAt: string
  updatedAt: string
  sale?: {
    id: string
    saleNumber: string
    invoiceNumber: string
    total: number
    customer?: {
      id: string
      firstName: string
      lastName: string
      companyName?: string
    }
  }
}

export interface PaymentSummary {
  totalAmount: number
  totalCount: number
  byMethod: Array<{
    method: string
    amount: number
    count: number
  }>
}

export interface CreatePaymentInput {
  saleId?: string
  amount: number
  method: string
  reference?: string
  notes?: string
}

export interface GetPaymentsParams {
  page?: number
  pageSize?: number
  search?: string
  method?: string
  status?: string
  saleId?: string
}

const paymentService = {
  getPayments: async (params?: GetPaymentsParams) => {
    const response = await apiClient.get<ApiResponse<PaymentItem[]>>('/payments', { params })
    return {
      data: response.data?.data || [],
      pagination: (response.data as any)?.pagination as PaginationMeta | undefined,
    }
  },

  getPaymentSummary: async (): Promise<PaymentSummary> => {
    const response = await apiClient.get<ApiResponse<any>>('/payments/summary/overview')
    const resData = response.data?.data || {}
    return {
      totalAmount: resData.totalPayments?._sum?.amount || 0,
      totalCount: resData.paymentsCount || 0,
      byMethod: (resData.paymentsByMethod || []).map((m: any) => ({
        method: m.method,
        amount: m._sum?.amount || 0,
        count: m._count || 0,
      })),
    }
  },

  getPaymentMethods: async () => {
    const response = await apiClient.get<ApiResponse<string[]>>('/payments/methods/list')
    return response.data?.data || ['cash', 'mpesa', 'card', 'bank_transfer', 'check']
  },

  createPayment: async (data: CreatePaymentInput): Promise<PaymentItem> => {
    const response = await apiClient.post<ApiResponse<PaymentItem>>('/payments', data)
    return response.data.data
  },

  voidPayment: async (id: string): Promise<PaymentItem> => {
    const response = await apiClient.post<ApiResponse<PaymentItem>>(`/payments/${id}/void`)
    return response.data.data
  },

  deletePayment: async (id: string): Promise<void> => {
    await apiClient.delete(`/payments/${id}`)
  },
}

export default paymentService
