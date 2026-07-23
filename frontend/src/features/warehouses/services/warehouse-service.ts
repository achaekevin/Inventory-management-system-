import apiClient from '@/lib/api-client'

export interface Warehouse {
  id: string
  name: string
  code: string
  description?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  zones?: WarehouseZone[]
  _count?: { inventory: number; zones: number }
}

export interface WarehouseZone {
  id: string
  warehouseId: string
  name: string
  code: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateWarehouseData {
  name: string
  code: string
  description?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  phone?: string
  email?: string
  isActive?: boolean
}

export interface UpdateWarehouseData extends Partial<CreateWarehouseData> {}

export interface CreateZoneData {
  warehouseId: string
  name: string
  code: string
  description?: string
  isActive?: boolean
}

export interface UpdateZoneData extends Partial<Omit<CreateZoneData, 'warehouseId'>> {}

export interface WarehouseFilters {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
  city?: string
}

interface ApiResponse<T> {
  status: string
  data: T
  pagination?: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

const warehouseService = {
  getWarehouses: async (filters?: WarehouseFilters): Promise<ApiResponse<Warehouse[]>> => {
    const response = await apiClient.get<ApiResponse<Warehouse[]>>('/warehouses', { params: filters })
    return response.data
  },

  getWarehouse: async (id: string): Promise<Warehouse> => {
    const response = await apiClient.get<ApiResponse<Warehouse>>(`/warehouses/${id}`)
    return response.data.data
  },

  createWarehouse: async (data: CreateWarehouseData): Promise<Warehouse> => {
    const response = await apiClient.post<ApiResponse<Warehouse>>('/warehouses', data)
    return response.data.data
  },

  updateWarehouse: async (id: string, data: UpdateWarehouseData): Promise<Warehouse> => {
    const response = await apiClient.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data)
    return response.data.data
  },

  deleteWarehouse: async (id: string): Promise<void> => {
    await apiClient.delete(`/warehouses/${id}`)
  },

  toggleStatus: async (id: string): Promise<Warehouse> => {
    const response = await apiClient.patch<ApiResponse<Warehouse>>(`/warehouses/${id}/toggle-status`)
    return response.data.data
  },

  // Zones
  getZones: async (warehouseId: string): Promise<WarehouseZone[]> => {
    const response = await apiClient.get<ApiResponse<WarehouseZone[]>>(
      `/warehouses/${warehouseId}/zones`
    )
    return response.data.data
  },

  createZone: async (data: CreateZoneData): Promise<WarehouseZone> => {
    const { warehouseId, ...rest } = data
    const response = await apiClient.post<ApiResponse<WarehouseZone>>(
      `/warehouses/${warehouseId}/zones`,
      rest
    )
    return response.data.data
  },

  updateZone: async (warehouseId: string, zoneId: string, data: UpdateZoneData): Promise<WarehouseZone> => {
    const response = await apiClient.put<ApiResponse<WarehouseZone>>(
      `/warehouses/${warehouseId}/zones/${zoneId}`,
      data
    )
    return response.data.data
  },

  deleteZone: async (warehouseId: string, zoneId: string): Promise<void> => {
    await apiClient.delete(`/warehouses/${warehouseId}/zones/${zoneId}`)
  },
}

export default warehouseService
