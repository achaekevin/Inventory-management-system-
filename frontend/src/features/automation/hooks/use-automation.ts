import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import automationService, {
  CreateRulePayload,
  UpdateRulePayload,
} from '../services/automation-service'

const KEYS = {
  rules: ['automation', 'rules'] as const,
  logs: (id?: string) => ['automation', 'logs', id] as const,
  allLogs: ['automation', 'logs', 'all'] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useAutomationRules() {
  return useQuery({
    queryKey: KEYS.rules,
    queryFn: () => automationService.listRules(),
    staleTime: 30 * 1000,
  })
}

export function useAutomationRuleLogs(id: string) {
  return useQuery({
    queryKey: KEYS.logs(id),
    queryFn: () => automationService.getRuleLogs(id),
    enabled: !!id,
  })
}

export function useAllAutomationLogs() {
  return useQuery({
    queryKey: KEYS.allLogs,
    queryFn: () => automationService.getAllLogs(),
    staleTime: 30 * 1000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateAutomationRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRulePayload) => automationService.createRule(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.rules })
      toast.success('Automation rule created')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create rule')
    },
  })
}

export function useUpdateAutomationRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRulePayload }) =>
      automationService.updateRule(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.rules })
      toast.success('Automation rule updated')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update rule')
    },
  })
}

export function useDeleteAutomationRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => automationService.deleteRule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.rules })
      toast.success('Automation rule deleted')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete rule')
    },
  })
}

export function useRunAutomationRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => automationService.runRule(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['automation'] })
      toast.success(`Rule executed — ${data.result.itemsAffected} item(s) affected`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Rule execution failed')
    },
  })
}
