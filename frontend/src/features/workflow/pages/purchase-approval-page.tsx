import { useState } from 'react'
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  PackageCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  ShoppingCart,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  useWorkflowPending,
  useWorkflowAll,
  useWorkflowHistory,
  useSubmitPurchase,
  useSupervisorApprove,
  useSupervisorReject,
  useFinanceApprove,
  useFinanceReject,
  usePlaceOrder,
  useReceiveGoods,
} from '../hooks/use-workflow'
import type { WorkflowPurchase, WorkflowStatus, ApprovalStep } from '../services/workflow-service'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-600 border-gray-200', icon: ClipboardList },
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: Send },
  pending_supervisor: { label: 'Awaiting Supervisor', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200', icon: ShieldCheck },
  pending_finance: { label: 'Awaiting Finance', color: 'bg-orange-500/10 text-orange-700 border-orange-200', icon: DollarSign },
  approved: { label: 'Approved', color: 'bg-green-500/10 text-green-700 border-green-200', icon: CheckCircle2 },
  ordered: { label: 'Order Placed', color: 'bg-purple-500/10 text-purple-700 border-purple-200', icon: Truck },
  received: { label: 'Received', color: 'bg-teal-500/10 text-teal-700 border-teal-200', icon: PackageCheck },
  completed: { label: 'Completed', color: 'bg-green-600/10 text-green-800 border-green-300', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600 border-red-200', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-400/10 text-gray-500 border-gray-200', icon: XCircle },
}

const STEP_CONFIG: Record<string, { label: string; icon: React.ElementType; positive: boolean }> = {
  submitted: { label: 'Submitted for approval', icon: Send, positive: true },
  supervisor_approved: { label: 'Approved by Supervisor', icon: ShieldCheck, positive: true },
  supervisor_rejected: { label: 'Rejected by Supervisor', icon: XCircle, positive: false },
  finance_approved: { label: 'Approved by Finance', icon: DollarSign, positive: true },
  finance_rejected: { label: 'Rejected by Finance', icon: XCircle, positive: false },
  ordered: { label: 'Order Placed with Supplier', icon: Truck, positive: true },
  received: { label: 'Goods Received', icon: PackageCheck, positive: true },
}

// ─── Workflow Pipeline Banner ─────────────────────────────────────────────────

const PIPELINE_STAGES: { key: WorkflowStatus; label: string; icon: React.ElementType }[] = [
  { key: 'draft', label: 'Draft', icon: ClipboardList },
  { key: 'submitted', label: 'Submitted', icon: Send },
  { key: 'pending_supervisor', label: 'Supervisor', icon: ShieldCheck },
  { key: 'pending_finance', label: 'Finance', icon: DollarSign },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'ordered', label: 'Ordered', icon: Truck },
  { key: 'received', label: 'Received', icon: PackageCheck },
]

const STATUS_INDEX: Partial<Record<WorkflowStatus, number>> = {
  draft: 0, submitted: 1, pending_supervisor: 2, pending_finance: 3,
  approved: 4, ordered: 5, received: 6, completed: 6,
}

function PipelineBanner({ status }: { status: WorkflowStatus }) {
  const currentIdx = STATUS_INDEX[status] ?? -1
  const isRejected = status === 'rejected' || status === 'cancelled'

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {PIPELINE_STAGES.map((stage, i) => {
        const done = i < currentIdx
        const active = i === currentIdx && !isRejected
        const Icon = stage.icon
        return (
          <div key={stage.key} className="flex items-center shrink-0">
            <div className={`flex flex-col items-center gap-1`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all
                ${done ? 'border-green-500 bg-green-500 text-white' :
                  active ? 'border-primary bg-primary text-white' :
                  isRejected && i > 0 ? 'border-red-200 bg-red-50 text-red-300' :
                  'border-muted bg-muted text-muted-foreground'}`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className={`text-xs whitespace-nowrap ${active ? 'font-semibold text-primary' : done ? 'text-green-700' : 'text-muted-foreground'}`}>
                {stage.label}
              </span>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className={`h-0.5 w-6 mx-1 mb-4 rounded ${done ? 'bg-green-400' : 'bg-muted'}`} />
            )}
          </div>
        )
      })}
      {isRejected && (
        <div className="flex items-center gap-1 ml-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <span className="text-xs font-semibold">{status === 'rejected' ? 'Rejected' : 'Cancelled'}</span>
        </div>
      )}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  const Icon = cfg.icon
  return (
    <Badge className={`text-xs border gap-1 ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

// ─── Approval Timeline ────────────────────────────────────────────────────────

function ApprovalTimeline({ steps }: { steps: ApprovalStep[] }) {
  if (steps.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No approval actions yet.</p>
  }

  return (
    <div className="relative space-y-4">
      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
      {steps.map((step, i) => {
        const cfg = STEP_CONFIG[step.step] || { label: step.step, icon: Clock, positive: true }
        const Icon = cfg.icon
        return (
          <div key={step.id} className="flex gap-4 relative">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shrink-0 z-10
              ${cfg.positive ? 'border-green-400 bg-green-50 text-green-600' : 'border-red-400 bg-red-50 text-red-600'}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{cfg.label}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(step.createdAt).toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              {step.actor && (
                <p className="text-xs text-muted-foreground">
                  by {step.actor.firstName} {step.actor.lastName}
                </p>
              )}
              {step.comment && (
                <p className="mt-1 text-xs bg-muted/60 rounded px-2 py-1 italic">"{step.comment}"</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Action Dialog ────────────────────────────────────────────────────────────

type ActionType = 'submit' | 'sup-approve' | 'sup-reject' | 'fin-approve' | 'fin-reject' | 'place-order' | 'receive'

const ACTION_CONFIG: Record<ActionType, { title: string; description: string; confirmLabel: string; variant: 'default' | 'destructive'; needsComment: boolean }> = {
  'submit': { title: 'Submit for Approval', description: 'This will send the purchase for supervisor review.', confirmLabel: 'Submit', variant: 'default', needsComment: false },
  'sup-approve': { title: 'Supervisor Approval', description: 'Approve this purchase and forward to Finance.', confirmLabel: 'Approve', variant: 'default', needsComment: false },
  'sup-reject': { title: 'Reject Purchase', description: 'Reject this purchase. Please provide a reason.', confirmLabel: 'Reject', variant: 'destructive', needsComment: true },
  'fin-approve': { title: 'Finance Approval', description: 'Approve the budget for this purchase order.', confirmLabel: 'Approve Budget', variant: 'default', needsComment: false },
  'fin-reject': { title: 'Finance Rejection', description: 'Reject due to budget concerns. Please provide a reason.', confirmLabel: 'Reject', variant: 'destructive', needsComment: true },
  'place-order': { title: 'Place Supplier Order', description: 'Confirm that the order has been placed with the supplier.', confirmLabel: 'Confirm Order Placed', variant: 'default', needsComment: false },
  'receive': { title: 'Confirm Goods Received', description: 'Mark all goods as received in the warehouse.', confirmLabel: 'Confirm Receipt', variant: 'default', needsComment: false },
}

function ActionDialog({
  open,
  actionType,
  purchase,
  onClose,
}: {
  open: boolean
  actionType: ActionType | null
  purchase: WorkflowPurchase | null
  onClose: () => void
}) {
  const [comment, setComment] = useState('')

  const submitMut = useSubmitPurchase()
  const supApproveMut = useSupervisorApprove()
  const supRejectMut = useSupervisorReject()
  const finApproveMut = useFinanceApprove()
  const finRejectMut = useFinanceReject()
  const placeOrderMut = usePlaceOrder()
  const receiveGoodsMut = useReceiveGoods()

  const mutMap: Record<ActionType, typeof submitMut> = {
    'submit': submitMut,
    'sup-approve': supApproveMut,
    'sup-reject': supRejectMut,
    'fin-approve': finApproveMut,
    'fin-reject': finRejectMut,
    'place-order': placeOrderMut,
    'receive': receiveGoodsMut,
  }

  if (!actionType || !purchase) return null
  const cfg = ACTION_CONFIG[actionType]
  const mut = mutMap[actionType]
  const isPending = mut.isPending

  const handleConfirm = () => {
    mut.mutate({ id: purchase.id, comment: comment || undefined }, { onSuccess: () => { setComment(''); onClose() } })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setComment(''); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cfg.title}</DialogTitle>
          <DialogDescription>{cfg.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="font-semibold text-sm">{purchase.purchaseNumber}</p>
            <p className="text-xs text-muted-foreground">{purchase.supplier?.name} · KSh {Number(purchase.total).toLocaleString('en-KE')}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="action-comment">Comment {cfg.needsComment && <span className="text-destructive">*</span>}</Label>
            <Textarea
              id="action-comment"
              placeholder={cfg.needsComment ? 'Required: provide a reason...' : 'Optional comment...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={isPending || (cfg.needsComment && !comment.trim())}
              variant={cfg.variant}
              className="flex-1"
            >
              {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : cfg.confirmLabel}
            </Button>
            <Button variant="outline" onClick={() => { setComment(''); onClose() }} disabled={isPending}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Purchase Detail Panel ────────────────────────────────────────────────────

function PurchaseDetailPanel({
  purchaseId,
  onAction,
}: {
  purchaseId: string
  onAction: (type: ActionType, purchase: WorkflowPurchase) => void
}) {
  const [showItems, setShowItems] = useState(false)
  const { data: purchase, isLoading } = useWorkflowHistory(purchaseId)

  if (isLoading) return (
    <div className="flex items-center justify-center h-48 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />Loading...
    </div>
  )
  if (!purchase) return null

  const status = purchase.status as WorkflowStatus

  // Determine available actions for UI (role check happens server-side)
  const actions: { type: ActionType; label: string; icon: React.ElementType; variant?: 'destructive' }[] = []
  if (status === 'draft') actions.push({ type: 'submit', label: 'Submit for Approval', icon: Send })
  if (status === 'submitted' || status === 'pending_supervisor') {
    actions.push({ type: 'sup-approve', label: 'Supervisor Approve', icon: ShieldCheck })
    actions.push({ type: 'sup-reject', label: 'Supervisor Reject', icon: XCircle, variant: 'destructive' })
  }
  if (status === 'pending_finance') {
    actions.push({ type: 'fin-approve', label: 'Finance Approve', icon: DollarSign })
    actions.push({ type: 'fin-reject', label: 'Finance Reject', icon: XCircle, variant: 'destructive' })
  }
  if (status === 'approved') actions.push({ type: 'place-order', label: 'Place Supplier Order', icon: Truck })
  if (status === 'ordered') actions.push({ type: 'receive', label: 'Confirm Goods Received', icon: PackageCheck })

  return (
    <div className="space-y-5">
      {/* Pipeline */}
      <PipelineBanner status={status} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg">{purchase.purchaseNumber}</h3>
          <p className="text-sm text-muted-foreground">{purchase.supplier?.name}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Financials */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Subtotal', value: purchase.subtotal },
          { label: 'Tax', value: purchase.tax },
          { label: 'Discount', value: purchase.discount },
          { label: 'Total', value: purchase.total },
        ].map(({ label, value }) => (
          <div key={label} className={`rounded-lg border p-3 ${label === 'Total' ? 'border-primary/30 bg-primary/5' : 'bg-muted/30'}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`font-bold ${label === 'Total' ? 'text-primary' : ''}`}>
              KSh {Number(value).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Items toggle */}
      <div>
        <button
          onClick={() => setShowItems((v) => !v)}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {showItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {purchase.items?.length || 0} Item{(purchase.items?.length || 0) !== 1 ? 's' : ''}
        </button>
        {showItems && (
          <div className="mt-2 space-y-2">
            {purchase.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{item.product?.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.product?.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">×{item.quantity}</p>
                  <p className="text-xs text-muted-foreground">KSh {Number(item.unitPrice).toLocaleString('en-KE')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Timeline */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Approval History</h4>
        <ApprovalTimeline steps={purchase.approvalSteps || []} />
      </div>

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="border-t pt-4 flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.type}
                size="sm"
                variant={action.variant || 'outline'}
                onClick={() => onAction(action.type, purchase)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Purchase Row Card ────────────────────────────────────────────────────────

function PurchaseRowCard({
  purchase,
  selected,
  onClick,
}: {
  purchase: WorkflowPurchase
  selected: boolean
  onClick: () => void
}) {
  const status = purchase.status as WorkflowStatus
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg?.icon || ClipboardList

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-4 transition-all hover:shadow-sm ${
        selected ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/30'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg?.color || ''}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">{purchase.purchaseNumber}</p>
            <p className="text-xs text-muted-foreground">{purchase.supplier?.name}</p>
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selected ? 'rotate-90' : ''}`} />
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
        <span className="text-xs font-medium">KSh {Number(purchase.total).toLocaleString('en-KE')}</span>
      </div>
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PurchaseApprovalPage() {
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionTarget, setActionTarget] = useState<{ type: ActionType; purchase: WorkflowPurchase } | null>(null)

  const { data: pending = [], isLoading: pendingLoading } = useWorkflowPending()
  const { data: all = [], isLoading: allLoading } = useWorkflowAll(
    tab === 'all' ? { status: statusFilter || undefined, search: search || undefined } : undefined
  )

  const list = tab === 'pending' ? pending : all
  const isLoading = tab === 'pending' ? pendingLoading : allLoading

  const handleAction = (type: ActionType, purchase: WorkflowPurchase) => {
    setActionTarget({ type, purchase })
  }

  const allStatuses: WorkflowStatus[] = [
    'draft', 'submitted', 'pending_supervisor', 'pending_finance',
    'approved', 'ordered', 'received', 'completed', 'rejected', 'cancelled',
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-primary" />
            Purchase Approval Workflow
          </h1>
          <p className="text-muted-foreground mt-1">
            5-stage pipeline: Request → Supervisor → Finance → Order → Receipt
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Pending My Action', value: pending.length, icon: Inbox, color: 'bg-blue-500/10 text-blue-600' },
          { label: 'Awaiting Supervisor', value: all.filter(p => p.status === 'submitted' || p.status === 'pending_supervisor').length, icon: ShieldCheck, color: 'bg-yellow-500/10 text-yellow-600' },
          { label: 'Awaiting Finance', value: all.filter(p => p.status === 'pending_finance').length, icon: DollarSign, color: 'bg-orange-500/10 text-orange-600' },
          { label: 'Orders Placed', value: all.filter(p => p.status === 'ordered').length, icon: Truck, color: 'bg-purple-500/10 text-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['pending', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedId(null) }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'pending' ? `My Actions (${pending.length})` : 'All Workflow'}
          </button>
        ))}
      </div>

      {/* Filters (all tab only) */}
      {tab === 'all' && (
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Search purchase number or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main split-pane layout */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* List panel */}
        <div className="lg:col-span-2 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />Loading...
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <CheckCircle2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {tab === 'pending' ? 'No purchases awaiting your action' : 'No purchases found'}
              </p>
            </div>
          ) : (
            list.map((purchase) => (
              <PurchaseRowCard
                key={purchase.id}
                purchase={purchase}
                selected={selectedId === purchase.id}
                onClick={() => setSelectedId(selectedId === purchase.id ? null : purchase.id)}
              />
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selectedId ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Purchase Details & Actions
                </CardTitle>
                <CardDescription>Review, approve, or take action on this purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <PurchaseDetailPanel purchaseId={selectedId} onAction={handleAction} />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed text-center gap-3">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Select a purchase to view details and take action</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <ActionDialog
        open={!!actionTarget}
        actionType={actionTarget?.type || null}
        purchase={actionTarget?.purchase || null}
        onClose={() => setActionTarget(null)}
      />
    </div>
  )
}
