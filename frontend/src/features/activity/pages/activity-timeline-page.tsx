import { useState, useEffect, useCallback } from 'react'
import {
  History,
  Search,
  Filter,
  Calendar,
  User,
  Package,
  ShoppingCart,
  Building2,
  Lock,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { activityApi, TimelineEvent } from '@/features/activity/api/activity-service'
import { cn } from '@/lib/utils'

export function ActivityTimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Filters
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalResults: 0,
  })

  // Selected event for diff modal
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await activityApi.getTimeline({
        module: selectedModule !== 'all' ? selectedModule : undefined,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 15,
      })

      if (res.success && res.data) {
        setEvents(res.data)
        if (res.pagination) {
          setPagination({
            page: res.pagination.page,
            limit: res.pagination.limit,
            totalPages: res.pagination.totalPages,
            totalResults: res.pagination.totalResults,
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch activity timeline events:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedModule, search, startDate, endDate, page])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const getModuleIcon = (moduleName: string) => {
    const m = moduleName.toLowerCase()
    if (m.includes('product')) return <Package className="h-4 w-4 text-blue-500" />
    if (m.includes('sale')) return <ShoppingCart className="h-4 w-4 text-emerald-500" />
    if (m.includes('purchase')) return <FileText className="h-4 w-4 text-purple-500" />
    if (m.includes('inventory')) return <Building2 className="h-4 w-4 text-amber-500" />
    if (m.includes('security') || m.includes('auth')) return <Lock className="h-4 w-4 text-rose-500" />
    return <History className="h-4 w-4 text-indigo-500" />
  }

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="text-[10px]">Critical</Badge>
      case 'warning':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Warning</Badge>
      default:
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Info</Badge>
    }
  }

  const modules = [
    { id: 'all', label: 'All Events' },
    { id: 'Products', label: 'Products' },
    { id: 'Sales', label: 'Sales' },
    { id: 'Purchases', label: 'Purchases' },
    { id: 'Inventory', label: 'Inventory' },
    { id: 'Security', label: 'Security' },
  ]

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          <History className="h-7 w-7 text-indigo-500" />
          Activity Timeline
        </h1>
        <p className="text-sm text-muted-foreground">
          Chronological audit trail of all system events, inventory changes, sales, and user actions.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search action, user, details..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
                className="h-9 text-xs"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(1)
                }}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Module Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t pt-3">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModule(m.id)
                  setPage(1)
                }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  selectedModule === m.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm">Loading activity timeline...</p>
          </div>
        ) : events.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent className="flex flex-col items-center gap-2">
              <History className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-semibold">No activity logs found</p>
              <p className="text-xs text-muted-foreground">
                Try clearing search parameters or adjusting date filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative border-l-2 border-muted ml-4 pl-6 space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative group">
                {/* Icon Marker on Line */}
                <div className="absolute -left-[35px] top-1 rounded-full border bg-background p-1.5 shadow-sm group-hover:border-primary transition-colors">
                  {getModuleIcon(event.module)}
                </div>

                {/* Event Card */}
                <Card className="shadow-xs hover:shadow-md transition-all border-muted/80">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[11px] font-mono font-semibold">
                          {event.module}
                        </Badge>
                        <h4 className="font-semibold text-sm tracking-tight">{event.action}</h4>
                        {getSeverityBadge(event.severity)}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    {event.details && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {event.details}
                      </p>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{event.userName}</span>
                        <span>({event.userEmail})</span>
                      </div>

                      {(event.oldValues || event.newValues) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                          className="h-7 px-2 text-xs text-primary gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Diff
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Showing page <span className="font-medium text-foreground">{pagination.page}</span> of{' '}
              <span className="font-medium text-foreground">{pagination.totalPages}</span> ({pagination.totalResults} events)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage(page - 1)}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || isLoading}
                onClick={() => setPage(page + 1)}
                className="h-8 gap-1 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Diff Inspector Modal */}
      {selectedEvent && (
        <Dialog open={Boolean(selectedEvent)} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Audit Log Details & Diff Inspection
              </DialogTitle>
              <DialogDescription className="text-xs">
                Review exact state changes for Action: <strong>{selectedEvent.action}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 border p-3 rounded-lg bg-muted/20">
                <div>
                  <span className="text-muted-foreground">Module:</span>{' '}
                  <strong className="text-foreground">{selectedEvent.module}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">User:</span>{' '}
                  <strong className="text-foreground">{selectedEvent.userName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Entity Type:</span>{' '}
                  <strong className="text-foreground">{selectedEvent.entityType || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>{' '}
                  <strong className="text-foreground">{new Date(selectedEvent.timestamp).toLocaleString()}</strong>
                </div>
              </div>

              {selectedEvent.oldValues && (
                <div className="space-y-1">
                  <label className="font-semibold text-rose-600 dark:text-rose-400 block">Previous Values (Before):</label>
                  <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(selectedEvent.oldValues, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEvent.newValues && (
                <div className="space-y-1">
                  <label className="font-semibold text-emerald-600 dark:text-emerald-400 block">New Values (After):</label>
                  <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(selectedEvent.newValues, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
