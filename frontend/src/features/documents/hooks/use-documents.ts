import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import documentService, { DocumentEntityType } from '../services/document-service'

const KEYS = {
  list: (type: DocumentEntityType, id: string) => ['documents', type, id] as const,
  stats: ['documents', 'stats'] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useDocuments(entityType: DocumentEntityType, entityId: string) {
  return useQuery({
    queryKey: KEYS.list(entityType, entityId),
    queryFn: () => documentService.list(entityType, entityId),
    enabled: !!entityId,
    staleTime: 30_000,
  })
}

export function useDocumentStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: documentService.stats,
    staleTime: 60_000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUploadDocument(entityType: DocumentEntityType, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { file: File; description?: string }) =>
      documentService.upload({ file: params.file, entityType, entityId, description: params.description }),
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: KEYS.list(entityType, entityId) })
      qc.invalidateQueries({ queryKey: KEYS.stats })
      toast.success(`"${doc.fileName}" uploaded`)
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Upload failed')
    },
  })
}

export function useUpdateDocument(entityType: DocumentEntityType, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, description }: { id: string; description: string }) =>
      documentService.update(id, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list(entityType, entityId) })
      toast.success('Description updated')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Update failed')
    },
  })
}

export function useDeleteDocument(entityType: DocumentEntityType, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list(entityType, entityId) })
      qc.invalidateQueries({ queryKey: KEYS.stats })
      toast.success('Document deleted')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Delete failed')
    },
  })
}
