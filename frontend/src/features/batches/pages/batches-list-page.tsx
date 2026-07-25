import { useState, useEffect, useCallback } from 'react'
import {
  Boxes,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Plus,
  Search,
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  batchApi,
  ProductBatch,
  CreateBatchData,
  BatchRecall,
} from '@/features/batches/api/batch-service'
import { useLocalization } from '@/contexts/localization-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function BatchesListPage() {
  const { formatDateLocalized } = useLocalization()

  const [activeTab, setActiveTab] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [batches, setBatches] = useState<ProductBatch[]>([])
  const [recalls, setRecalls] = useState<BatchRecall[]>([])

  // Pagination
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalResults: 0,
  })

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isRecallOpen, setIsRecallOpen] = useState(false)
  const [selectedBatchForMovement, setSelectedBatchForMovement] = useState<ProductBatch | null>(null)

  // Form state - Register Batch
  const [newBatch, setNewBatch] = useState<CreateBatchData>({
    batchNumber: '',
    productId: '',
    supplierBatch: '',
    mfgDate: '',
    expiryDate: '',
    quantity: 100,
    notes: '',
  })

  // Form state - Recall Batch
  const [recallReason, setRecallReason] = useState('')
  const [recallSeverity, setRecallSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high')
  const [recallDisposition, setRecallDisposition] = useState<'quarantine' | 'destroyed' | 'returned_to_supplier'>('quarantine')
  const [selectedBatchIdsForRecall, setSelectedBatchIdsForRecall] = useState<string[]>([])

  // Form state - Movement
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN')
  const [movementQty, setMovementQty] = useState(10)
  const [movementReason, setMovementReason] = useState('')

  const fetchBatches = useCallback(async () => {
    setIsLoading(true)
    try {
      const [resBatches, resRecalls] = await Promise.all([
        batchApi.getBatches({
          status: activeTab !== 'all' ? activeTab : undefined,
          search: search || undefined,
          page,
          limit: 15,
        }),
        batchApi.getRecalls(),
      ])

      if (resBatches.success && resBatches.data) {
        setBatches(resBatches.data)
        if (resBatches.pagination) {
          setPagination({
            page: resBatches.pagination.page,
            limit: resBatches.pagination.limit,
            totalPages: resBatches.pagination.totalPages,
            totalResults: resBatches.pagination.totalResults,
          })
        }
      }

      if (resRecalls.success && resRecalls.data) {
        setRecalls(resRecalls.data)
      }
    } catch (error) {
      console.error('Failed to fetch product batches:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, search, page])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  const handleRegisterBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBatch.productId.trim()) {
      toast.error('Product ID or Product Name is required.')
      return
    }
    setIsLoading(true)
    try {
      const res = await batchApi.createBatch(newBatch)
      if (res.success) {
        toast.success(`Batch ${res.data?.batchNumber || 'registered'} successfully!`)
        setIsRegisterOpen(false)
        setNewBatch({
          batchNumber: '',
          productId: '',
          supplierBatch: '',
          mfgDate: '',
          expiryDate: '',
          quantity: 100,
          notes: '',
        })
        fetchBatches()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register batch.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitiateRecallSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedBatchIdsForRecall.length === 0) {
      toast.error('Please select at least one batch to recall.')
      return
    }
    if (!recallReason.trim()) {
      toast.error('Please specify a reason for the batch recall.')
      return
    }
    setIsLoading(true)
    try {
      const res = await batchApi.initiateRecall({
        batchIds: selectedBatchIdsForRecall,
        reason: recallReason,
        severity: recallSeverity,
        disposition: recallDisposition,
      })
      if (res.success) {
        toast.success(`Recall ${res.data?.recallNumber || 'initiated'} successfully!`)
        setIsRecallOpen(false)
        setRecallReason('')
        setSelectedBatchIdsForRecall([])
        fetchBatches()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate batch recall.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatchForMovement) return
    setIsLoading(true)
    try {
      const res = await batchApi.recordMovement({
        batchId: selectedBatchForMovement.id,
        type: movementType,
        quantity: Number(movementQty),
        reason: movementReason || `Batch movement (${movementType})`,
      })
      if (res.success) {
        toast.success('Batch stock movement recorded!')
        setSelectedBatchForMovement(null)
        fetchBatches()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record movement.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Active Lot</Badge>
      case 'expiring_soon':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs animate-pulse">Expiring Soon</Badge>
      case 'expired':
        return <Badge variant="destructive" className="text-xs">Expired</Badge>
      case 'recalled':
        return <Badge variant="destructive" className="bg-purple-600 text-white text-xs">Recalled</Badge>
      case 'depleted':
        return <Badge variant="secondary" className="text-xs">Depleted</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const activeCount = batches.filter((b) => b.status === 'active').length
  const expiringCount = batches.filter((b) => b.status === 'expiring_soon' || b.status === 'expired').length
  const recalledCount = batches.filter((b) => b.status === 'recalled').length

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Boxes className="h-7 w-7 text-indigo-500" />
            Batch & Lot Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            Track batch numbers, manufacturing/expiry dates, supplier lots, movement history, and recall management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsRecallOpen(true)} className="gap-1.5 text-xs border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10">
            <ShieldAlert className="h-4 w-4" />
            Initiate Batch Recall
          </Button>
          <Button size="sm" onClick={() => setIsRegisterOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            Register New Batch
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Registered Batches</p>
              <h3 className="text-2xl font-bold mt-1">{batches.length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Boxes className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Lots</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{activeCount}</h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Expiring & Expired</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{expiringCount}</h3>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Quarantined / Recalled</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">{recalledCount}</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All Batches' },
              { id: 'active', label: 'Active' },
              { id: 'expiring_soon', label: 'Expiring Soon' },
              { id: 'expired', label: 'Expired' },
              { id: 'recalled', label: 'Recalled' },
              { id: 'depleted', label: 'Depleted' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id)
                  setPage(1)
                }}
                className={cn(
                  'px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors',
                  activeTab === t.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search batch #, product, supplier lot..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm">Fetching product batches...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-2">
              <Boxes className="h-8 w-8 mx-auto" />
              <p className="text-sm font-semibold">No batches found</p>
              <p className="text-xs">Register your first batch using the "Register New Batch" button above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">Batch Number</th>
                    <th className="p-3">Product Info</th>
                    <th className="p-3">Supplier Batch</th>
                    <th className="p-3">Mfg Date</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Stock Quantity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-muted/20">
                      <td className="p-3 font-mono font-bold text-foreground">
                        {batch.batchNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{batch.productName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">SKU: {batch.sku}</div>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {batch.supplierBatch || 'N/A'}
                        {batch.supplierName && <div className="text-[10px] text-muted-foreground">{batch.supplierName}</div>}
                      </td>
                      <td className="p-3 whitespace-nowrap text-muted-foreground">
                        {batch.mfgDate ? formatDateLocalized(batch.mfgDate) : 'N/A'}
                      </td>
                      <td className="p-3 whitespace-nowrap font-medium">
                        {batch.expiryDate ? (
                          <span className={batch.status === 'expired' ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                            {formatDateLocalized(batch.expiryDate)}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-foreground">{batch.quantity} units</div>
                        <div className="text-[10px] text-muted-foreground">Initial: {batch.initialQuantity}</div>
                      </td>
                      <td className="p-3">{getStatusBadge(batch.status)}</td>
                      <td className="p-3 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBatchForMovement(batch)}
                          className="h-7 text-xs px-2"
                        >
                          Movement
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recalls Audit History */}
      {recalls.length > 0 && (
        <Card className="shadow-sm border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-purple-500" />
              Batch Recall Audit History
            </CardTitle>
            <CardDescription className="text-xs">
              Log of initiated batch recalls, quarantined products, and disposition statuses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {recalls.map((r) => (
              <div key={r.id} className="border rounded-lg p-3 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="font-mono">{r.recallNumber}</Badge>
                    <span className="font-semibold">{r.reason}</span>
                    <Badge variant="outline" className="capitalize text-[10px]">{r.severity} Severity</Badge>
                  </div>
                  <span className="text-muted-foreground">{new Date(r.recalledAt).toLocaleString()}</span>
                </div>
                {r.description && <p className="text-muted-foreground">{r.description}</p>}
                <div className="pt-1 flex flex-wrap gap-2">
                  {r.items?.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[11px] gap-1">
                      <span>{item.productName} ({item.batchNumber})</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                        - {item.quantityRecalled} Qty ({item.disposition})
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* DIALOG 1: Register New Batch */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" />
              Register New Product Batch
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter batch number, manufacturing date, expiry date, and initial quantity.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterBatchSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Product ID or SKU *</Label>
              <Input
                placeholder="e.g. MED-PCM-500"
                value={newBatch.productId}
                onChange={(e) => setNewBatch({ ...newBatch, productId: e.target.value })}
                required
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Batch Number</Label>
                <Input
                  placeholder="Auto-generated if empty"
                  value={newBatch.batchNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                  className="h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Supplier Batch / Lot #</Label>
                <Input
                  placeholder="e.g. SUPP-LOT-778"
                  value={newBatch.supplierBatch}
                  onChange={(e) => setNewBatch({ ...newBatch, supplierBatch: e.target.value })}
                  className="h-9 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Manufacturing Date</Label>
                <Input
                  type="date"
                  value={newBatch.mfgDate}
                  onChange={(e) => setNewBatch({ ...newBatch, mfgDate: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Expiry Date</Label>
                <Input
                  type="date"
                  value={newBatch.expiryDate}
                  onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Initial Batch Quantity *</Label>
              <Input
                type="number"
                min={1}
                value={newBatch.quantity}
                onChange={(e) => setNewBatch({ ...newBatch, quantity: Number(e.target.value) })}
                required
                className="h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Batch Notes / Storage Requirements</Label>
              <Input
                placeholder="e.g. Keep refrigerated at 4°C"
                value={newBatch.notes}
                onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                className="h-9"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Register Batch
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Batch Recall Management */}
      <Dialog open={isRecallOpen} onOpenChange={setIsRecallOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <ShieldAlert className="h-5 w-5 text-purple-500" />
              Initiate Product Batch Recall & Quarantine
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select batches to immediately flag as recalled and quarantine remaining stock.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInitiateRecallSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Select Batches to Recall *</Label>
              <div className="max-h-36 overflow-y-auto border rounded-md p-2 space-y-1.5 bg-muted/20">
                {batches.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 hover:bg-muted p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBatchIdsForRecall.includes(b.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBatchIdsForRecall([...selectedBatchIdsForRecall, b.id])
                        } else {
                          setSelectedBatchIdsForRecall(selectedBatchIdsForRecall.filter((id) => id !== b.id))
                        }
                      }}
                      className="rounded border-input text-primary"
                    />
                    <span className="font-mono font-semibold">{b.batchNumber}</span>
                    <span className="text-muted-foreground">({b.productName} - {b.quantity} Qty)</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Recall Reason *</Label>
              <Input
                placeholder="e.g. Quality Defect Alert, Contamination Warning"
                value={recallReason}
                onChange={(e) => setRecallReason(e.target.value)}
                required
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Severity Level</Label>
                <select
                  value={recallSeverity}
                  onChange={(e) => setRecallSeverity(e.target.value as any)}
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Stock Disposition</Label>
                <select
                  value={recallDisposition}
                  onChange={(e) => setRecallDisposition(e.target.value as any)}
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs outline-none"
                >
                  <option value="quarantine">Quarantine in Warehouse</option>
                  <option value="destroyed">Safe Destruction</option>
                  <option value="returned_to_supplier">Returned to Supplier</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsRecallOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                Confirm Batch Recall
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: Record Batch Stock Movement */}
      {selectedBatchForMovement && (
        <Dialog open={Boolean(selectedBatchForMovement)} onOpenChange={() => setSelectedBatchForMovement(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Boxes className="h-5 w-5 text-primary" />
                Record Batch Stock Movement
              </DialogTitle>
              <DialogDescription className="text-xs">
                Batch: <strong>{selectedBatchForMovement.batchNumber}</strong> ({selectedBatchForMovement.productName})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecordMovementSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Movement Type</Label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as any)}
                    className="w-full h-9 rounded-md border bg-background px-3 text-xs outline-none"
                  >
                    <option value="IN">IN (Stock Added)</option>
                    <option value="OUT">OUT (Stock Sold/Issued)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={movementQty}
                    onChange={(e) => setMovementQty(Number(e.target.value))}
                    required
                    className="h-9 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Movement Reason</Label>
                <Input
                  placeholder="e.g. Sales Order Issue, Warehouse Audit"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setSelectedBatchForMovement(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Save Movement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
