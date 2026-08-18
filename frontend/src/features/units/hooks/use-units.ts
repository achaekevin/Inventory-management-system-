import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import unitService, { CreateUnitData, UpdateUnitData } from '../services/unit-service'

export function useUnits(filters?: { search?: string }) {
  return useQuery({
    queryKey: ['units', 'list', filters],
    queryFn: () => unitService.getUnits(filters),
  })
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['units', 'detail', id],
    queryFn: () => unitService.getUnit(id),
    enabled: !!id,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUnitData) => unitService.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      toast.success('Unit created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create unit')
    },
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUnitData) =>
      unitService.updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      toast.success('Unit updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update unit')
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unitService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      toast.success('Unit deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete unit')
    },
  })
}
