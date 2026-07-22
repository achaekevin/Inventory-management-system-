import apiClient from '@/lib/api-client'
import { ApiResponse, DashboardStats, ChartData } from '@/types'

export interface DashboardData {
  stats: DashboardStats
  salesChart: ChartData[]
  revenueChart: ChartData[]
  categoryChart: ChartData[]
  recentSales: Array<{
    id: string
    customerName: string
    customerEmail: string
    customerAvatar?: string
    amount: number
    time: string
  }>
  topProducts: Array<{
    id: string
    name: string
    category: string
    quantity: number
    revenue: number
  }>
  lowStockItems: Array<{
    id: string
    name: string
    currentStock: number
    minStock: number
    sku: string
  }>
}

const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
    return response.data
  },

  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    return response.data
  },

  getSalesChart: async (period: 'week' | 'month' | 'year' = 'month'): Promise<ChartData[]> => {
    const response = await apiClient.get<ApiResponse<ChartData[]>>(
      `/dashboard/sales-chart?period=${period}`
    )
    return response.data
  },

  getRevenueChart: async (period: 'week' | 'month' | 'year' = 'month'): Promise<ChartData[]> => {
    const response = await apiClient.get<ApiResponse<ChartData[]>>(
      `/dashboard/revenue-chart?period=${period}`
    )
    return response.data
  },
}

export default dashboardService
