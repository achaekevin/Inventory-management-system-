import { useState } from 'react'
import {
  Bot,
  Plus,
  Play,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Clock,
  CheckCircle2,
  XCircle,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Loader2,
  Zap,
  Package,
  Coins,
  Bell,
  Archive,
  AlertTriangle,
  Activity,
  Settings2,
  ListChecks,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  useAutomationRules,
  useAllAutomationLogs,
  useCreateAutomationRule,
  useUpdateAutomationRule,
  useDeleteAutomationRule,
  useRunAutomationRule,
} from '../hooks/use-automation'
import type { AutomationRule, AutomationRuleType, RuleConfig } from '../services/automation-service'

// ─── Rule type meta ───────────────────────────────────────────────────────────

const RULE_TYPE_META: Record<AutomationRuleType, {
  label: string
  description: string
  icon: React.ElementType
  color: string
  gradient: string
  warning?: string
}> = {
  low_stock_po: {
    label: 'Auto Purchase Order',
    description: 'Auto-create draft purchase orders when stock falls below reorder threshold.',
    icon: Package,
    color: 'text-blue-600',
    gradient: 'from-blue-500/10 to-blue-600/5',
  },
  high_value_notify: {
    label: 'High-Value Purchase Alert',
    description: 'Notify managers when a purchase total exceeds a configured threshold.',
    icon: Coins,
    color: 'text-amber-600',
    gradient: 'from-amber-500/10 to-amber-600/5',
  },
  overdue_payment_reminder: {
    label: 'Overdue Payment Reminder',
    description: 'Send reminders for customers with outstanding balances past their due date.',
    icon: Bell,
    color: 'text-orange-600',
    gradient: 'from-orange-500/10 to-orange-600/5',
  },
  archive_inactive_product: {
    label: 'Archive Inactive Products',
    description: 'Automatically archive products with no sales activity for a configurable period.',
    icon: Archive,
    color: 'text-purple-600',
    gradient: 'from-purple-500/10 to-purple-600/5',
    warning: 'This rule permanently deactivates products. They can be re-activated manually.',
  },
}

const ALL_ROLES = [
  { slug: 'super-administrator', label: 'Super Administrator' },
  { slug: 'inventory-manager', label: 'Inventory Manager' },
  { slug: 'procurement-officer', label: 'Procurement Officer' },
  { slug: 'supervisor', label: 'Supervisor' },
  { slug: 'operations-manager', label: 'Operations Manager' },
  { slug: 'finance-officer', label: 'Finance Officer' },
  { slug: 'finance-manager', label: 'Finance Manager' },
  { slug: 'warehouse-manager', label: 'Warehouse Manager' },
]

// ─── Status badge for logs ────────────────────────────────────────────────────

function LogStatusBadge({ status }: { status: 'success' | 'error' | 'skipped' }) {
  const map = {
    success: { label: 'Success', icon: CheckCircle2, cls: 'bg-green-500/10 text-green-700 border-green-200' },
    error: { label: 'Error', icon: XCircle, cls: 'bg-red-500/10 text-red-700 border-red-200' },
    skipped: { label: 'Skipped', icon: SkipForward, cls: 'bg-gray-500/10 text-gray-600 border-gray-200' },
  }
  const { label, icon: Icon, cls } = map[status]
  return (
    <Badge className={`text-xs border gap-1 ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

// ─── Dynamic config form fields ───────────────────────────────────────────────

function ConfigFields({
  type,
  config,
  onChange,
}: {
  type: AutomationRuleType
  config: any
  onChange: (cfg: any) => void
}) {
  const update = (key: string, value: any) => onChange({ ...config, [key]: value })

  if (type === 'low_stock_po') {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="preferredSupplierId">Preferred Supplier ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input
            id="preferredSupplierId"
            placeholder="Leave blank to use last-purchase supplier automatically"
            value={config.preferredSupplierId || ''}
            onChange={e => update('preferredSupplierId', e.target.value || undefined)}
          />
          <p className="text-xs text-muted-foreground">If left blank, the system will use the most recent supplier for each product.</p>
        </div>
      </div>
    )
  }

  if (type === 'high_value_notify') {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="threshold">Purchase Threshold (KSh) <span className="text-destructive">*</span></Label>
          <Input
            id="threshold"
            type="number"
            min={1000}
            placeholder="e.g. 100000"
            value={config.threshold || ''}
            onChange={e => update('threshold', Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Notify Roles <span className="text-destructive">*</span></Label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_ROLES.map(role => (
              <label key={role.slug} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md border hover:bg-accent transition-colors">
                <input
                  type="checkbox"
                  checked={(config.notifyRoles || []).includes(role.slug)}
                  onChange={e => {
                    const roles = config.notifyRoles || []
                    update('notifyRoles', e.target.checked ? [...roles, role.slug] : roles.filter((r: string) => r !== role.slug))
                  }}
                  className="accent-primary"
                />
                {role.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'overdue_payment_reminder') {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="graceDays">Grace Period (days after due date) <span className="text-destructive">*</span></Label>
          <Input
            id="graceDays"
            type="number"
            min={0}
            placeholder="e.g. 7"
            value={config.graceDays ?? ''}
            onChange={e => update('graceDays', Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Reminders fire only for payments overdue by more than this many days.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Notify Roles <span className="text-destructive">*</span></Label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_ROLES.map(role => (
              <label key={role.slug} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md border hover:bg-accent transition-colors">
                <input
                  type="checkbox"
                  checked={(config.notifyRoles || []).includes(role.slug)}
                  onChange={e => {
                    const roles = config.notifyRoles || []
                    update('notifyRoles', e.target.checked ? [...roles, role.slug] : roles.filter((r: string) => r !== role.slug))
                  }}
                  className="accent-primary"
                />
                {role.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'archive_inactive_product') {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="inactiveDays">Inactivity Period (days) <span className="text-destructive">*</span></Label>
          <Input
            id="inactiveDays"
            type="number"
            min={7}
            placeholder="e.g. 90"
            value={config.inactiveDays || ''}
            onChange={e => update('inactiveDays', Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Products with no sales in this many days will be archived.</p>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-xs">This action deactivates products. They won't appear in new sales but can be re-activated from the Products page.</p>
        </div>
      </div>
    )
  }

  return null
}

// ─── Rule Form Dialog (Create / Edit) ────────────────────────────────────────

type RuleFormMode = 'create' | 'edit'

function RuleFormDialog({
  open,
  mode,
  rule,
  onClose,
}: {
  open: boolean
  mode: RuleFormMode
  rule?: AutomationRule
  onClose: () => void
}) {
  const createMut = useCreateAutomationRule()
  const updateMut = useUpdateAutomationRule()

  const defaultType: AutomationRuleType = 'low_stock_po'
  const [name, setName] = useState(rule?.name || '')
  const [description, setDescription] = useState(rule?.description || '')
  const [type, setType] = useState<AutomationRuleType>((rule?.type as AutomationRuleType) || defaultType)
  const [config, setConfig] = useState<any>(rule?.config || {})
  const [intervalHours, setIntervalHours] = useState(rule?.intervalHours || 24)

  const isLoading = createMut.isPending || updateMut.isPending
  const typeMeta = RULE_TYPE_META[type]

  const handleTypeChange = (t: AutomationRuleType) => {
    setType(t)
    setConfig({}) // reset config when type changes
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    const payload = { name: name.trim(), description: description.trim() || undefined, type, config, intervalHours }
    if (mode === 'create') {
      createMut.mutate(payload, { onSuccess: onClose })
    } else if (rule) {
      updateMut.mutate({ id: rule.id, payload }, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'New Automation Rule' : 'Edit Rule'}
          </DialogTitle>
          <DialogDescription>
            Define when and how the rule fires. All rules run on a configurable interval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Rule name */}
          <div className="space-y-1.5">
            <Label htmlFor="rule-name">Rule Name <span className="text-destructive">*</span></Label>
            <Input id="rule-name" placeholder="e.g. Weekly Low-Stock PO" value={name} onChange={e => setName(e.target.value)} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="rule-desc">Description</Label>
            <Textarea id="rule-desc" placeholder="Optional notes about this rule..." value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          {/* Rule Type */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label>Rule Type <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(RULE_TYPE_META) as AutomationRuleType[]).map(t => {
                  const meta = RULE_TYPE_META[t]
                  const Icon = meta.icon
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        type === t ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/40 hover:bg-accent'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient}`}>
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{meta.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{meta.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Config fields */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5" /> Rule Configuration
            </Label>
            <div className="rounded-lg border bg-muted/30 p-4">
              <ConfigFields type={type} config={config} onChange={setConfig} />
            </div>
          </div>

          {/* Interval */}
          <div className="space-y-1.5">
            <Label htmlFor="interval">Run Interval (hours)</Label>
            <Input
              id="interval"
              type="number"
              min={1}
              max={8760}
              value={intervalHours}
              onChange={e => setIntervalHours(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Scheduler checks every 15 minutes and fires rules that are past their interval.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button onClick={handleSubmit} disabled={isLoading || !name.trim()} className="flex-1">
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : mode === 'create' ? 'Create Rule' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Execution Log Panel ──────────────────────────────────────────────────────

function LogRow({ log }: { log: any }) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = log.details && Array.isArray(log.details) && log.details.length > 0

  return (
    <div className="border-b last:border-0">
      <div
        className={`flex items-center gap-3 px-4 py-3 ${hasDetails ? 'cursor-pointer hover:bg-muted/30' : ''} transition-colors`}
        onClick={() => hasDetails && setExpanded(v => !v)}
      >
        <LogStatusBadge status={log.status} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {log.rule?.name || 'Unknown Rule'}
            <span className="text-xs text-muted-foreground ml-2 font-normal">{log.rule?.type}</span>
          </p>
          <p className="text-xs text-muted-foreground">{log.message}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-medium">{log.itemsAffected} affected</p>
          <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' })}</p>
        </div>
        {hasDetails && (
          <div className="text-muted-foreground shrink-0">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        )}
      </div>
      {expanded && hasDetails && (
        <div className="px-4 pb-3">
          <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto max-h-40">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Rule Card ────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  onEdit,
}: {
  rule: AutomationRule
  onEdit: (rule: AutomationRule) => void
}) {
  const meta = RULE_TYPE_META[rule.type as AutomationRuleType]
  const Icon = meta?.icon || Bot
  const toggleMut = useUpdateAutomationRule()
  const deleteMut = useDeleteAutomationRule()
  const runMut = useRunAutomationRule()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const lastLog = rule.logs?.[0]

  const handleToggle = () => {
    toggleMut.mutate({ id: rule.id, payload: { isEnabled: !rule.isEnabled } })
  }

  const handleRun = () => {
    runMut.mutate(rule.id)
  }

  const handleDelete = () => {
    if (confirmDelete) {
      deleteMut.mutate(rule.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <Card className={`transition-all border ${rule.isEnabled ? 'border-border' : 'border-dashed border-muted-foreground/30 opacity-70'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta?.gradient || 'from-gray-100 to-gray-50'}`}>
            <Icon className={`h-5 w-5 ${meta?.color || 'text-gray-500'}`} />
          </div>

          {/* Title + badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{rule.name}</CardTitle>
              <Badge variant="outline" className="text-xs">{meta?.label || rule.type}</Badge>
              {rule.isEnabled ? (
                <Badge className="text-xs bg-green-500/10 text-green-700 border border-green-200">Active</Badge>
              ) : (
                <Badge className="text-xs bg-gray-500/10 text-gray-600 border border-gray-200">Disabled</Badge>
              )}
            </div>
            {rule.description && (
              <CardDescription className="mt-0.5 text-xs">{rule.description}</CardDescription>
            )}
          </div>

          {/* Toggle */}
          <button onClick={handleToggle} disabled={toggleMut.isPending} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" title={rule.isEnabled ? 'Disable rule' : 'Enable rule'}>
            {rule.isEnabled
              ? <ToggleRight className="h-7 w-7 text-primary" />
              : <ToggleLeft className="h-7 w-7" />}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-muted/30 p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Interval</p>
            <p className="font-semibold text-sm">{rule.intervalHours}h</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Last Run</p>
            <p className="font-semibold text-sm">
              {rule.lastRunAt
                ? new Date(rule.lastRunAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
                : 'Never'}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Last Result</p>
            <p className="font-semibold text-sm">
              {lastLog ? (
                <span className={lastLog.status === 'success' ? 'text-green-600' : lastLog.status === 'error' ? 'text-red-600' : 'text-gray-500'}>
                  {lastLog.status === 'success' ? `✓ ${lastLog.itemsAffected}` : lastLog.status}
                </span>
              ) : '—'}
            </p>
          </div>
        </div>

        {/* Warning for archive rule */}
        {meta?.warning && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p className="text-xs">{meta.warning}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={runMut.isPending}
            className="flex-1 gap-2"
          >
            {runMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run Now
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(rule)} className="gap-1.5">
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant={confirmDelete ? 'destructive' : 'outline'}
            onClick={handleDelete}
            disabled={deleteMut.isPending}
            className="gap-1.5"
          >
            {deleteMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {confirmDelete ? 'Confirm' : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function WorkflowAutomationPage() {
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<AutomationRule | null>(null)
  const [logTab, setLogTab] = useState<'rules' | 'logs'>('rules')

  const { data: rawRules, isLoading: rulesLoading } = useAutomationRules()
  const { data: rawLogs, isLoading: logsLoading } = useAllAutomationLogs()

  const rules: AutomationRule[] = Array.isArray(rawRules) ? rawRules : ((rawRules as any)?.data || [])
  const allLogs: AutomationLog[] = Array.isArray(rawLogs) ? rawLogs : ((rawLogs as any)?.data || [])

  const activeCount = rules.filter(r => r.isEnabled).length
  const todayLogs = allLogs.filter(l => {
    const logDate = new Date(l.createdAt)
    const now = new Date()
    return logDate.toDateString() === now.toDateString()
  })
  const todayItemsAffected = todayLogs.reduce((sum, l) => sum + l.itemsAffected, 0)

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Workflow Automation</h1>
                <p className="text-sm text-muted-foreground">Define rules that run automatically to keep your operations flowing</p>
              </div>
            </div>
          </div>
          <Button onClick={() => { setEditTarget(null); setShowForm(true) }} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-2 gap-3 mt-4 md:grid-cols-4">
          {[
            { label: 'Total Rules', value: rules.length, icon: ListChecks, color: 'text-blue-600' },
            { label: 'Active Rules', value: activeCount, icon: Zap, color: 'text-green-600' },
            { label: "Today's Runs", value: todayLogs.length, icon: Activity, color: 'text-purple-600' },
            { label: 'Items Processed Today', value: todayItemsAffected, icon: CheckCircle2, color: 'text-teal-600' },
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

      {/* ── Tab switcher ── */}
      <div className="flex gap-2 border-b">
        {(['rules', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setLogTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              logTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'rules' ? `Rules (${rules.length})` : `Execution Log (${allLogs.length})`}
          </button>
        ))}
      </div>

      {/* ── Rules Grid ── */}
      {logTab === 'rules' && (
        <>
          {rulesLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading rules...
            </div>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Bot className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <div>
                <p className="font-semibold">No automation rules yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first rule to automate repetitive tasks</p>
              </div>
              <Button onClick={() => { setEditTarget(null); setShowForm(true) }} className="gap-2">
                <Plus className="h-4 w-4" /> Create First Rule
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rules.map(rule => (
                <RuleCard key={rule.id} rule={rule} onEdit={r => { setEditTarget(r); setShowForm(true) }} />
              ))}
            </div>
          )}

          {/* Rule Type reference */}
          {rules.length > 0 && (
            <div className="rounded-xl border bg-muted/30 p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" /> Available Rule Types
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {(Object.entries(RULE_TYPE_META) as [AutomationRuleType, typeof RULE_TYPE_META[AutomationRuleType]][]).map(([type, meta]) => {
                  const Icon = meta.icon
                  return (
                    <div key={type} className="flex items-center gap-3 p-3 rounded-lg border bg-background">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient}`}>
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Logs Panel ── */}
      {logTab === 'logs' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Execution History
            </CardTitle>
            <CardDescription>All automation rule runs — most recent first</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {logsLoading ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading logs...
              </div>
            ) : allLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
                <Clock className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No execution history yet. Run a rule to see logs here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {allLogs.map(log => <LogRow key={log.id} log={log} />)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Form Dialog ── */}
      {showForm && (
        <RuleFormDialog
          open={showForm}
          mode={editTarget ? 'edit' : 'create'}
          rule={editTarget || undefined}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}
    </div>
  )
}
