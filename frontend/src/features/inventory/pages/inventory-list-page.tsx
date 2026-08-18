import { useState } from 'react'
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { InventoryItem } from '@/types'
import { useInventory, useLowStockItems } from '../hooks/use-inventory'
import { formatNumber } from '@/utils/format'

export function InventoryListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useInventory({ search })
  const { data: lowStockItems } = useLowStockItems()

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'product.name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.product?.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.product?.sku}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'warehouse.name',
      header: 'Warehouse',
      cell: ({ row }) => row.original.warehouse?.name || '-',
    },
    {
      accessorKey: 'quantity',
      header: 'Stock Level',
      cell: ({ row }) => {
        const quantity = row.original.quantity || 0
        const minStock = row.original.product?.minStock || 0
        const isLow = quantity <= minStock
        
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'text-destructive font-medium' : ''}>
              {formatNumber(quantity)}
            </span>
            {isLow && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </div>
        )
      },
    },
    {
      accessorKey: 'product.minStock',
      header: 'Min Stock',
      cell: ({ row }) => formatNumber(row.original.product?.minStock || 0),
    },
    {
      accessorKey: 'value',
      header: 'Stock Value',
      cell: ({ row }) => {
        const quantity = row.original.quantity || 0
        const cost = row.original.product?.cost || 0
        return `$${formatNumber(quantity * cost)}`
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const quantity = row.original.quantity || 0
        const minStock = row.original.product?.minStock || 0
        
        if (quantity === 0) {
          return <Badge variant="destructive">Out of Stock</Badge>
        } else if (quantity <= minStock) {
          return <Badge variant="warning">Low Stock</Badge>
        } else {
          return <Badge variant="success">In Stock</Badge>
        }
      },
    },
  ]

  const inventory = Array.isArray(data) ? data : (data?.data || [])
  const totalValue = inventory.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.product?.cost || 0)
  }, 0)

  const totalProducts = inventory.length
  const lowStockCount = lowStockItems?.length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Monitor and manage your stock levels</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatNumber(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading inventory...</div>
        </div>
      ) : inventory.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory items found"
          description="Start by adding products to your inventory"
        />
      ) : (
        <DataTable
          columns={columns}
          data={inventory}
          searchKey="product.name"
          searchPlaceholder="Search products..."
        />
      )}
    </div>
  )
}
