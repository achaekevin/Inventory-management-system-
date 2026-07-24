import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image, FileSpreadsheet, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

// ─── Accepted types ───────────────────────────────────────────────────────────

const ACCEPTED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
}

const FORMAT_CHIPS = ['PDF', 'Excel', 'Word', 'Images', 'Text']

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />
  if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
  if (mime.includes('sheet') || mime.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />
  return <File className="h-5 w-5 text-gray-400" />
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentUploaderProps {
  onUpload: (file: File, description?: string) => void
  isUploading?: boolean
  progress?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentUploader({ onUpload, isUploading = false, progress = 0 }: DocumentUploaderProps) {
  const [staged, setStaged] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED,
    maxSize: 10 * 1024 * 1024, // 10 MB
    multiple: false,
    onDropAccepted: (files) => {
      setStaged(files[0])
      setError(null)
    },
    onDropRejected: (rejected) => {
      const err = rejected[0]?.errors[0]
      if (err?.code === 'file-too-large') setError('File exceeds 10 MB limit')
      else if (err?.code === 'file-invalid-type') setError('Unsupported file type')
      else setError(err?.message || 'Invalid file')
    },
  })

  const handleSubmit = () => {
    if (!staged) return
    onUpload(staged, description.trim() || undefined)
    setStaged(null)
    setDescription('')
  }

  const handleCancel = () => {
    setStaged(null)
    setDescription('')
    setError(null)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!staged && (
        <div
          {...getRootProps()}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all
            ${isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}`}
        >
          <input {...getInputProps()} />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop the file here…' : 'Drag & drop or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Max 10 MB</p>
          <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
            {FORMAT_CHIPS.map(f => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full border bg-muted/50 text-muted-foreground">{f}</span>
            ))}
          </div>
          {error && <p className="mt-3 text-xs text-destructive font-medium">{error}</p>}
        </div>
      )}

      {/* Staged file preview */}
      {staged && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
            {fileIcon(staged.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{staged.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(staged.size)}</p>
            </div>
            <button onClick={handleCancel} disabled={isUploading} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-description">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea
              id="doc-description"
              placeholder="e.g. Product specification sheet, Q1 invoice…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Uploading…</p>
              <Progress value={progress || 50} className="h-1.5" />
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={isUploading} className="flex-1 gap-2">
              <Upload className="h-3.5 w-3.5" />
              {isUploading ? 'Uploading…' : 'Upload File'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={isUploading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
