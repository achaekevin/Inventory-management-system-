import apiClient from '@/lib/api-client'

export type CreditStatus = 'none' | 'active' | 'suspended' | 'exceeded'

export interface CreditSummary {
  id: string
  name: string
  email: string
  phone: string
  type: string
  creditLimit: number
  creditStatus: CreditStatus
  outstandingBalance: number
  availableCredit: number
  utilizationPercent: number
  isActive: boolean
  updatedAt: string
  _count: { creditLogs: number }
}

export interface CreditLog {
  id: string
  customerId: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  creditLimitBefore?: number
  creditLimitAfter?: number
  dueDate?: string
  notes?: string
  referenceId?: string
  referenceType?: string
  actorId: string
  createdAt: string
}

export interface PendingInvoice {
  id: string
  saleNumber: string
  total: number
  paymentStatus: string
  saleDate: string
}

export interface CreditProfile {
  customer: {
    id: string
    name: string
    email: string
    phone: string
    type: string
    isActive: boolean
  }
  credit: {
    creditLimit: number
    creditStatus: CreditStatus
    outstandingBalance: number
    availableCredit: number
    utilizationPercent: number
  }
  pendingInvoices: PendingInvoice[]
  overdueInvoices: PendingInvoice[]
  creditLogs: CreditLog[]
}

export interface OverdueCustomer {
  id: string
  name: string
  email: string
  phone: string
  creditLimit: number
  outstandingBalance: number
  creditStatus: CreditStatus
  daysOverdue: number
  sales: PendingInvoice[]
}

interface ApiResp<T> { status: string; data: T; message?: string }

const creditService = {
  list: async (params?: { search?: string; creditStatus?: string }): Promise<CreditSummary[]> => {
    const res = await apiClient.get<ApiResp<CreditSummary[]>>('/credit', { params })
    return res.data.data
  },

  overdue: async (): Promise<OverdueCustomer[]> => {
    const res = await apiClient.get<ApiResp<OverdueCustomer[]>>('/credit/overdue')
    return res.data.data
  },

  profile: async (customerId: string): Promise<CreditProfile> => {
    const res = await apiClient.get<ApiResp<CreditProfile>>(`/credit/${customerId}`)
    return res.data.data
  },

  approveLimit: async (customerId: string, payload: { creditLimit: number; notes?: string; dueDate?: string }): Promise<CreditProfile> => {
    const res = await apiClient.post<ApiResp<CreditProfile>>(`/credit/${customerId}/approve-limit`, payload)
    return res.data.data
  },

  suspend: async (customerId: string, notes: string): Promise<CreditProfile> => {
    const res = await apiClient.post<ApiResp<CreditProfile>>(`/credit/${customerId}/suspend`, { notes })
    return res.data.data
  },

  recordPayment: async (customerId: string, payload: { amount: number; notes?: string; referenceId?: string }): Promise<CreditProfile> => {
    const res = await apiClient.post<ApiResp<CreditProfile>>(`/credit/${customerId}/record-payment`, payload)
    return res.data.data
  },

  adjustBalance: async (customerId: string, payload: { amount: number; notes?: string }): Promise<CreditProfile> => {
    const res = await apiClient.post<ApiResp<CreditProfile>>(`/credit/${customerId}/adjust-balance`, payload)
    return res.data.data
  },
}

export default creditService
