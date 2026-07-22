import { useQuery } from '@tanstack/react-query'
import dashboardService from '../services/dashboard-service'
import { queryKeys } from '@/lib/query-client'

export function useDashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: dashboardService.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    dashboardData,
    isLoading,
    error,
    refetch,
  }
}

export function useDashboardStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: dashboardService.getStats,
  })

  return {
    stats: data,
    isLoading,
    error,
  }
}

export function useSalesChart(period: 'week' | 'month' | 'year' = 'month') {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.charts(period),
    queryFn: () => dashboardService.getSalesChart(period),
  })

  return {
    data: data || [],
    isLoading,
    error,
  }
}

export function useRevenueChart(period: 'week' | 'month' | 'year' = 'month') {
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKeys.dashboard.charts(period), 'revenue'],
    queryFn: () => dashboardService.getRevenueChart(period),
  })

  return {
    data: data || [],
    isLoading,
    error,
  }
}
