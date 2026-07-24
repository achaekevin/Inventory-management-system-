import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupplier, useCreateSupplier, useUpdateSupplier } from '../hooks/use-suppliers'
import { DocumentPanel } from '@/features/documents/components/document-panel'

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.string().optional(),
  isActive: z.boolean().default(true),
})

type SupplierFormData = z.infer<typeof supplierSchema>

export function SupplierFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: supplier, isLoading } = useSupplier(id || '')
  const { mutate: createSupplier, isPending: isCreating } = useCreateSupplier()
  const { mutate: updateSupplier, isPending: isUpdating } = useUpdateSupplier()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier || {
      isActive: true,
    },
  })

  const onSubmit = (data: SupplierFormData) => {
    if (isEdit && id) {
      updateSupplier(
        { id, ...data },
        { onSuccess: () => navigate('/suppliers') }
      )
    } else {
      createSupplier(data, { onSuccess: () => navigate('/suppliers') })
    }
  }

  const isPending = isCreating || isUpdating

  if (isLoading && isEdit) {
    return <div className="p-6">Loading supplier...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/suppliers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Edit Supplier' : 'Add Supplier'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update supplier information' : 'Create a new supplier'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter supplier name"
                  disabled={isPending}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter email"
                  disabled={isPending}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="Enter phone number"
                  disabled={isPending}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  {...register('taxId')}
                  placeholder="Enter tax ID"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Enter address"
                disabled={isPending}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Enter city"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('country')}
                  placeholder="Enter country"
                  disabled={isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  {...register('creditLimit', { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  {...register('paymentTerms')}
                  placeholder="e.g., Net 30"
                  disabled={isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Saving...' : isEdit ? 'Update Supplier' : 'Create Supplier'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/suppliers')}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>

      {isEdit && id && (
        <DocumentPanel entityType="supplier" entityId={id} />
      )}
    </div>
  )
}
