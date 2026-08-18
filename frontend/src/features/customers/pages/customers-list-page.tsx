import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Eye, RefreshCw } from 'lucide-react'
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
  const { data, isLoading, refetch, isFetching } = useCustomers(search ? { search } : undefined)
  const { mutate: deleteCustomer } = useDeleteCustomer()

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }) => {
        const c = row.original as any
        const displayName = c.name || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.companyName || 'Customer'
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{displayName}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.phone || 'N/A'}</span>
      ),
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

  const rawCustomers = Array.isArray(data) 
    ? data 
    : ((data as any)?.data && Array.isArray((data as any).data) ? (data as any).data : [])

  const customers: Customer[] = rawCustomers.map((c: any) => {
    const computedName = c.name || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.companyName || 'Customer'
    return {
      ...c,
      name: computedName,
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      email: c.email || '',
      phone: c.phone || '',
      creditLimit: Number(c.creditLimit) || 0,
      loyaltyPoints: Number(c.loyaltyPoints) || 0,
      isActive: c.isActive ?? true,
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link to="/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>
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
