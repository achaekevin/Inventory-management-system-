import apiClient from '@/lib/api-client'

// ─── Types ───────────────────────────────────────────────────────────────────

export type AutomationRuleType =
  | 'low_stock_po'
  | 'high_value_notify'
  | 'overdue_payment_reminder'
  | 'archive_inactive_product'

export interface LowStockPoConfig {
  preferredSupplierId?: string
}

export interface HighValueNotifyConfig {
  threshold: number
  notifyRoles: string[]
}

export interface OverduePaymentReminderConfig {
  graceDays: number
  notifyRoles: string[]
}

export interface ArchiveInactiveProductConfig {
  inactiveDays: number
}

export type RuleConfig =
  | LowStockPoConfig
  | HighValueNotifyConfig
  | OverduePaymentReminderConfig
  | ArchiveInactiveProductConfig

export interface AutomationLog {
  id: string
  ruleId: string
  status: 'success' | 'error' | 'skipped'
  message?: string
  itemsAffected: number
  details?: any
  createdAt: string
  rule?: { id: string; name: string; type: string }
}

export interface AutomationRule {
  id: string
  name: string
  description?: string
  type: AutomationRuleType
  config: RuleConfig
  isEnabled: boolean
  intervalHours: number
  lastRunAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  logs: AutomationLog[]
}

export interface CreateRulePayload {
  name: string
  description?: string
  type: AutomationRuleType
  config: RuleConfig
  isEnabled?: boolean
  intervalHours?: number
}

export interface UpdateRulePayload {
  name?: string
  description?: string
  config?: RuleConfig
  isEnabled?: boolean
  intervalHours?: number
}

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

// ─── Service ─────────────────────────────────────────────────────────────────

const automationService = {
  listRules: async (): Promise<AutomationRule[]> => {
    const res = await apiClient.get<ApiResponse<AutomationRule[]>>('/automation/rules')
    return res.data.data
  },

  createRule: async (payload: CreateRulePayload): Promise<AutomationRule> => {
    const res = await apiClient.post<ApiResponse<AutomationRule>>('/automation/rules', payload)
    return res.data.data
  },

  updateRule: async (id: string, payload: UpdateRulePayload): Promise<AutomationRule> => {
    const res = await apiClient.patch<ApiResponse<AutomationRule>>(`/automation/rules/${id}`, payload)
    return res.data.data
  },

  deleteRule: async (id: string): Promise<void> => {
    await apiClient.delete(`/automation/rules/${id}`)
  },

  runRule: async (id: string): Promise<{ result: { itemsAffected: number; details: object[] }; log: AutomationLog }> => {
    const res = await apiClient.post<ApiResponse<{ result: any; log: AutomationLog }>>(`/automation/rules/${id}/run`)
    return res.data.data
  },

  getRuleLogs: async (id: string, limit = 50): Promise<AutomationLog[]> => {
    const res = await apiClient.get<ApiResponse<AutomationLog[]>>(`/automation/rules/${id}/logs`, { params: { limit } })
    return res.data.data
  },

  getAllLogs: async (limit = 100): Promise<AutomationLog[]> => {
    const res = await apiClient.get<ApiResponse<AutomationLog[]>>('/automation/logs', { params: { limit } })
    return res.data.data
  },
}

export default automationService
