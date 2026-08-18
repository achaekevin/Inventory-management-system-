import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Plus, 
  Search, 
  RefreshCw, 
  DollarSign, 
  Smartphone, 
  Building2, 
  Banknote, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Filter,
  Ban
} from 'lucide-react'
import paymentService, { PaymentItem, PaymentSummary } from '../services/payment-service'
import { formatCurrency, formatDateTime } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function PaymentsListPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Modal State for Recording New Payment
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saleId, setSaleId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('mpesa')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')
  const [modalSuccess, setModalSuccess] = useState('')

  // Load Payments and Summary
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [listRes, summaryRes] = await Promise.all([
        paymentService.getPayments({
          search: searchQuery || undefined,
          method: selectedMethod !== 'all' ? selectedMethod : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }),
        paymentService.getPaymentSummary(),
      ])

      setPayments(Array.isArray(listRes.data) ? listRes.data : ((listRes.data as any)?.data || []))
      setSummary(summaryRes)
    } catch (err) {
      console.error('Failed to load payment data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMethod, selectedStatus])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData()
  }

  // Handle Recording New Payment
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    setModalSuccess('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setModalError('Please enter a valid positive payment amount.')
      return
    }

    setIsSubmitting(true)

    try {
      await paymentService.createPayment({
        saleId: saleId ? saleId.trim() : undefined,
        amount: numAmount,
        method,
        reference: reference ? reference.trim() : undefined,
        notes: notes ? notes.trim() : undefined,
      })

      setModalSuccess('Payment recorded successfully!')
      setAmount('')
      setSaleId('')
      setReference('')
      setNotes('')
      fetchData()

      setTimeout(() => {
        setIsModalOpen(false)
        setModalSuccess('')
      }, 1200)
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to record payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Voiding Payment
  const handleVoidPayment = async (id: string) => {
    if (!confirm('Are you sure you want to void this payment transaction?')) return

    try {
      await paymentService.voidPayment(id)
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to void payment.')
    }
  }

  // Helper for Payment Method Badges
  const getMethodBadge = (methodStr: string) => {
    const m = methodStr.toLowerCase()
    switch (m) {
      case 'mpesa':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
            <Smartphone className="h-3 w-3" /> M-Pesa
          </Badge>
        )
      case 'cash':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
            <Banknote className="h-3 w-3" /> Cash
          </Badge>
        )
      case 'bank_transfer':
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700 text-white gap-1">
            <Building2 className="h-3 w-3" /> Bank Transfer
          </Badge>
        )
      case 'card':
        return (
          <Badge className="bg-amber-600 hover:bg-amber-700 text-white gap-1">
            <CreditCard className="h-3 w-3" /> Card
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="capitalize">
            {m.replace('_', ' ')}
          </Badge>
        )
    }
  }

  const getStatusBadge = (statusStr: string) => {
    const s = statusStr.toLowerCase()
    if (s === 'completed') {
      return (
        <Badge variant="outline" className="border-green-500 text-green-600 gap-1 bg-green-50">
          <CheckCircle2 className="h-3 w-3" /> Completed
        </Badge>
      )
    }
    if (s === 'failed') {
      return (
        <Badge variant="outline" className="border-red-500 text-red-600 gap-1 bg-red-50">
          <XCircle className="h-3 w-3" /> Voided / Failed
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1 bg-amber-50">
        <AlertCircle className="h-3 w-3" /> Pending
      </Badge>
    )
  }

  const mpesaSummary = summary?.byMethod.find((m) => m.method.toLowerCase() === 'mpesa')
  const cashSummary = summary?.byMethod.find((m) => m.method.toLowerCase() === 'cash')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments Management</h1>
          <p className="text-muted-foreground">
            Track customer payments, M-Pesa transactions, cash, and bank transfers in Kenyan Shillings.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-gradient-to-r from-primary to-purple-600">
          <Plus className="h-4 w-4" /> Record Payment
        </Button>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Collected</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(summary?.totalAmount || 0)}
            </p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-green-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Completed Transactions</p>
            <p className="text-2xl font-bold text-foreground">{summary?.totalCount || 0}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <FileText className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">M-Pesa Volume</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(mpesaSummary?.amount || 0)}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600">
            <Smartphone className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Cash Volume</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(cashSummary?.amount || 0)}
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-600">
            <Banknote className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reference code, invoice #, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="w-[180px]">
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger>
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[160px]">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed / Voided</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" variant="secondary" size="icon" title="Apply Filter">
            <Search className="h-4 w-4" />
          </Button>

          <Button type="button" onClick={fetchData} variant="outline" size="icon" title="Refresh Data">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </form>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Showing recent transaction records from sales orders and POS checkouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reference / Code</TableHead>
                  <TableHead>Invoice / Sale #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount (KSh)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading payments data...
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No payment records found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => {
                    const customerName = payment.sale?.customer
                      ? `${payment.sale.customer.firstName} ${payment.sale.customer.lastName}`
                      : 'Walk-in Customer'

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="text-xs font-medium">
                          {formatDateTime(payment.createdAt)}
                        </TableCell>

                        <TableCell className="font-mono text-xs font-semibold">
                          {payment.reference || payment.id.slice(0, 8).toUpperCase()}
                        </TableCell>

                        <TableCell className="text-sm font-medium">
                          {payment.sale?.invoiceNumber || payment.sale?.saleNumber || 'Direct Payment'}
                        </TableCell>

                        <TableCell className="text-sm">
                          {customerName}
                        </TableCell>

                        <TableCell>
                          {getMethodBadge(payment.method)}
                        </TableCell>

                        <TableCell className="text-right font-bold text-sm">
                          {formatCurrency(payment.amount)}
                        </TableCell>

                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>

                        <TableCell className="text-right">
                          {payment.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVoidPayment(payment.id)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                              title="Void Payment"
                            >
                              <Ban className="h-3.5 w-3.5 mr-1" /> Void
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Record Payment Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
            <DialogDescription>
              Enter payment transaction details to update customer balances and order status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePayment} className="space-y-4 py-2">
            {modalSuccess && (
              <div className="flex items-center gap-2 p-3 text-sm bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Amount (KSh)</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                placeholder="e.g. 5000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentRef">Transaction / Ref Code</Label>
              <Input
                id="paymentRef"
                placeholder="e.g. QGH8912345 (M-Pesa or Cheque #)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saleId">Sale / Invoice ID (Optional)</Label>
              <Input
                id="saleId"
                placeholder="Leave blank if direct receipt"
                value={saleId}
                onChange={(e) => setSaleId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Notes (Optional)</Label>
              <Input
                id="paymentNotes"
                placeholder="Additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-purple-600">
                {isSubmitting ? 'Recording...' : 'Submit Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
