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
import { useCustomer, useCreateCustomer, useUpdateCustomer } from '../hooks/use-customers'
import { DocumentPanel } from '@/features/documents/components/document-panel'

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  loyaltyPoints: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
})

type CustomerFormData = z.infer<typeof customerSchema>

export function CustomerFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: customer, isLoading } = useCustomer(id || '')
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer()
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      isActive: true,
      loyaltyPoints: 0,
    },
  })

  const onSubmit = (data: CustomerFormData) => {
    if (isEdit && id) {
      updateCustomer(
        { id, ...data },
        { onSuccess: () => navigate('/customers') }
      )
    } else {
      createCustomer(data, { onSuccess: () => navigate('/customers') })
    }
  }

  const isPending = isCreating || isUpdating

  if (isLoading && isEdit) {
    return <div className="p-6">Loading customer...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Edit Customer' : 'Add Customer'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update customer information' : 'Create a new customer'}
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
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter customer name"
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
                <Label htmlFor="loyaltyPoints">Loyalty Points</Label>
                <Input
                  id="loyaltyPoints"
                  type="number"
                  {...register('loyaltyPoints', { valueAsNumber: true })}
                  placeholder="0"
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
            <CardTitle>Credit Information</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/customers')}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>

      {isEdit && id && (
        <DocumentPanel entityType="customer" entityId={id} />
      )}
    </div>
  )
}
