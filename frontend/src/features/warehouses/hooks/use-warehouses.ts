import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import warehouseService, {
  CreateWarehouseData,
  UpdateWarehouseData,
  CreateZoneData,
  UpdateZoneData,
  WarehouseFilters,
} from '../services/warehouse-service'

export function useWarehouses(filters?: WarehouseFilters) {
  return useQuery({
    queryKey: queryKeys.warehouses.list(filters),
    queryFn: () => warehouseService.getWarehouses(filters),
  })
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: queryKeys.warehouses.detail(id),
    queryFn: () => warehouseService.getWarehouse(id),
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWarehouseData) => warehouseService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all })
      toast.success('Warehouse created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create warehouse')
    },
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateWarehouseData & { id: string }) =>
      warehouseService.updateWarehouse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.detail(variables.id) })
      toast.success('Warehouse updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update warehouse')
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => warehouseService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all })
      toast.success('Warehouse deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete warehouse')
    },
  })
}

// Zone hooks
export function useCreateZone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateZoneData) => warehouseService.createZone(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.detail(variables.warehouseId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.lists() })
      toast.success('Zone created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create zone')
    },
  })
}

export function useUpdateZone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      warehouseId,
      zoneId,
      ...data
    }: UpdateZoneData & { warehouseId: string; zoneId: string }) =>
      warehouseService.updateZone(warehouseId, zoneId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.detail(variables.warehouseId) })
      toast.success('Zone updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update zone')
    },
  })
}

export function useDeleteZone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ warehouseId, zoneId }: { warehouseId: string; zoneId: string }) =>
      warehouseService.deleteZone(warehouseId, zoneId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.detail(variables.warehouseId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.lists() })
      toast.success('Zone deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete zone')
    },
  })
}
