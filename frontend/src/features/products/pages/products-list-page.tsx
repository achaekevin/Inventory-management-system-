import { useState } from 'react'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { Link } from 'react-router'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { Product } from '@/types'
import { useProducts, useDeleteProduct } from '../hooks/use-products'
import { formatCurrency } from '@/utils/format'

export function ProductsListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useProducts({ search })
  const { mutate: deleteProduct } = useDeleteProduct()

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
            {row.original.images?.[0] ? (
              <img 
                src={row.original.images[0]} 
                alt={row.original.name}
                className="h-full w-full object-cover rounded"
              />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name || '-',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link to={`/products/${row.original.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Are you sure you want to delete this product?')) {
                deleteProduct(row.original.id)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading products...</div>
      </div>
    )
  }

  const products = Array.isArray(data) ? data : (data?.data || [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory
          </p>
        </div>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Get started by adding your first product"
          action={{
            label: 'Add Product',
            onClick: () => window.location.href = '/products/new',
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Search products..."
        />
      )}
    </div>
  )
}
