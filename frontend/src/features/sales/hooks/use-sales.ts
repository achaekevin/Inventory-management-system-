import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import salesService, { CreateSaleData } from '../services/sales-service'

export function useSales(filters?: { search?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.sales.list(filters),
    queryFn: () => salesService.getSales(filters),
  })
}

export function useSale(id: string) {
  return useQuery({
    queryKey: queryKeys.sales.detail(id),
    queryFn: () => salesService.getSale(id),
    enabled: !!id,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSaleData) => salesService.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.lists() })
      toast.success('Sale completed successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete sale')
    },
  })
}

export function useDeleteSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salesService.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.lists() })
      toast.success('Sale deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete sale')
    },
  })
}

export function useSalesStats(period?: string) {
  return useQuery({
    queryKey: queryKeys.sales.stats(period),
    queryFn: () => salesService.getSalesStats(period),
  })
}
