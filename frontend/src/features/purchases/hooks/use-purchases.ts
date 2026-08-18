import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import purchaseService, { CreatePurchaseData, UpdatePurchaseData } from '../services/purchase-service'

export function usePurchases(filters?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.purchases.list(filters),
    queryFn: () => purchaseService.getPurchases(filters),
  })
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: queryKeys.purchases.detail(id),
    queryFn: () => purchaseService.getPurchase(id),
    enabled: !!id,
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePurchaseData) => purchaseService.createPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all })
      toast.success('Purchase order created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create purchase order')
    },
  })
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePurchaseData) =>
      purchaseService.updatePurchase(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.detail(variables.id) })
      toast.success('Purchase order updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update purchase order')
    },
  })
}

export function useDeletePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => purchaseService.deletePurchase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all })
      toast.success('Purchase order deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete purchase order')
    },
  })
}

export function useApprovePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => purchaseService.approvePurchase(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.detail(id) })
      toast.success('Purchase order approved!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve purchase order')
    },
  })
}

export function useReceivePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => purchaseService.receivePurchase(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.detail(id) })
      toast.success('Purchase order received!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to receive purchase order')
    },
  })
}
