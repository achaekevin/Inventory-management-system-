import { useState } from 'react'
import {
  AlertTriangle,
  RefreshCw,
  Bell,
  ShoppingCart,
  Package,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building2,
  Phone,
  Mail,
  Clock,
  Loader2,
  FileText,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  useReorderSuggestions,
  useScanAndNotify,
  useCreateDraftPO,
  useNotifyManagers,
} from '../hooks/use-reorder'
import type { ReorderSuggestion, SuggestedSupplier } from '../services/reorder-service'

// ─── Urgency config ───────────────────────────────────────────────────────────

const URGENCY = {
  critical: {
    label: 'Critical',
    badgeClass: 'bg-red-500/10 text-red-600 border-red-200',
    barClass: 'bg-red-500',
    icon: AlertTriangle,
    iconClass: 'text-red-500',
    cardBorder: 'border-red-200 dark:border-red-900',
    cardBg: 'bg-red-50/40 dark:bg-red-950/20',
  },
  high: {
    label: 'High Priority',
    badgeClass: 'bg-orange-500/10 text-orange-600 border-orange-200',
    barClass: 'bg-orange-500',
    icon: TrendingDown,
    iconClass: 'text-orange-500',
    cardBorder: 'border-orange-200 dark:border-orange-900',
    cardBg: 'bg-orange-50/40 dark:bg-orange-950/20',
  },
  medium: {
    label: 'Medium',
    badgeClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    barClass: 'bg-yellow-400',
    icon: Package,
    iconClass: 'text-yellow-500',
    cardBorder: 'border-yellow-200 dark:border-yellow-900',
    cardBg: 'bg-yellow-50/40 dark:bg-yellow-950/20',
  },
}

// ─── Stock Level Bar ──────────────────────────────────────────────────────────

function StockBar({ current, reorder }: { current: number; reorder: number }) {
  const max = Math.max(reorder * 2, current, 1)
  const pct = Math.min((current / max) * 100, 100)
  const color =
    current <= 0 ? 'bg-red-500' : current <= reorder * 0.5 ? 'bg-orange-500' : 'bg-yellow-400'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Current: {current}</span>
        <span>Reorder Level: {reorder}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Draft PO Dialog ──────────────────────────────────────────────────────────

function CreateDraftPODialog({
  open,
  onClose,
  suggestion,
  supplier,
}: {
  open: boolean
  onClose: () => void
  suggestion: ReorderSuggestion | null
  supplier: SuggestedSupplier | null
}) {
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [notes, setNotes] = useState('')
  const { mutate: createDraftPO, isPending } = useCreateDraftPO()

  const handleSubmit = () => {
    if (!suggestion || !supplier) return
    const qty = parseInt(quantity) || suggestion.suggestedQuantity
    const price =
      parseFloat(unitPrice) ||
      supplier.lastPurchasePrice ||
      suggestion.estimatedCost / suggestion.suggestedQuantity

    createDraftPO(
      {
        supplierId: supplier.supplierId,
        items: [{ productId: suggestion.productId, quantity: qty, unitPrice: price }],
        notes: notes || `Auto-generated reorder for ${suggestion.productName}`,
      },
      { onSuccess: onClose }
    )
  }

  if (!suggestion || !supplier) return null
  const defaultQty = suggestion.suggestedQuantity
  const defaultPrice = supplier.lastPurchasePrice?.toFixed(2) || (suggestion.estimatedCost / suggestion.suggestedQuantity).toFixed(2)
  const estimatedTotal =
    (parseInt(quantity) || defaultQty) * (parseFloat(unitPrice) || parseFloat(defaultPrice))

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Draft Purchase Order
          </DialogTitle>
          <DialogDescription>
            Creating PO for <strong>{suggestion.productName}</strong> from{' '}
            <strong>{supplier.supplierName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Product summary */}
          <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
            <p className="font-medium text-sm">{suggestion.productName}</p>
            <p className="text-xs text-muted-foreground font-mono">{suggestion.productSku}</p>
            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
              <span>Current stock: <strong>{suggestion.currentStock}</strong></span>
              <span>Reorder level: <strong>{suggestion.reorderLevel}</strong></span>
            </div>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="po-qty">Quantity *</Label>
              <Input
                id="po-qty"
                type="number"
                min={1}
                placeholder={String(defaultQty)}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">Suggested: {defaultQty}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="po-price">Unit Price (KSh) *</Label>
              <Input
                id="po-price"
                type="number"
                min={0}
                step="0.01"
                placeholder={defaultPrice}
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                disabled={isPending}
              />
              {supplier.lastPurchasePrice && (
                <p className="text-xs text-muted-foreground">Last price: KSh {supplier.lastPurchasePrice.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Estimated total */}
          <div className="flex items-center justify-between rounded-lg border bg-primary/5 p-3">
            <span className="text-sm font-medium">Estimated Total</span>
            <span className="text-lg font-bold text-primary">
              KSh {estimatedTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="po-notes">Notes</Label>
            <Textarea
              id="po-notes"
              placeholder="Optional notes for this purchase order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
              {isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating PO...</>
              ) : (
                <><ShoppingCart className="h-4 w-4 mr-2" />Create Draft PO</>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Suggestion Card ──────────────────────────────────────────────────────────

function SuggestionCard({
  item,
  onCreatePO,
}: {
  item: ReorderSuggestion
  onCreatePO: (item: ReorderSuggestion, supplier: SuggestedSupplier) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const cfg = URGENCY[item.urgency]
  const UrgencyIcon = cfg.icon

  return (
    <Card className={`border ${cfg.cardBorder} ${cfg.cardBg}`}>
      <CardContent className="pt-5 pb-4 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background border ${cfg.cardBorder}`}>
              <UrgencyIcon className={`h-5 w-5 ${cfg.iconClass}`} />
            </div>
            <div>
              <p className="font-semibold leading-tight">{item.productName}</p>
              <p className="text-xs text-muted-foreground font-mono">{item.productSku}</p>
            </div>
          </div>
          <Badge className={`text-xs border shrink-0 ${cfg.badgeClass}`}>{cfg.label}</Badge>
        </div>

        {/* Stock bar */}
        <StockBar current={item.currentStock} reorder={item.reorderLevel} />

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-background border p-2">
            <p className="text-sm font-bold">{item.currentStock}</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          <div className="rounded-lg bg-background border p-2">
            <p className="text-sm font-bold">{item.suggestedQuantity}</p>
            <p className="text-xs text-muted-foreground">Order Qty</p>
          </div>
          <div className="rounded-lg bg-background border p-2">
            <p className="text-sm font-bold text-primary">
              KSh {item.estimatedCost.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">Est. Cost</p>
          </div>
        </div>

        {/* Supplier section */}
        {item.suppliers.length > 0 ? (
          <div className="space-y-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {item.suppliers.length} Suggested Supplier{item.suppliers.length > 1 ? 's' : ''}
            </button>

            {expanded && (
              <div className="space-y-2">
                {item.suppliers.map((supplier) => (
                  <div
                    key={supplier.supplierId}
                    className="rounded-lg border bg-background p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-tight">{supplier.supplierName}</p>
                          <p className="text-xs text-muted-foreground">
                            {supplier.totalPurchases} past order{supplier.totalPurchases !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1 h-7 text-xs"
                        onClick={() => onCreatePO(item, supplier)}
                      >
                        <ShoppingCart className="h-3 w-3" />
                        Create PO
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {supplier.supplierEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />{supplier.supplierEmail}
                        </span>
                      )}
                      {supplier.supplierPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />{supplier.supplierPhone}
                        </span>
                      )}
                      {supplier.lastPurchasePrice && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last price: KSh {supplier.lastPurchasePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-3 text-center">
            <p className="text-xs text-muted-foreground">No supplier history found.</p>
            <p className="text-xs text-muted-foreground">Add a purchase order manually from the Purchases page.</p>
          </div>
        )}

        {/* Quick PO button if only one supplier */}
        {item.suppliers.length === 1 && !expanded && (
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2"
            onClick={() => onCreatePO(item, item.suppliers[0])}
          >
            <ShoppingCart className="h-4 w-4" />
            Create Draft PO — {item.suppliers[0].supplierName}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SmartReorderPage() {
  const [poTarget, setPoTarget] = useState<{ item: ReorderSuggestion; supplier: SuggestedSupplier } | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all')

  const { data: suggestions = [], isLoading, refetch } = useReorderSuggestions()
  const { mutate: scanAndNotify, isPending: isScanning } = useScanAndNotify()
  const { mutate: notifyManagers, isPending: isNotifying } = useNotifyManagers()

  const critical = suggestions.filter((s) => s.urgency === 'critical')
  const high = suggestions.filter((s) => s.urgency === 'high')
  const medium = suggestions.filter((s) => s.urgency === 'medium')
  const totalCost = suggestions.reduce((sum, s) => sum + s.estimatedCost, 0)

  const filtered =
    filter === 'all' ? suggestions : suggestions.filter((s) => s.urgency === filter)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" />
            Smart Reorder System
          </h1>
          <p className="text-muted-foreground mt-1">
            Automatically detect low stock, suggest suppliers, and create draft purchase orders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => notifyManagers()}
            disabled={isNotifying || suggestions.length === 0}
          >
            {isNotifying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            Notify Managers
          </Button>
          <Button
            onClick={() => scanAndNotify()}
            disabled={isScanning}
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isScanning ? 'Scanning...' : 'Run Full Scan'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={AlertTriangle}
          label="Critical"
          value={critical.length}
          sub="Out of stock / below min"
          color="bg-red-500/10 text-red-600"
        />
        <StatCard
          icon={TrendingDown}
          label="High Priority"
          value={high.length}
          sub="Below minimum stock"
          color="bg-orange-500/10 text-orange-600"
        />
        <StatCard
          icon={Package}
          label="Medium"
          value={medium.length}
          sub="Below reorder level"
          color="bg-yellow-500/10 text-yellow-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Est. Reorder Cost"
          value={`KSh ${totalCost.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`}
          sub="Total across all items"
          color="bg-primary/10 text-primary"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'critical', 'high', 'medium'] as const).map((f) => {
          const count =
            f === 'all'
              ? suggestions.length
              : f === 'critical'
              ? critical.length
              : f === 'high'
              ? high.length
              : medium.length
          return (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === 'all' ? 'All' : URGENCY[f].label} ({count})
            </Button>
          )
        })}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => refetch()}
          disabled={isLoading}
          className="ml-auto text-muted-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p>Scanning inventory for low-stock items...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">
              {filter === 'all' ? 'All stock levels are healthy!' : `No ${filter} items found`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all'
                ? 'No products are currently below their reorder levels.'
                : `There are no ${filter} priority items at the moment.`}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Rescan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <SuggestionCard
              key={item.productId}
              item={item}
              onCreatePO={(item, supplier) => setPoTarget({ item, supplier })}
            />
          ))}
        </div>
      )}

      {/* Draft PO Dialog */}
      <CreateDraftPODialog
        open={!!poTarget}
        onClose={() => setPoTarget(null)}
        suggestion={poTarget?.item || null}
        supplier={poTarget?.supplier || null}
      />
    </div>
  )
}
