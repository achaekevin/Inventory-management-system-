import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import customerService, { CreateCustomerData, UpdateCustomerData } from '../services/customer-service'

export function useCustomers(filters?: { search?: string }) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => customerService.getCustomers(filters),
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCustomerData) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() })
      toast.success('Customer created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create customer')
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCustomerData) =>
      customerService.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(variables.id) })
      toast.success('Customer updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update customer')
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() })
      toast.success('Customer deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete customer')
    },
  })
}
