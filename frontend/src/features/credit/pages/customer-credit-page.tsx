import { useState } from 'react'
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
  Ban,
  ReceiptText,
  SlidersHorizontal,
  Search,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  useCreditList,
  useCreditOverdue,
  useCreditProfile,
  useApproveLimit,
  useSuspendCredit,
  useRecordPayment,
  useAdjustBalance,
} from '../hooks/use-credit'
import type { CreditSummary, CreditStatus, CreditLog, CreditProfile } from '../services/credit-service'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `KSh ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' })

const STATUS_CFG: Record<CreditStatus, { label: string; color: string; icon: React.ElementType }> = {
  none: { label: 'No Credit', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: XCircle },
  active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700 border-red-200', icon: Ban },
  exceeded: { label: 'Limit Exceeded', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
}

const LOG_TYPE_CFG: Record<string, { label: string; color: string }> = {
  credit_approved: { label: 'Credit Approved', color: 'text-green-600' },
  credit_updated: { label: 'Credit Updated', color: 'text-blue-600' },
  credit_suspended: { label: 'Credit Suspended', color: 'text-red-600' },
  payment_received: { label: 'Payment Received', color: 'text-green-600' },
  sale_on_credit: { label: 'Sale on Credit', color: 'text-orange-600' },
  balance_adjusted: { label: 'Balance Adjusted', color: 'text-purple-600' },
}

function StatusBadge({ status }: { status: CreditStatus }) {
  const cfg = STATUS_CFG[status]
  const Icon = cfg.icon
  return (
    <Badge className={`text-xs border gap-1 ${cfg.color}`}>
      <Icon className="h-3 w-3" />{cfg.label}
    </Badge>
  )
}

// ─── Utilization Bar ──────────────────────────────────────────────────────────

function UtilBar({ pct, status }: { pct: number; status: CreditStatus }) {
  const color =
    status === 'exceeded' ? 'bg-red-500' :
    pct > 75 ? 'bg-orange-500' :
    pct > 50 ? 'bg-yellow-400' : 'bg-green-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{pct.toFixed(1)}% used</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

// ─── Approve Limit Dialog ─────────────────────────────────────────────────────

function ApproveLimitDialog({ open, customerId, customerName, onClose }: { open: boolean; customerId: string; customerName: string; onClose: () => void }) {
  const [limit, setLimit] = useState('')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const { mutate, isPending } = useApproveLimit()

  const handleSubmit = () => {
    if (!limit) return
    mutate({ customerId, creditLimit: Number(limit), notes: notes || undefined, dueDate: dueDate || undefined }, {
      onSuccess: () => { setLimit(''); setNotes(''); setDueDate(''); onClose() }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Set Credit Limit</DialogTitle>
          <DialogDescription>Approve or update credit limit for <strong>{customerName}</strong></DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cl-limit">Credit Limit (KSh) *</Label>
            <Input id="cl-limit" type="number" min={0} placeholder="e.g. 100000" value={limit} onChange={(e) => setLimit(e.target.value)} disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cl-due">Payment Due Date</Label>
            <Input id="cl-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cl-notes">Notes</Label>
            <Textarea id="cl-notes" placeholder="Reason for credit approval..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isPending} rows={2} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={isPending || !limit} className="flex-1">
              {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Approve Credit Limit'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Record Payment Dialog ────────────────────────────────────────────────────

function RecordPaymentDialog({ open, customerId, customerName, outstanding, onClose }: { open: boolean; customerId: string; customerName: string; outstanding: number; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [reference, setReference] = useState('')
  const { mutate, isPending } = useRecordPayment()

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return
    mutate({ customerId, amount: Number(amount), notes: notes || undefined, referenceId: reference || undefined }, {
      onSuccess: () => { setAmount(''); setNotes(''); setReference(''); onClose() }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5" />Record Payment</DialogTitle>
          <DialogDescription>Record a payment received from <strong>{customerName}</strong></DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="rounded-lg border bg-orange-50/60 p-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Outstanding Balance</span>
            <span className="font-bold text-orange-700">{fmt(outstanding)}</span>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rp-amount">Payment Amount (KSh) *</Label>
            <Input id="rp-amount" type="number" min={0.01} step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rp-ref">Reference / Receipt No.</Label>
            <Input id="rp-ref" placeholder="e.g. MPESA-XXXX" value={reference} onChange={(e) => setReference(e.target.value)} disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rp-notes">Notes</Label>
            <Textarea id="rp-notes" placeholder="Optional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isPending} rows={2} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={isPending || !amount || Number(amount) <= 0} className="flex-1">
              {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Recording...</> : 'Record Payment'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Credit Profile Panel ─────────────────────────────────────────────────────

function CreditProfilePanel({ customerId, onApprove, onRecordPayment, onSuspend }: {
  customerId: string
  onApprove: () => void
  onRecordPayment: () => void
  onSuspend: () => void
}) {
  const [showLogs, setShowLogs] = useState(true)
  const { data: profile, isLoading } = useCreditProfile(customerId)
  const { mutate: suspend, isPending: isSuspending } = useSuspendCredit()

  if (isLoading) return <div className="flex items-center justify-center h-48 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mr-2" />Loading...</div>
  if (!profile) return null

  const { customer, credit, pendingInvoices, overdueInvoices, creditLogs } = profile

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg">{customer.name}</h3>
          <p className="text-sm text-muted-foreground">{customer.email} · {customer.phone}</p>
        </div>
        <StatusBadge status={credit.creditStatus} />
      </div>

      {/* Credit metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Credit Limit', value: fmt(credit.creditLimit), sub: null },
          { label: 'Outstanding', value: fmt(credit.outstandingBalance), sub: null, alert: credit.outstandingBalance > 0 },
          { label: 'Available Credit', value: fmt(credit.availableCredit), sub: null },
          { label: 'Utilization', value: `${credit.utilizationPercent}%`, sub: null },
        ].map(({ label, value, alert }) => (
          <div key={label} className={`rounded-lg border p-3 ${alert ? 'border-orange-200 bg-orange-50/40' : 'bg-muted/30'}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`font-bold text-sm mt-0.5 ${alert ? 'text-orange-700' : ''}`}>{value}</p>
          </div>
        ))}
      </div>

      <UtilBar pct={credit.utilizationPercent} status={credit.creditStatus} />

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onApprove} className="gap-1">
          <CreditCard className="h-4 w-4" />Set Limit
        </Button>
        {credit.outstandingBalance > 0 && (
          <Button size="sm" variant="outline" onClick={onRecordPayment} className="gap-1">
            <ReceiptText className="h-4 w-4" />Record Payment
          </Button>
        )}
        {credit.creditStatus !== 'suspended' && credit.creditStatus !== 'none' && (
          <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => suspend({ customerId, notes: 'Suspended via Credit Management' })} disabled={isSuspending}>
            {isSuspending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
            Suspend
          </Button>
        )}
      </div>

      {/* Overdue invoices */}
      {overdueInvoices.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50/40 p-3 space-y-2">
          <p className="text-sm font-semibold text-red-700 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{overdueInvoices.length} Overdue Invoice{overdueInvoices.length > 1 ? 's' : ''}</p>
          {overdueInvoices.slice(0, 3).map((inv) => (
            <div key={inv.id} className="flex justify-between text-xs">
              <span className="font-mono">{inv.saleNumber}</span>
              <span>{fmtDate(inv.saleDate)}</span>
              <span className="font-semibold">{fmt(Number(inv.total))}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pending invoices */}
      {pendingInvoices.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Pending Invoices ({pendingInvoices.length})</p>
          <div className="space-y-1.5">
            {pendingInvoices.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                <span className="font-mono text-xs">{inv.saleNumber}</span>
                <Badge variant="outline" className="text-xs capitalize">{inv.paymentStatus}</Badge>
                <span className="font-medium">{fmt(Number(inv.total))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit history */}
      <div>
        <button onClick={() => setShowLogs((v) => !v)} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          {showLogs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Credit History ({creditLogs.length})
        </button>
        {showLogs && creditLogs.length > 0 && (
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
            {creditLogs.map((log: CreditLog) => {
              const cfg = LOG_TYPE_CFG[log.type] || { label: log.type, color: 'text-gray-600' }
              const sign = log.type === 'payment_received' ? '-' : log.type === 'sale_on_credit' ? '+' : ''
              return (
                <div key={log.id} className="rounded-lg border bg-muted/20 px-3 py-2">
                  <div className="flex justify-between items-start">
                    <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(log.createdAt)}</p>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>Balance: {fmt(log.balanceBefore)} → {fmt(log.balanceAfter)}</span>
                    <span className={`font-medium ${log.type === 'payment_received' ? 'text-green-600' : 'text-orange-600'}`}>
                      {sign}{fmt(Number(log.amount))}
                    </span>
                  </div>
                  {log.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{log.notes}"</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CustomerCreditPage() {
  const [tab, setTab] = useState<'all' | 'overdue'>('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState('')
  const [approveOpen, setApproveOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const { data: customers = [], isLoading } = useCreditList({ search: search || undefined, creditStatus: statusFilter })
  const { data: overdue = [], isLoading: overdueLoading } = useCreditOverdue()
  const { data: profile } = useCreditProfile(selectedId || '')

  const list = tab === 'all' ? customers : overdue as any[]

  const totalOutstanding = customers.reduce((s, c) => s + c.outstandingBalance, 0)
  const totalLimit = customers.reduce((s, c) => s + c.creditLimit, 0)
  const withCredit = customers.filter((c) => c.creditStatus !== 'none').length
  const exceeded = customers.filter((c) => c.creditStatus === 'exceeded').length

  const selectCustomer = (c: CreditSummary) => {
    setSelectedId(c.id === selectedId ? null : c.id)
    setSelectedName(c.name)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" />Customer Credit Management
        </h1>
        <p className="text-muted-foreground mt-1">Track credit limits, outstanding balances, payment history and approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total Outstanding', value: fmt(totalOutstanding), icon: DollarSign, color: 'bg-orange-500/10 text-orange-600' },
          { label: 'Total Credit Issued', value: fmt(totalLimit), icon: CreditCard, color: 'bg-blue-500/10 text-blue-600' },
          { label: 'Customers with Credit', value: withCredit, icon: Users, color: 'bg-green-500/10 text-green-600' },
          { label: 'Limit Exceeded', value: exceeded, icon: AlertTriangle, color: 'bg-red-500/10 text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['all', 'overdue'] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setSelectedId(null) }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'all' ? `All Customers (${customers.length})` : `Overdue (${overdue.length})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      {tab === 'all' && (
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-8 w-60" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>}
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="exceeded">Limit Exceeded</option>
            <option value="suspended">Suspended</option>
            <option value="none">No Credit</option>
          </select>
        </div>
      )}

      {/* Split layout */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* List */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {(isLoading || overdueLoading) ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mr-2" />Loading...</div>
              ) : list.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                  <p className="text-sm text-muted-foreground">{tab === 'overdue' ? 'No overdue accounts!' : 'No customers found'}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Limit</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((c: CreditSummary) => {
                      const limit = Number(c.creditLimit)
                      const balance = Number(c.outstandingBalance)
                      const util = limit > 0 ? (balance / limit) * 100 : 0
                      return (
                        <TableRow key={c.id} className={`cursor-pointer ${selectedId === c.id ? 'bg-primary/5' : 'hover:bg-muted/40'}`}
                          onClick={() => selectCustomer(c)}>
                          <TableCell>
                            <p className="font-medium text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">{limit > 0 ? fmt(limit) : '—'}</TableCell>
                          <TableCell className={`text-right text-sm font-medium ${balance > 0 ? 'text-orange-600' : ''}`}>
                            {balance > 0 ? fmt(balance) : '—'}
                          </TableCell>
                          <TableCell className="w-32">
                            <UtilBar pct={util} status={c.creditStatus} />
                          </TableCell>
                          <TableCell><StatusBadge status={c.creditStatus} /></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selectedId ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Credit Profile</CardTitle>
                <CardDescription>Actions and history for {selectedName}</CardDescription>
              </CardHeader>
              <CardContent>
                <CreditProfilePanel
                  customerId={selectedId}
                  onApprove={() => setApproveOpen(true)}
                  onRecordPayment={() => setPaymentOpen(true)}
                  onSuspend={() => {}}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed text-center gap-3">
              <TrendingUp className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Select a customer to view their credit profile</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ApproveLimitDialog
        open={approveOpen}
        customerId={selectedId || ''}
        customerName={selectedName}
        onClose={() => setApproveOpen(false)}
      />
      <RecordPaymentDialog
        open={paymentOpen}
        customerId={selectedId || ''}
        customerName={selectedName}
        outstanding={profile?.credit.outstandingBalance || 0}
        onClose={() => setPaymentOpen(false)}
      />
    </div>
  )
}
