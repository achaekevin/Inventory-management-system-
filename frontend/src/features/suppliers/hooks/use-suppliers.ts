import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import supplierService, { CreateSupplierData, UpdateSupplierData } from '../services/supplier-service'

export function useSuppliers(filters?: { search?: string }) {
  return useQuery({
    queryKey: queryKeys.suppliers.list(filters),
    queryFn: () => supplierService.getSuppliers(filters),
  })
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id),
    queryFn: () => supplierService.getSupplier(id),
    enabled: !!id,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSupplierData) => supplierService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
      toast.success('Supplier created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create supplier')
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateSupplierData) =>
      supplierService.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.detail(variables.id) })
      toast.success('Supplier updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update supplier')
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
      toast.success('Supplier deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete supplier')
    },
  })
}
