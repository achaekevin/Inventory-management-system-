import apiClient from '@/lib/api-client'

export interface ReorderSuggestion {
  productId: string
  productName: string
  productSku: string
  currentStock: number
  reorderLevel: number
  minStock: number
  suggestedQuantity: number
  estimatedCost: number
  urgency: 'critical' | 'high' | 'medium'
  suppliers: SuggestedSupplier[]
}

export interface SuggestedSupplier {
  supplierId: string
  supplierName: string
  supplierEmail?: string
  supplierPhone?: string
  lastPurchasePrice?: number
  lastPurchaseDate?: string
  totalPurchases: number
}

export interface ScanResult {
  scannedAt: string
  lowStockCount: number
  managersNotified: number
  suggestions: ReorderSuggestion[]
}

export interface DraftPOItem {
  productId: string
  quantity: number
  unitPrice: number
}

export interface CreateDraftPOPayload {
  supplierId: string
  items: DraftPOItem[]
  notes?: string
}

export interface DraftPOResult {
  purchaseId: string
  purchaseNumber: string
  supplierId: string
  supplierName: string
  totalItems: number
  estimatedTotal: number
  status: string
}

interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

const reorderService = {
  scanLowStock: async (): Promise<ReorderSuggestion[]> => {
    const response = await apiClient.get<ApiResponse<ReorderSuggestion[]>>('/reorder/scan')
    return response.data.data
  },

  scanAndNotify: async (): Promise<ScanResult> => {
    const response = await apiClient.post<ApiResponse<ScanResult>>('/reorder/scan-and-notify')
    return response.data.data
  },

  createDraftPO: async (payload: CreateDraftPOPayload): Promise<DraftPOResult> => {
    const response = await apiClient.post<ApiResponse<DraftPOResult>>('/reorder/create-draft-po', payload)
    return response.data.data
  },

  notifyManagers: async (): Promise<{ notifiedCount: number; lowStockCount: number }> => {
    const response = await apiClient.post<ApiResponse<{ notifiedCount: number; lowStockCount: number }>>('/reorder/notify')
    return response.data.data
  },
}

export default reorderService
