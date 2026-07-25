import apiClient from '@/lib/api-client'
import { ApiResponse } from '@/types'

export type HeatClassification = 'OVERSTOCK' | 'LOW_STOCK' | 'FAST_MOVING' | 'SLOW_MOVING' | 'NORMAL'

export interface HeatMapItem {
  id: string
  productId: string
  productName: string
  sku: string
  barcode: string | null
  categoryName: string
  warehouseName: string
  quantity: number
  available: number
  minStock: number
  reorderLevel: number
  price: number
  totalValue: number
  salesCount30Days: number
  classification: HeatClassification
  heatScore: number
}

export interface HeatMapDataResponse {
  heatScore: number
  counts: {
    all: number
    lowStock: number
    overstock: number
    fastMoving: number
    slowMoving: number
    normal: number
  }
  items: HeatMapItem[]
}

export const inventoryHeatmapApi = {
  getHeatmapData: async (params?: {
    warehouseId?: string
    classification?: string
  }): Promise<ApiResponse<HeatMapDataResponse>> => {
    const response = await apiClient.get('/inventory-heatmap/data', { params })
    return response as any
  },
}
