import apiClient from '@/lib/api-client'
import { ApiResponse, PaginatedResponse, Brand } from '@/types'

export interface CreateBrandData {
  name: string
  description?: string
  logo?: string
  isActive: boolean
}

export interface UpdateBrandData extends Partial<CreateBrandData> {
  id: string
}

const brandService = {
  getBrands: async (params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<PaginatedResponse<Brand>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Brand>>>(
      '/brands',
      { params }
    )
    return response.data
  },

  getBrand: async (id: string): Promise<Brand> => {
    const response = await apiClient.get<ApiResponse<Brand>>(`/brands/${id}`)
    return response.data
  },

  createBrand: async (data: CreateBrandData): Promise<Brand> => {
    const response = await apiClient.post<ApiResponse<Brand>>('/brands', data)
    return response.data
  },

  updateBrand: async (id: string, data: UpdateBrandData): Promise<Brand> => {
    const response = await apiClient.put<ApiResponse<Brand>>(`/brands/${id}`, data)
    return response.data
  },

  deleteBrand: async (id: string): Promise<void> => {
    await apiClient.delete(`/brands/${id}`)
  },
}

export default brandService
