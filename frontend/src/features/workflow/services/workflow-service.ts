import apiClient from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkflowStatus =
  | 'draft'
  | 'submitted'
  | 'pending_supervisor'
  | 'pending_finance'
  | 'approved'
  | 'ordered'
  | 'received'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export interface ApprovalStep {
  id: string
  purchaseId: string
  step: string
  actorId: string
  comment?: string
  createdAt: string
  actor?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface WorkflowPurchase {
  id: string
  purchaseNumber: string
  status: WorkflowStatus
  orderDate: string
  expectedDate?: string
  receivedDate?: string
  subtotal: number
  tax: number
  discount: number
  shipping: number
  total: number
  notes?: string
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  supplier: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    total: number
    product: { id: string; name: string; sku: string }
  }>
  approvalSteps: ApprovalStep[]
}

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

// ─── Service ─────────────────────────────────────────────────────────────────

const workflowService = {
  getPending: async (): Promise<WorkflowPurchase[]> => {
    const res = await apiClient.get<ApiResponse<WorkflowPurchase[]>>('/workflow/purchases/pending')
    return res.data.data
  },

  getAll: async (params?: { status?: string; search?: string }): Promise<WorkflowPurchase[]> => {
    const res = await apiClient.get<ApiResponse<WorkflowPurchase[]>>('/workflow/purchases', { params })
    return res.data.data
  },

  getHistory: async (id: string): Promise<WorkflowPurchase> => {
    const res = await apiClient.get<ApiResponse<WorkflowPurchase>>(`/workflow/purchases/${id}/history`)
    return res.data.data
  },

  submit: async (id: string, comment?: string): Promise<WorkflowPurchase> => {
    const res = await apiClient.post<ApiResponse<WorkflowPurchase>>(`/workflow/purchases/${id}/submit`, { comment })
    return res.data.data
  },

  supervisorApprove: async (id: string, comment?: string): Promise<WorkflowPurchase> => {
    const res = await apiClient.post<ApiResponse<WorkflowPurchase>>(`/workflow/purchases/${id}/supervisor-approve`, { comment })
    return res.data.data
  },

  supervisorReject: async (id: string, comment?: string): Promise<WorkflowPurchase> => {
    const res = await apiClient.post<ApiResponse<WorkflowPurchase>>(`/workflow/purchases/${id}/supervisor-reject`, { comment })
    return res.data.data
  },

  financeApprove: async (id: string, comment?: string): Promise<WorkflowPurchase> => {
    const res = await apiClient.post<ApiResponse<WorkflowPurchase>>(`/workflow/purchases/${id}/finance-approve`, { comment })
    return res.data.data
  },

  financeReject: async (id: string, comment?: string): Promise<WorkflowPurchase> => {
    const res = await apiClient.post<ApiResponse<WorkflowPurchase>>(`/workflow/purchases/${id}/finance-reject`, { comment })
    return res.data.data
  },

  placeOrder: async (id: string, comment?: string): Promise<WorkflowPurchase> => {
    const res = await apiClient.post<ApiResponse<WorkflowPurchase>>(`/workflow/purchases/${id}/place-order`, { comment })
    return res.data.data
  },

  receiveGoods: async (id: string, comment?: string): Promise<WorkflowPurchase> => {
    const res = await apiClient.post<ApiResponse<WorkflowPurchase>>(`/workflow/purchases/${id}/receive-goods`, { comment })
    return res.data.data
  },
}

export default workflowService
