import { useState } from 'react'
import {
  FolderOpen, FileText, Image, FileSpreadsheet, File,
  Package, Users, Building2, ShoppingCart, Tag,
  TrendingUp, HardDrive, Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDocumentStats } from '../hooks/use-documents'
import type { DocumentEntityType } from '../services/document-service'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ENTITY_META: Record<DocumentEntityType, { label: string; icon: React.ElementType; color: string; gradient: string }> = {
  product: { label: 'Products', icon: Package, color: 'text-blue-600', gradient: 'from-blue-500/10 to-blue-600/5' },
  supplier: { label: 'Suppliers', icon: Building2, color: 'text-amber-600', gradient: 'from-amber-500/10 to-amber-600/5' },
  customer: { label: 'Customers', icon: Users, color: 'text-green-600', gradient: 'from-green-500/10 to-green-600/5' },
  purchase: { label: 'Purchase Orders', icon: ShoppingCart, color: 'text-purple-600', gradient: 'from-purple-500/10 to-purple-600/5' },
  sale: { label: 'Sales Orders', icon: Tag, color: 'text-orange-600', gradient: 'from-orange-500/10 to-orange-600/5' },
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DocumentsPage() {
  const { data: stats, isLoading } = useDocumentStats()

  const totalDocs = stats?.total || 0
  const totalBytes = stats?.byEntity.reduce((sum, e) => sum + (e._sum.size || 0), 0) || 0

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Document Management</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                All files attached across products, suppliers, customers, purchases &amp; sales
              </p>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 md:grid-cols-4">
          {[
            { label: 'Total Documents', value: totalDocs, icon: FileText, color: 'text-primary' },
            { label: 'Total Storage', value: formatBytes(totalBytes), icon: HardDrive, color: 'text-teal-600' },
            { label: 'Entity Types', value: 5, icon: Tag, color: 'text-purple-600' },
            { label: 'Max File Size', value: '10 MB', icon: TrendingUp, color: 'text-amber-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border bg-background/70 backdrop-blur-sm p-3 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-muted ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Per-entity breakdown ── */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Documents by Entity Type</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(ENTITY_META) as DocumentEntityType[]).map(entityType => {
            const meta = ENTITY_META[entityType]
            const Icon = meta.icon
            const row = stats?.byEntity.find(b => b.entityType === entityType)
            const count = row?._count.id || 0
            const size = row?._sum.size || 0

            return (
              <Card key={entityType} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient}`}>
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{meta.label}</CardTitle>
                      <CardDescription className="text-xs">
                        {count} document{count !== 1 ? 's' : ''} · {formatBytes(size)}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-auto">{count}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {count === 0
                      ? `No files attached to any ${meta.label.toLowerCase().replace(' orders', '')} yet.`
                      : `Files are accessible from each ${meta.label.toLowerCase().replace(' orders', '')} record's Documents panel.`
                    }
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── Supported formats reference ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supported File Formats</CardTitle>
          <CardDescription>Files can be attached from within each entity's detail/edit page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { label: 'PDF', ext: '.pdf', icon: FileText, color: 'text-red-600 bg-red-500/10', desc: 'Invoices, manuals' },
              { label: 'Excel', ext: '.xlsx / .xls', icon: FileSpreadsheet, color: 'text-green-600 bg-green-500/10', desc: 'Spreadsheets, price lists' },
              { label: 'Images', ext: '.jpg .png .webp', icon: Image, color: 'text-blue-600 bg-blue-500/10', desc: 'Product photos, receipts' },
              { label: 'Word', ext: '.docx / .doc', icon: FileText, color: 'text-indigo-600 bg-indigo-500/10', desc: 'Contracts, agreements' },
              { label: 'Text', ext: '.txt', icon: File, color: 'text-gray-600 bg-gray-500/10', desc: 'Notes, manuals' },
            ].map(f => {
              const Icon = f.icon
              return (
                <div key={f.label} className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center ${f.color}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-sm">{f.label}</p>
                  <p className="text-xs opacity-70">{f.ext}</p>
                  <p className="text-xs opacity-60">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
