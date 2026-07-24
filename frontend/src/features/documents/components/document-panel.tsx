import { useState } from 'react'
import { Paperclip, ChevronDown, ChevronUp, Loader2, FolderOpen, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DocumentUploader } from './document-uploader'
import { DocumentCard } from './document-card'
import {
  useDocuments,
  useUploadDocument,
  useUpdateDocument,
  useDeleteDocument,
} from '../hooks/use-documents'
import type { DocumentEntityType } from '../services/document-service'

// ─── Entity type display names ────────────────────────────────────────────────

const ENTITY_LABELS: Record<DocumentEntityType, string> = {
  product: 'Product',
  supplier: 'Supplier',
  customer: 'Customer',
  purchase: 'Purchase Order',
  sale: 'Sale Order',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentPanelProps {
  entityType: DocumentEntityType
  entityId: string | undefined // undefined when creating new record
  entityLabel?: string // optional override
  defaultCollapsed?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentPanel({
  entityType,
  entityId,
  entityLabel,
  defaultCollapsed = false,
}: DocumentPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const isSaved = !!entityId

  const { data: documents = [], isLoading } = useDocuments(entityType, entityId || '')
  const uploadMut = useUploadDocument(entityType, entityId || '')
  const updateMut = useUpdateDocument(entityType, entityId || '')
  const deleteMut = useDeleteDocument(entityType, entityId || '')

  const label = entityLabel || ENTITY_LABELS[entityType]

  return (
    <Card className="mt-4">
      {/* Header — collapsible */}
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Paperclip className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Documents & Attachments
                {isSaved && documents.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{documents.length}</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Attach files to this {label.toLowerCase()}
              </CardDescription>
            </div>
          </div>
          {collapsed
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronUp className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </CardHeader>

      {/* Body */}
      {!collapsed && (
        <CardContent className="space-y-4">
          {/* Not yet saved */}
          {!isSaved && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
              <Info className="h-4 w-4 shrink-0" />
              <p className="text-sm">Save this {label.toLowerCase()} first to attach documents.</p>
            </div>
          )}

          {/* Uploader */}
          {isSaved && (
            <DocumentUploader
              onUpload={(file, description) => uploadMut.mutate({ file, description })}
              isUploading={uploadMut.isPending}
            />
          )}

          {/* Document list */}
          {isSaved && (
            <>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                  <FolderOpen className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No documents attached yet.</p>
                  <p className="text-xs text-muted-foreground">Upload a PDF, Excel file, image, or manual above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      onDelete={id => deleteMut.mutate(id)}
                      onUpdate={(id, description) => updateMut.mutate({ id, description })}
                      isDeleting={deleteMut.isPending}
                      isUpdating={updateMut.isPending}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
