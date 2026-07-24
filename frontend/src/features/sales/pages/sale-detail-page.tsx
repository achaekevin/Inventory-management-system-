import { useParams, useNavigate, Link } from 'react-router'
import {
  ArrowLeft, ShoppingBag, User, Calendar, CreditCard,
  Package, Hash, DollarSign, Loader2, Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useSale } from '../hooks/use-sales'
import { DocumentPanel } from '@/features/documents/components/document-panel'
import { formatCurrency, formatDate } from '@/utils/format'

// ─── Status badge ─────────────────────────────────────────────────────────────

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-green-500/10 text-green-700 border-green-200',
    pending: 'bg-amber-500/10 text-amber-700 border-amber-200',
    partial: 'bg-blue-500/10 text-blue-700 border-blue-200',
    overdue: 'bg-red-500/10 text-red-700 border-red-200',
  }
  return (
    <Badge className={`text-xs border ${map[status] || 'bg-gray-500/10 text-gray-600 border-gray-200'}`}>
      {status?.toUpperCase()}
    </Badge>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: sale, isLoading } = useSale(id || '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading sale details…
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Sale not found</p>
        <Button variant="outline" onClick={() => navigate('/sales')}>Back to Sales</Button>
      </div>
    )
  }

  const invoiceNumber = (sale as any).invoiceNumber || `INV-${sale.id.slice(0, 8).toUpperCase()}`
  const customer = (sale as any).customer
  const items: any[] = (sale as any).items || []
  const total = (sale as any).total || 0
  const subtotal = (sale as any).subtotal || total
  const tax = (sale as any).tax || 0
  const discount = (sale as any).discount || 0
  const paymentMethod = (sale as any).paymentMethod
  const paymentStatus = (sale as any).paymentStatus || 'paid'
  const notes = (sale as any).notes

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/sales')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{invoiceNumber}</h1>
              <PaymentStatusBadge status={paymentStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate((sale as any).createdAt)}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left: Items + Totals ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground px-6 pb-4">No items recorded.</p>
              ) : (
                <div className="divide-y">
                  {items.map((item: any, i: number) => (
                    <div key={item.id || i} className="flex items-center justify-between px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product?.name || item.productName || 'Unknown Product'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold ml-4">
                        {formatCurrency(item.total || item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="border-t px-6 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">−{formatCurrency(discount)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: Customer + Payment info ── */}
        <div className="space-y-4">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {customer ? (
                <>
                  <p className="font-medium text-sm">{customer.name || `${customer.firstName} ${customer.lastName}`}</p>
                  {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
                  {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">Walk-in customer</p>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Method</span>
                <Badge variant="outline" className="text-xs capitalize">{paymentMethod || 'Cash'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <PaymentStatusBadge status={paymentStatus} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Sale meta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Invoice #</span>
                <span className="text-xs font-mono font-medium">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Sale ID</span>
                <span className="text-xs font-mono">{id?.slice(0, 12)}…</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Date</span>
                <span className="text-xs">{formatDate((sale as any).createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Documents Panel ── */}
      {id && (
        <DocumentPanel
          entityType="sale"
          entityId={id}
          entityLabel="Sale Order"
        />
      )}
    </div>
  )
}
