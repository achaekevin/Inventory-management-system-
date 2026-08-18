import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import brandService, { CreateBrandData, UpdateBrandData } from '../services/brand-service'

export function useBrands(filters?: { search?: string }) {
  return useQuery({
    queryKey: queryKeys.brands.list(filters),
    queryFn: () => brandService.getBrands(filters),
  })
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: queryKeys.brands.detail(id),
    queryFn: () => brandService.getBrand(id),
    enabled: !!id,
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBrandData) => brandService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all })
      toast.success('Brand created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create brand')
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateBrandData) =>
      brandService.updateBrand(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.detail(variables.id) })
      toast.success('Brand updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update brand')
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => brandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all })
      toast.success('Brand deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete brand')
    },
  })
}
