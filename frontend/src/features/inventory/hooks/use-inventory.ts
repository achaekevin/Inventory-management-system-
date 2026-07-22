import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import inventoryService, { CreateStockAdjustmentData } from '../services/inventory-service'

export function useInventory(filters?: { search?: string; warehouseId?: string }) {
  return useQuery({
    queryKey: queryKeys.inventory.list(filters),
    queryFn: () => inventoryService.getInventory(filters),
  })
}

export function useStockMovements(filters?: { productId?: string; warehouseId?: string }) {
  return useQuery({
    queryKey: queryKeys.inventory.movements(filters),
    queryFn: () => inventoryService.getStockMovements(filters),
  })
}

export function useLowStockItems() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock(),
    queryFn: () => inventoryService.getLowStockItems(),
  })
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStockAdjustmentData) => 
      inventoryService.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movements() })
      toast.success('Stock adjustment created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create stock adjustment')
    },
  })
}
