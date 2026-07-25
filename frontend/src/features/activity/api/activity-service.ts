import apiClient from '@/lib/api-client'
import { ApiResponse, PaginationMeta } from '@/types'

export interface TimelineEvent {
  id: string
  source: 'activity' | 'audit' | 'stock'
  timestamp: string
  userId: string
  userName: string
  userEmail: string
  module: string
  action: string
  details?: string
  entityId?: string
  entityType?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  severity?: 'info' | 'warning' | 'critical'
}

export interface TimelineQueryParams {
  module?: string
  action?: string
  userId?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

export const activityApi = {
  getTimeline: async (
    params: TimelineQueryParams
  ): Promise<ApiResponse<TimelineEvent[]> & { pagination?: PaginationMeta }> => {
    const response = await apiClient.get('/activity/timeline', { params })
    return response as any
  },
}
