import apiClient from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentEntityType = 'product' | 'supplier' | 'customer' | 'purchase' | 'sale'

export interface Document {
  id: string
  entityType: DocumentEntityType
  entityId: string
  fileName: string
  storedName: string
  mimeType: string
  size: number
  path: string
  description?: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

export interface DocumentStats {
  total: number
  byEntity: Array<{
    entityType: DocumentEntityType
    _count: { id: number }
    _sum: { size: number | null }
  }>
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// ─── Service ──────────────────────────────────────────────────────────────────

const documentService = {
  /** Upload a file attached to an entity */
  upload: async (params: {
    file: File
    entityType: DocumentEntityType
    entityId: string
    description?: string
  }): Promise<Document> => {
    const form = new FormData()
    form.append('file', params.file)
    form.append('entityType', params.entityType)
    form.append('entityId', params.entityId)
    if (params.description) form.append('description', params.description)

    const res = await apiClient.post<ApiResponse<Document>>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return (res as any).data
  },

  /** List all documents for an entity */
  list: async (entityType: DocumentEntityType, entityId: string): Promise<Document[]> => {
    const res = await apiClient.get<ApiResponse<Document[]>>(`/documents/${entityType}/${entityId}`)
    return (res as any).data
  },

  /** Update a document's description */
  update: async (id: string, description: string): Promise<Document> => {
    const res = await apiClient.patch<ApiResponse<Document>>(`/documents/${id}`, { description })
    return (res as any).data
  },

  /** Delete a document */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`)
  },

  /** Get stats across all entities */
  stats: async (): Promise<DocumentStats> => {
    const res = await apiClient.get<ApiResponse<DocumentStats>>('/documents/stats')
    return (res as any).data
  },

  /** Build the full URL to serve a document file */
  fileUrl: (filePath: string): string => {
    const base = API_BASE_URL.replace('/api', '')
    return `${base}/${filePath}`
  },
}

export default documentService
