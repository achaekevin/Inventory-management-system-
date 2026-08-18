import { useState } from 'react'
import { ArrowUpDown, Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { StockMovement } from '@/types'
import { useStockMovements, useCreateAdjustment } from '../hooks/use-inventory'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDate } from '@/utils/format'

const adjustmentSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  quantity: z.number().min(1, 'Quantity must be positive'),
  type: z.enum(['adjustment', 'transfer', 'damage', 'return']),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

type AdjustmentFormData = z.infer<typeof adjustmentSchema>

export function StockMovementsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data, isLoading } = useStockMovements()
  const { mutate: createAdjustment, isPending } = useCreateAdjustment()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
  })

  const onSubmit = (data: AdjustmentFormData) => {
    createAdjustment(data, {
      onSuccess: () => {
        setIsDialogOpen(false)
        reset()
      },
    })
  }

  const columns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: 'product.name',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.product?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.product?.sku}</div>
        </div>
      ),
    },
    {
      accessorKey: 'warehouse.name',
      header: 'Warehouse',
      cell: ({ row }) => row.original.warehouse?.name || '-',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type?.charAt(0).toUpperCase() + row.original.type?.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        const quantity = row.original.quantity || 0
        const isPositive = quantity > 0
        
        return (
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}{quantity}
          </span>
        )
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => row.original.reason || '-',
    },
  ]

  const movements = Array.isArray(data) ? data : (data?.data || [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
          <p className="text-muted-foreground">Track all inventory transactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Stock Adjustment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID *</Label>
                <Input
                  id="productId"
                  {...register('productId')}
                  placeholder="Enter product ID"
                  disabled={isPending}
                />
                {errors.productId && (
                  <p className="text-sm text-destructive">{errors.productId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouseId">Warehouse ID *</Label>
                <Input
                  id="warehouseId"
                  {...register('warehouseId')}
                  placeholder="Enter warehouse ID"
                  disabled={isPending}
                />
                {errors.warehouseId && (
                  <p className="text-sm text-destructive">{errors.warehouseId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Input
                  id="type"
                  {...register('type')}
                  placeholder="adjustment, transfer, damage, or return"
                  disabled={isPending}
                />
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="0"
                  disabled={isPending}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  {...register('reason')}
                  placeholder="Enter reason"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Additional notes"
                  disabled={isPending}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creating...' : 'Create Adjustment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading movements...</div>
        </div>
      ) : movements.length === 0 ? (
        <EmptyState
          icon={ArrowUpDown}
          title="No stock movements found"
          description="Inventory transactions will appear here"
        />
      ) : (
        <DataTable
          columns={columns}
          data={movements}
          searchKey="product.name"
          searchPlaceholder="Search movements..."
        />
      )}
    </div>
  )
}
