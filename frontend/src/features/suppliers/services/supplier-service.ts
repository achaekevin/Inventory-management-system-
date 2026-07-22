import apiClient from '@/lib/api-client'
import { ApiResponse, PaginatedResponse, Supplier } from '@/types'

export interface CreateSupplierData {
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  country?: string
  taxId?: string
  creditLimit?: number
  paymentTerms?: string
  isActive: boolean
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  id: string
}

const supplierService = {
  getSuppliers: async (params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<PaginatedResponse<Supplier>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Supplier>>>(
      '/suppliers',
      { params }
    )
    return response.data
  },

  getSupplier: async (id: string): Promise<Supplier> => {
    const response = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`)
    return response.data
  },

  createSupplier: async (data: CreateSupplierData): Promise<Supplier> => {
    const response = await apiClient.post<ApiResponse<Supplier>>('/suppliers', data)
    return response.data
  },

  updateSupplier: async (id: string, data: UpdateSupplierData): Promise<Supplier> => {
    const response = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data)
    return response.data
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`)
  },
}

export default supplierService
