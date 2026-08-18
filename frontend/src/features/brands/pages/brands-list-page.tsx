import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { Brand } from '@/types'
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '../hooks/use-brands'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

type BrandFormData = z.infer<typeof brandSchema>

export function BrandsListPage() {
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  const { data, isLoading } = useBrands({ search })
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand()
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand()
  const { mutate: deleteBrand } = useDeleteBrand()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      isActive: true,
    },
  })

  const onSubmit = (data: BrandFormData) => {
    if (editingBrand) {
      updateBrand(
        { id: editingBrand.id, ...data },
        {
          onSuccess: () => {
            setIsDialogOpen(false)
            setEditingBrand(null)
            reset()
          },
        }
      )
    } else {
      createBrand(data, {
        onSuccess: () => {
          setIsDialogOpen(false)
          reset()
        },
      })
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    reset(brand)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingBrand(null)
    reset({ name: '', description: '', isActive: true })
    setIsDialogOpen(true)
  }

  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: 'name',
      header: 'Brand Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description || '-',
    },
    {
      accessorKey: 'productsCount',
      header: 'Products',
      cell: ({ row }) => row.original.productsCount || 0,
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
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Are you sure you want to delete this brand?')) {
                deleteBrand(row.original.id)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const brands = Array.isArray(data) ? data : (data?.data || [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">Manage product brands</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? 'Edit Brand' : 'Add Brand'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter brand name"
                  disabled={isCreating || isUpdating}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter description"
                  disabled={isCreating || isUpdating}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  disabled={isCreating || isUpdating}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Saving...' : editingBrand ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating || isUpdating}
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
          <div className="text-muted-foreground">Loading brands...</div>
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No brands found"
          description="Get started by adding your first brand"
          action={{
            label: 'Add Brand',
            onClick: handleAdd,
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={brands}
          searchKey="name"
          searchPlaceholder="Search brands..."
        />
      )}
    </div>
  )
}
