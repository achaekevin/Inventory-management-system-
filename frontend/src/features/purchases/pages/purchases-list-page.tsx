import { useState } from 'react'
import { Plus, Eye, Trash2, CheckCircle, Package } from 'lucide-react'
import { Link } from 'react-router'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { Purchase } from '@/types'
import { usePurchases, useDeletePurchase, useApprovePurchase, useReceivePurchase } from '../hooks/use-purchases'
import { formatCurrency, formatDate } from '@/utils/format'

export function PurchasesListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = usePurchases({ search })
  const { mutate: deletePurchase } = useDeletePurchase()
  const { mutate: approvePurchase } = useApprovePurchase()
  const { mutate: receivePurchase } = useReceivePurchase()

  const columns: ColumnDef<Purchase>[] = [
    {
      accessorKey: 'purchaseNumber',
      header: 'PO Number',
      cell: ({ row }) => (
        <span className="font-mono">{row.original.purchaseNumber || `PO-${row.original.id.slice(0, 8)}`}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: 'supplier.name',
      header: 'Supplier',
      cell: ({ row }) => row.original.supplier?.name || '-',
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variants: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
          draft: 'secondary',
          pending: 'warning',
          approved: 'default',
          received: 'success',
          cancelled: 'destructive',
        }
        return (
          <Badge variant={variants[status || 'draft']}>
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
            <Link to={`/purchases/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {row.original.status === 'pending' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => approvePurchase(row.original.id)}
              title="Approve"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {row.original.status === 'approved' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => receivePurchase(row.original.id)}
              title="Receive Goods"
            >
              <Package className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Are you sure you want to delete this purchase order?')) {
                deletePurchase(row.original.id)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const purchases = Array.isArray(data) ? data : (data?.data || [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage supplier purchase orders</p>
        </div>
        <Button asChild>
          <Link to="/purchases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading purchases...</div>
        </div>
      ) : purchases.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No purchase orders found"
          description="Create your first purchase order"
          action={{
            label: 'New Purchase Order',
            onClick: () => window.location.href = '/purchases/new',
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={purchases}
          searchKey="purchaseNumber"
          searchPlaceholder="Search purchases..."
        />
      )}
    </div>
  )
}
