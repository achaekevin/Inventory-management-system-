import { useState, useCallback } from 'react'
import {
  Download, FileText, BarChart3, TrendingUp, Package, Users,
  FileSpreadsheet, Loader2, RefreshCw, Table, Filter,
  ChevronDown, CheckCircle2, AlertCircle, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  useSalesReport, useInventoryReport, usePurchaseReport, useCustomerReport,
  type SaleReportRow, type InventoryReportRow, type PurchaseReportRow, type CustomerReportRow
} from '../hooks/use-reports'
import { exportReport, type ReportColumn } from '@/lib/report-exporter'

// ─── Report definitions ───────────────────────────────────────────────────────

type ReportId = 'sales' | 'inventory' | 'purchases' | 'customers'
type ExportFormat = 'pdf' | 'excel' | 'csv'

const REPORTS: Array<{
  id: ReportId; name: string; description: string
  icon: React.ElementType; color: string; gradient: string
}> = [
  { id: 'sales', name: 'Sales Report', description: 'Transactions, revenue & payment status', icon: TrendingUp, color: 'text-green-600', gradient: 'from-green-500/10 to-green-600/5' },
  { id: 'inventory', name: 'Inventory Report', description: 'Stock levels, valuation & status', icon: Package, color: 'text-blue-600', gradient: 'from-blue-500/10 to-blue-600/5' },
  { id: 'purchases', name: 'Purchase Report', description: 'Purchase orders & supplier spend', icon: FileText, color: 'text-purple-600', gradient: 'from-purple-500/10 to-purple-600/5' },
  { id: 'customers', name: 'Customer Report', description: 'Customer analytics & credit info', icon: Users, color: 'text-orange-600', gradient: 'from-orange-500/10 to-orange-600/5' },
]

const FORMAT_ICONS: Record<ExportFormat, React.ElementType> = {
  pdf: FileText, excel: FileSpreadsheet, csv: Table,
}

// ─── Column schemas ───────────────────────────────────────────────────────────

const COLUMNS: Record<ReportId, ReportColumn[]> = {
  sales: [
    { header: 'Invoice #',  key: 'invoiceNumber', width: 18 },
    { header: 'Date',       key: 'date',          width: 14 },
    { header: 'Customer',   key: 'customerName',  width: 22 },
    { header: 'Items',      key: 'items',         width: 8  },
    { header: 'Subtotal',   key: 'subtotal',      width: 14 },
    { header: 'Tax',        key: 'tax',           width: 10 },
    { header: 'Discount',   key: 'discount',      width: 10 },
    { header: 'Total',      key: 'total',         width: 14 },
    { header: 'Payment',    key: 'paymentMethod', width: 14 },
    { header: 'Status',     key: 'paymentStatus', width: 12 },
  ],
  inventory: [
    { header: 'SKU',         key: 'sku',           width: 16 },
    { header: 'Product',     key: 'name',          width: 28 },
    { header: 'Category',    key: 'category',      width: 18 },
    { header: 'Unit',        key: 'unit',          width: 10 },
    { header: 'Stock',       key: 'currentStock',  width: 10 },
    { header: 'Min Stock',   key: 'minStock',      width: 10 },
    { header: 'Reorder Lvl', key: 'reorderLevel',  width: 12 },
    { header: 'Cost Price',  key: 'costPrice',     width: 12 },
    { header: 'Sale Price',  key: 'salePrice',     width: 12 },
    { header: 'Stock Value', key: 'stockValue',    width: 14 },
    { header: 'Status',      key: 'status',        width: 14 },
  ],
  purchases: [
    { header: 'PO Number',  key: 'poNumber',     width: 18 },
    { header: 'Date',       key: 'date',         width: 14 },
    { header: 'Supplier',   key: 'supplierName', width: 24 },
    { header: 'Items',      key: 'items',        width: 8  },
    { header: 'Subtotal',   key: 'subtotal',     width: 14 },
    { header: 'Tax',        key: 'tax',          width: 10 },
    { header: 'Total',      key: 'total',        width: 14 },
    { header: 'Status',     key: 'status',       width: 14 },
  ],
  customers: [
    { header: 'Name',            key: 'name',          width: 22 },
    { header: 'Email',           key: 'email',         width: 26 },
    { header: 'Phone',           key: 'phone',         width: 16 },
    { header: 'Total Orders',    key: 'totalOrders',   width: 14 },
    { header: 'Total Spent',     key: 'totalSpent',    width: 14 },
    { header: 'Credit Limit',    key: 'creditLimit',   width: 14 },
    { header: 'Credit Balance',  key: 'creditBalance', width: 14 },
    { header: 'Status',          key: 'status',        width: 12 },
  ],
}

// ─── Data preview table ───────────────────────────────────────────────────────

function PreviewTable({ columns, data }: { columns: ReportColumn[]; data: Record<string, any>[] }) {
  const preview = data.slice(0, 8)
  return (
    <div className="overflow-auto rounded-lg border">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            {columns.map(c => (
              <th key={c.key} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {preview.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
              {columns.map(c => (
                <td key={c.key} className="px-3 py-2 whitespace-nowrap text-foreground/80">
                  {row[c.key] !== undefined && row[c.key] !== null ? String(row[c.key]) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 8 && (
        <p className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30">
          Showing 8 of {data.length} rows — all rows will be included in the export
        </p>
      )}
    </div>
  )
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCards({ reportType, data }: { reportType: ReportId; data: any[] }) {
  if (!data.length) return null

  let cards: Array<{ label: string; value: string; color: string }> = []

  if (reportType === 'sales') {
    const rows = data as SaleReportRow[]
    const total = rows.reduce((s, r) => s + r.total, 0)
    const paid = rows.filter(r => r.paymentStatus === 'paid').length
    cards = [
      { label: 'Total Records', value: rows.length.toString(), color: 'text-primary' },
      { label: 'Total Revenue', value: `KES ${total.toLocaleString()}`, color: 'text-green-600' },
      { label: 'Paid Invoices', value: paid.toString(), color: 'text-teal-600' },
      { label: 'Unpaid Invoices', value: (rows.length - paid).toString(), color: 'text-amber-600' },
    ]
  } else if (reportType === 'inventory') {
    const rows = data as InventoryReportRow[]
    const totalValue = rows.reduce((s, r) => s + r.stockValue, 0)
    const lowStock = rows.filter(r => r.status === 'Low Stock').length
    const outOfStock = rows.filter(r => r.status === 'Out of Stock').length
    cards = [
      { label: 'Total Products', value: rows.length.toString(), color: 'text-primary' },
      { label: 'Stock Value', value: `KES ${totalValue.toLocaleString()}`, color: 'text-blue-600' },
      { label: 'Low Stock', value: lowStock.toString(), color: 'text-amber-600' },
      { label: 'Out of Stock', value: outOfStock.toString(), color: 'text-red-600' },
    ]
  } else if (reportType === 'purchases') {
    const rows = data as PurchaseReportRow[]
    const total = rows.reduce((s, r) => s + r.total, 0)
    cards = [
      { label: 'Total Orders', value: rows.length.toString(), color: 'text-primary' },
      { label: 'Total Spend', value: `KES ${total.toLocaleString()}`, color: 'text-purple-600' },
    ]
  } else if (reportType === 'customers') {
    const rows = data as CustomerReportRow[]
    const totalSpent = rows.reduce((s, r) => s + r.totalSpent, 0)
    const active = rows.filter(r => r.status === 'Active').length
    cards = [
      { label: 'Total Customers', value: rows.length.toString(), color: 'text-primary' },
      { label: 'Total Revenue', value: `KES ${totalSpent.toLocaleString()}`, color: 'text-green-600' },
      { label: 'Active', value: active.toString(), color: 'text-teal-600' },
      { label: 'Inactive', value: (rows.length - active).toString(), color: 'text-gray-400' },
    ]
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map(c => (
        <div key={c.label} className="rounded-xl border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportId>('sales')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState<ExportFormat>('excel')
  const [preview, setPreview] = useState(false)
  const [exporting, setExporting] = useState(false)

  const filters = { startDate: startDate || undefined, endDate: endDate || undefined }

  const salesQ = useSalesReport(filters, preview && reportType === 'sales')
  const inventoryQ = useInventoryReport(preview && reportType === 'inventory')
  const purchasesQ = usePurchaseReport(filters, preview && reportType === 'purchases')
  const customersQ = useCustomerReport(preview && reportType === 'customers')

  const activeQuery = {
    sales: salesQ, inventory: inventoryQ, purchases: purchasesQ, customers: customersQ,
  }[reportType]

  const reportData: Record<string, any>[] = (activeQuery.data as any) || []
  const isLoading = activeQuery.isLoading
  const currentReport = REPORTS.find(r => r.id === reportType)!

  const handleLoadPreview = () => setPreview(true)

  const handleExport = useCallback(async () => {
    if (!reportData.length) {
      toast.error('No data to export — click "Preview" first')
      return
    }
    setExporting(true)
    try {
      const meta = {
        title: currentReport.name,
        subtitle: `Inventory Management System`,
        dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
      }
      exportReport(format, reportData, COLUMNS[reportType], meta)
      toast.success(`${currentReport.name} exported as ${format.toUpperCase()} successfully!`)
    } catch (err: any) {
      toast.error(`Export failed: ${err?.message || 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }, [format, reportData, reportType, currentReport, startDate, endDate])

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Reports & Exports</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Generate, preview and download reports as PDF, Excel or CSV
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Badge variant="outline" className="gap-1.5 border-green-200 text-green-700 bg-green-50">
              <CheckCircle2 className="h-3 w-3" /> PDF
            </Badge>
            <Badge variant="outline" className="gap-1.5 border-blue-200 text-blue-700 bg-blue-50">
              <CheckCircle2 className="h-3 w-3" /> Excel
            </Badge>
            <Badge variant="outline" className="gap-1.5 border-gray-200 text-gray-600 bg-gray-50">
              <CheckCircle2 className="h-3 w-3" /> CSV
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Report type selector ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Select Report Type
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {REPORTS.map(r => {
            const Icon = r.icon
            const active = reportType === r.id
            return (
              <button
                key={r.id}
                onClick={() => { setReportType(r.id); setPreview(false) }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm
                  ${active
                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                    : 'hover:border-primary/30 bg-card'
                  }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${r.gradient}`}>
                  <Icon className={`h-5 w-5 ${r.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Controls ── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Report Options</CardTitle>
          </div>
          <CardDescription>
            Configure date range and export format for <strong>{currentReport.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Date range */}
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="startDate" type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPreview(false) }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="endDate" type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPreview(false) }} />
            </div>
            {/* Format */}
            <div className="space-y-1.5">
              <Label htmlFor="format">Export Format</Label>
              <Select value={format} onValueChange={v => setFormat(v as ExportFormat)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" /> Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" /> PDF (.pdf)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4 text-gray-500" /> CSV (.csv)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              variant="outline"
              onClick={handleLoadPreview}
              disabled={isLoading}
              id="preview-report-btn"
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {isLoading ? 'Loading…' : 'Preview Data'}
            </Button>

            <Button
              onClick={handleExport}
              disabled={exporting || !reportData.length}
              id="export-report-btn"
              className="gap-2 min-w-[180px]"
            >
              {exporting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Exporting…</>
                : <>
                    {(() => { const Ic = FORMAT_ICONS[format]; return <Ic className="h-4 w-4" /> })()}
                    Export as {format.toUpperCase()}
                  </>
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Summary cards ── */}
      {preview && reportData.length > 0 && !isLoading && (
        <SummaryCards reportType={reportType} data={reportData} />
      )}

      {/* ── Preview table ── */}
      {preview && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Table className="h-4 w-4 text-muted-foreground" />
                  Data Preview
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {isLoading ? 'Loading…' : `${reportData.length} records found`}
                </CardDescription>
              </div>
              {reportData.length > 0 && (
                <Badge variant="secondary">{reportData.length} rows</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading report data…
              </div>
            ) : reportData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No data found for the selected filters.</p>
              </div>
            ) : (
              <PreviewTable columns={COLUMNS[reportType]} data={reportData} />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Format guide ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Export Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { fmt: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-green-600 bg-green-50 border-green-200', desc: 'Best for data analysis, pivot tables, and sharing with finance teams.' },
              { fmt: 'PDF (.pdf)', icon: FileText, color: 'text-red-600 bg-red-50 border-red-200', desc: 'Professionally formatted with header, footer and page numbers. Ideal for printing or emailing.' },
              { fmt: 'CSV (.csv)', icon: Table, color: 'text-gray-600 bg-gray-50 border-gray-200', desc: 'Plain comma-separated values. Compatible with any spreadsheet or analytics tool.' },
            ].map(f => {
              const Icon = f.icon
              return (
                <div key={f.fmt} className={`flex gap-3 rounded-lg border p-3 ${f.color}`}>
                  <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{f.fmt}</p>
                    <p className="text-xs opacity-80 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
