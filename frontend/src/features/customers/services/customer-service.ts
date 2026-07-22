import apiClient from '@/lib/api-client'
import { ApiResponse, PaginatedResponse, Customer } from '@/types'

export interface CreateCustomerData {
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  country?: string
  creditLimit?: number
  loyaltyPoints?: number
  isActive: boolean
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string
}

const customerService = {
  getCustomers: async (params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<PaginatedResponse<Customer>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Customer>>>(
      '/customers',
      { params }
    )
    return response.data
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`)
    return response.data
  },

  createCustomer: async (data: CreateCustomerData): Promise<Customer> => {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data)
    return response.data
  },

  updateCustomer: async (id: string, data: UpdateCustomerData): Promise<Customer> => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data)
    return response.data
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`)
  },
}

export default customerService
