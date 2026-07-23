import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import reorderService, { CreateDraftPOPayload } from '../services/reorder-service'

const REORDER_KEYS = {
  suggestions: ['reorder', 'suggestions'] as const,
}

export function useReorderSuggestions() {
  return useQuery({
    queryKey: REORDER_KEYS.suggestions,
    queryFn: () => reorderService.scanLowStock(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useScanAndNotify() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => reorderService.scanAndNotify(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: REORDER_KEYS.suggestions })
      toast.success(
        `Scan complete: ${data.lowStockCount} low-stock items found. ${data.managersNotified} manager(s) notified.`
      )
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Scan failed')
    },
  })
}

export function useCreateDraftPO() {
  return useMutation({
    mutationFn: (payload: CreateDraftPOPayload) => reorderService.createDraftPO(payload),
    onSuccess: (data) => {
      toast.success(`Draft PO ${data.purchaseNumber} created for ${data.supplierName}!`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create draft purchase order')
    },
  })
}

export function useNotifyManagers() {
  return useMutation({
    mutationFn: () => reorderService.notifyManagers(),
    onSuccess: (data) => {
      toast.success(`Notified ${data.notifiedCount} manager(s) about ${data.lowStockCount} low-stock items.`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send notifications')
    },
  })
}
