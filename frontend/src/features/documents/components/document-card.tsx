import { useState } from 'react'
import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Document } from '../services/document-service'
import documentService from '../services/document-service'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileTypeMeta(mime: string): { icon: React.ReactNode; label: string; bg: string } {
  if (mime.startsWith('image/'))
    return { icon: <Image className="h-5 w-5" />, label: 'Image', bg: 'bg-blue-500/10 text-blue-600' }
  if (mime.includes('pdf'))
    return { icon: <FileText className="h-5 w-5" />, label: 'PDF', bg: 'bg-red-500/10 text-red-600' }
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('spreadsheet'))
    return { icon: <FileSpreadsheet className="h-5 w-5" />, label: 'Excel', bg: 'bg-green-500/10 text-green-600' }
  if (mime.includes('word') || mime.includes('document'))
    return { icon: <FileText className="h-5 w-5" />, label: 'Word', bg: 'bg-indigo-500/10 text-indigo-600' }
  return { icon: <File className="h-5 w-5" />, label: 'File', bg: 'bg-gray-500/10 text-gray-500' }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentCardProps {
  doc: Document
  onDelete: (id: string) => void
  onUpdate: (id: string, description: string) => void
  isDeleting?: boolean
  isUpdating?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentCard({ doc, onDelete, onUpdate, isDeleting, isUpdating }: DocumentCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [desc, setDesc] = useState(doc.description || '')

  const { icon, label, bg } = fileTypeMeta(doc.mimeType)
  const fileUrl = documentService.fileUrl(doc.path)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(doc.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const handleSaveDesc = () => {
    onUpdate(doc.id, desc)
    setEditing(false)
  }

  return (
    <div className="group flex items-start gap-3 rounded-xl border bg-card p-3 transition-all hover:shadow-sm hover:border-primary/30">
      {/* Icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate max-w-[200px]" title={doc.fileName}>
            {doc.fileName}
          </p>
          <Badge variant="outline" className={`text-xs border-0 ${bg}`}>{label}</Badge>
        </div>

        {/* Description */}
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <Input
              className="h-7 text-xs"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Add a description…"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSaveDesc(); if (e.key === 'Escape') setEditing(false) }}
            />
            <button onClick={handleSaveDesc} disabled={isUpdating} className="text-green-600 hover:text-green-700">
              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p
            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={() => setEditing(true)}
            title="Click to edit description"
          >
            {doc.description || <span className="italic opacity-60">No description — click to add</span>}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatBytes(doc.size)}</span>
          <span>·</span>
          <span>{new Date(doc.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => setEditing(true)}
          title="Edit description"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
        <a href={fileUrl} download={doc.fileName} target="_blank" rel="noreferrer">
          <Button size="icon" variant="ghost" className="h-7 w-7" title="Download">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </a>
        <Button
          size="icon"
          variant={confirmDelete ? 'destructive' : 'ghost'}
          className="h-7 w-7"
          onClick={handleDelete}
          disabled={isDeleting}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
        >
          {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  )
}
