import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Eye } from 'lucide-react'
import { Link } from 'react-router'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { Customer } from '@/types'
import { useCustomers, useDeleteCustomer } from '../hooks/use-customers'
import { formatCurrency } from '@/utils/format'

export function CustomersListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useCustomers({ search })
  const { mutate: deleteCustomer } = useDeleteCustomer()

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'totalPurchases',
      header: 'Total Purchases',
      cell: ({ row }) => formatCurrency(row.original.totalPurchases || 0),
    },
    {
      accessorKey: 'loyaltyPoints',
      header: 'Loyalty Points',
      cell: ({ row }) => row.original.loyaltyPoints || 0,
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
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/customers/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/customers/${row.original.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Are you sure you want to delete this customer?')) {
                deleteCustomer(row.original.id)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const customers = Array.isArray(data) ? data : (data?.data || [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customers</p>
        </div>
        <Button asChild>
          <Link to="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading customers...</div>
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="Get started by adding your first customer"
          action={{
            label: 'Add Customer',
            onClick: () => window.location.href = '/customers/new',
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          searchKey="name"
          searchPlaceholder="Search customers..."
        />
      )}
    </div>
  )
}
