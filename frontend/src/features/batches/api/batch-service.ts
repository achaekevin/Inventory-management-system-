import apiClient from '@/lib/api-client'
import { ApiResponse, PaginationMeta } from '@/types'

export interface ProductBatch {
  id: string
  batchNumber: string
  productId: string
  productName: string
  sku: string
  barcode?: string
  supplierBatch?: string
  supplierName?: string
  mfgDate?: string
  expiryDate?: string
  quantity: number
  initialQuantity: number
  status: 'active' | 'expiring_soon' | 'expired' | 'recalled' | 'depleted'
  notes?: string
  movementsCount: number
  createdAt: string
}

export interface CreateBatchData {
  batchNumber?: string
  productId: string
  supplierBatch?: string
  mfgDate?: string
  expiryDate?: string
  quantity: number
  supplierId?: string
  warehouseId?: string
  notes?: string
}

export interface RecordBatchMovementData {
  batchId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RECALL' | 'EXPIRED'
  quantity: number
  reason?: string
  notes?: string
}

export interface InitiateRecallData {
  batchIds: string[]
  reason: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  disposition?: 'quarantine' | 'destroyed' | 'returned_to_supplier'
}

export interface BatchRecall {
  id: string
  recallNumber: string
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'in_progress' | 'completed' | 'cancelled'
  description?: string
  recalledAt: string
  itemsCount: number
  items: Array<{
    batchId: string
    batchNumber: string
    productName: string
    quantityRecalled: number
    disposition: string
  }>
}

export const batchApi = {
  getBatches: async (params?: {
    productId?: string
    supplierId?: string
    status?: string
    expiringDays?: number
    search?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<ProductBatch[]> & { pagination?: PaginationMeta }> => {
    const response = await apiClient.get('/batches', { params })
    return response as any
  },

  createBatch: async (data: CreateBatchData): Promise<ApiResponse<ProductBatch>> => {
    const response = await apiClient.post('/batches', data)
    return response as any
  },

  recordMovement: async (data: RecordBatchMovementData): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/batches/movements', data)
    return response as any
  },

  initiateRecall: async (data: InitiateRecallData): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/batches/recall', data)
    return response as any
  },

  getRecalls: async (): Promise<ApiResponse<BatchRecall[]>> => {
    const response = await apiClient.get('/batches/recalls')
    return response as any
  },
}
