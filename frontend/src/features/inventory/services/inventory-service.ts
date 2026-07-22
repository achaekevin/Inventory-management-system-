import apiClient from '@/lib/api-client'
import { ApiResponse, PaginatedResponse, InventoryItem, StockMovement } from '@/types'

export interface CreateStockAdjustmentData {
  productId: string
  warehouseId: string
  quantity: number
  type: 'adjustment' | 'transfer' | 'damage' | 'return'
  reason?: string
  notes?: string
}

const inventoryService = {
  getInventory: async (params?: {
    page?: number
    pageSize?: number
    search?: string
    warehouseId?: string
  }): Promise<PaginatedResponse<InventoryItem>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<InventoryItem>>>(
      '/inventory',
      { params }
    )
    return response.data
  },

  getStockMovements: async (params?: {
    page?: number
    pageSize?: number
    productId?: string
    warehouseId?: string
  }): Promise<PaginatedResponse<StockMovement>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<StockMovement>>>(
      '/inventory/movements',
      { params }
    )
    return response.data
  },

  createAdjustment: async (data: CreateStockAdjustmentData): Promise<StockMovement> => {
    const response = await apiClient.post<ApiResponse<StockMovement>>(
      '/inventory/adjustments',
      data
    )
    return response.data
  },

  getLowStockItems: async (): Promise<InventoryItem[]> => {
    const response = await apiClient.get<ApiResponse<InventoryItem[]>>(
      '/inventory/low-stock'
    )
    return response.data
  },
}

export default inventoryService
