import apiClient from '@/lib/api-client'
import type { ApiResponse, PaginatedResponse, Category } from '@/types'

export interface CreateCategoryData {
  name: string
  description?: string
  parentId?: string
  isActive: boolean
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string
}

const categoryService = {
  getCategories: async (params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Category>>>(
      '/categories',
      { params }
    )
    return response.data
  },

  getCategory: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`)
    return response.data
  },

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data)
    return response.data
  },

  updateCategory: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}

export default categoryService
