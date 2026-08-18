import apiClient from '@/lib/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types'

export interface Unit {
  id: string
  name: string
  shortName: string
  description?: string
  isActive: boolean
}

export interface CreateUnitData {
  name: string
  shortName: string
  description?: string
  isActive?: boolean
}

export interface UpdateUnitData extends Partial<CreateUnitData> {
  id: string
}

const unitService = {
  getUnits: async (params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<PaginatedResponse<Unit>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Unit>>>(
      '/units',
      { params }
    )
    return response.data
  },

  getUnit: async (id: string): Promise<Unit> => {
    const response = await apiClient.get<ApiResponse<Unit>>(`/units/${id}`)
    return response.data
  },

  createUnit: async (data: CreateUnitData): Promise<Unit> => {
    const response = await apiClient.post<ApiResponse<Unit>>('/units', data)
    return response.data
  },

  updateUnit: async (id: string, data: UpdateUnitData): Promise<Unit> => {
    const response = await apiClient.put<ApiResponse<Unit>>(`/units/${id}`, data)
    return response.data
  },

  deleteUnit: async (id: string): Promise<void> => {
    await apiClient.delete(`/units/${id}`)
  },
}

export default unitService
