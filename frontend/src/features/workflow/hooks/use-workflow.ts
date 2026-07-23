import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import workflowService from '../services/workflow-service'

const KEYS = {
  pending: ['workflow', 'pending'] as const,
  all: (params?: object) => ['workflow', 'all', params] as const,
  history: (id: string) => ['workflow', 'history', id] as const,
}

export function useWorkflowPending() {
  return useQuery({
    queryKey: KEYS.pending,
    queryFn: () => workflowService.getPending(),
    staleTime: 60 * 1000,
  })
}

export function useWorkflowAll(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: KEYS.all(params),
    queryFn: () => workflowService.getAll(params),
    staleTime: 60 * 1000,
  })
}

export function useWorkflowHistory(id: string) {
  return useQuery({
    queryKey: KEYS.history(id),
    queryFn: () => workflowService.getHistory(id),
    enabled: !!id,
  })
}

function useWorkflowAction(
  fn: (id: string, comment?: string) => Promise<any>,
  successMsg: string
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => fn(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflow'] })
      toast.success(successMsg)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Action failed')
    },
  })
}

export const useSubmitPurchase = () =>
  useWorkflowAction(workflowService.submit, 'Purchase submitted for approval')

export const useSupervisorApprove = () =>
  useWorkflowAction(workflowService.supervisorApprove, 'Approved by supervisor ✓')

export const useSupervisorReject = () =>
  useWorkflowAction(workflowService.supervisorReject, 'Rejected by supervisor')

export const useFinanceApprove = () =>
  useWorkflowAction(workflowService.financeApprove, 'Finance approved ✓')

export const useFinanceReject = () =>
  useWorkflowAction(workflowService.financeReject, 'Rejected by finance')

export const usePlaceOrder = () =>
  useWorkflowAction(workflowService.placeOrder, 'Supplier order placed 🚚')

export const useReceiveGoods = () =>
  useWorkflowAction(workflowService.receiveGoods, 'Goods received & completed ✓')
