import { useState } from 'react'
import { Eye, Trash2, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { Sale } from '@/types'
import { useSales, useDeleteSale } from '../hooks/use-sales'
import { formatCurrency, formatDate } from '@/utils/format'

export function SalesListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useSales({ search })
  const { mutate: deleteSale } = useDeleteSale()

  const columns: ColumnDef<Sale>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }) => (
        <span className="font-mono">{row.original.invoiceNumber || `INV-${row.original.id.slice(0, 8)}`}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      cell: ({ row }) => row.original.customer?.name || 'Walk-in Customer',
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => row.original.items?.length || 0,
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.total)}</span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.paymentMethod?.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.paymentStatus
        return (
          <Badge
            variant={
              status === 'paid'
                ? 'success'
                : status === 'pending'
                ? 'warning'
                : 'secondary'
            }
          >
            {status?.toUpperCase()}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/sales/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Are you sure you want to delete this sale?')) {
                deleteSale(row.original.id)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const sales = Array.isArray(data) ? data : (data?.data || [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">View all sales transactions</p>
        </div>
        <Button asChild>
          <Link to="/sales/pos">
            <ShoppingBag className="mr-2 h-4 w-4" />
            New Sale
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading sales...</div>
        </div>
      ) : sales.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No sales found"
          description="Start by creating your first sale"
          action={{
            label: 'New Sale',
            onClick: () => window.location.href = '/sales/pos',
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={sales}
          searchKey="invoiceNumber"
          searchPlaceholder="Search sales..."
        />
      )}
    </div>
  )
}
