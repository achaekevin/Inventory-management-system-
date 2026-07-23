import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import creditService from '../services/credit-service'

const KEYS = {
  list: (p?: object) => ['credit', 'list', p] as const,
  overdue: ['credit', 'overdue'] as const,
  profile: (id: string) => ['credit', 'profile', id] as const,
}

export function useCreditList(params?: { search?: string; creditStatus?: string }) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => creditService.list(params),
    staleTime: 60 * 1000,
  })
}

export function useCreditOverdue() {
  return useQuery({
    queryKey: KEYS.overdue,
    queryFn: () => creditService.overdue(),
    staleTime: 60 * 1000,
  })
}

export function useCreditProfile(customerId: string) {
  return useQuery({
    queryKey: KEYS.profile(customerId),
    queryFn: () => creditService.profile(customerId),
    enabled: !!customerId,
  })
}

function useAction(fn: Function, msg: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit'] })
      toast.success(msg)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed'),
  })
}

export const useApproveLimit = () =>
  useAction(
    ({ customerId, ...p }: { customerId: string; creditLimit: number; notes?: string; dueDate?: string }) =>
      creditService.approveLimit(customerId, p),
    'Credit limit approved!'
  )

export const useSuspendCredit = () =>
  useAction(
    ({ customerId, notes }: { customerId: string; notes: string }) =>
      creditService.suspend(customerId, notes),
    'Credit suspended'
  )

export const useRecordPayment = () =>
  useAction(
    ({ customerId, ...p }: { customerId: string; amount: number; notes?: string; referenceId?: string }) =>
      creditService.recordPayment(customerId, p),
    'Payment recorded successfully!'
  )

export const useAdjustBalance = () =>
  useAction(
    ({ customerId, ...p }: { customerId: string; amount: number; notes?: string }) =>
      creditService.adjustBalance(customerId, p),
    'Balance adjusted'
  )
