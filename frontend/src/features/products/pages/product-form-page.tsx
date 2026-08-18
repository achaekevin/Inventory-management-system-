import { useEffect } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/use-products'
import { useCategories } from '@/features/categories/hooks/use-categories'
import { useBrands } from '@/features/brands/hooks/use-brands'
import { useUnits } from '@/features/units/hooks/use-units'
import { DocumentPanel } from '@/features/documents/components/document-panel'
import { toast } from 'sonner'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  unitId: z.string().min(1, 'Unit is required'),
  price: z.number().min(0, 'Price must be positive'),
  cost: z.number().min(0, 'Cost must be positive'),
  minStock: z.number().min(0, 'Minimum stock must be positive').default(0),
  reorderLevel: z.number().min(0, 'Reorder level must be positive').default(0),
  taxable: z.boolean().default(true),
  trackInventory: z.boolean().default(true),
})

type ProductFormData = z.infer<typeof productSchema>

export function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: product, isLoading } = useProduct(id || '')
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()

  const { data: categoriesData } = useCategories()
  const { data: brandsData } = useBrands()
  const { data: unitsData } = useUnits()

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || [])
  const brands = Array.isArray(brandsData) ? brandsData : (brandsData?.data || [])
  const units = Array.isArray(unitsData) ? unitsData : (unitsData?.data || [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      description: '',
      categoryId: '',
      brandId: '',
      unitId: '',
      price: 0,
      cost: 0,
      minStock: 0,
      reorderLevel: 0,
      taxable: true,
      trackInventory: true,
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        description: product.description || '',
        categoryId: product.categoryId || (categories[0]?.id || ''),
        brandId: product.brandId || '',
        unitId: product.unitId || (units[0]?.id || ''),
        price: Number(product.price) || 0,
        cost: Number(product.cost) || 0,
        minStock: Number(product.minStock) || 0,
        reorderLevel: Number(product.reorderLevel) || 0,
        taxable: product.taxable ?? true,
        trackInventory: product.trackInventory ?? true,
      })
    } else if (!isEdit) {
      if (categories.length > 0 && !watch('categoryId')) {
        setValue('categoryId', categories[0].id)
      }
      if (units.length > 0 && !watch('unitId')) {
        setValue('unitId', units[0].id)
      }
    }
  }, [product, categories, units, isEdit, reset, setValue, watch])

  const selectedCategory = watch('categoryId')
  const selectedBrand = watch('brandId')
  const selectedUnit = watch('unitId')

  const onSubmit = (data: ProductFormData) => {
    // If SKU is empty, auto-generate a fallback SKU
    const finalData = {
      ...data,
      sku: data.sku && data.sku.trim() !== '' ? data.sku.trim() : `PRD-${Date.now().toString().slice(-6)}`,
      categoryId: data.categoryId || (categories[0]?.id || 'General'),
      unitId: data.unitId || (units[0]?.id || 'PCS'),
    }

    if (isEdit && id) {
      updateProduct(
        { id, ...finalData },
        {
          onSuccess: () => {
            toast.success('Product updated successfully!')
            navigate('/products')
          },
          onError: (err: any) => {
            toast.error(err.message || 'Failed to update product')
          },
        }
      )
    } else {
      createProduct(finalData, {
        onSuccess: () => {
          toast.success('Product created and saved to database!')
          navigate('/products')
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to create product')
        },
      })
    }
  }

  const isPending = isCreating || isUpdating

  if (isLoading && isEdit) {
    return <div className="p-6">Loading product...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update product information' : 'Create a new product and persist in database'}
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
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter product name"
                  disabled={isPending}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Auto-generated if blank)</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="e.g. PRD-10023"
                  disabled={isPending}
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  {...register('barcode')}
                  placeholder="Enter barcode / QR code"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                {categories.length > 0 ? (
                  <Select
                    value={selectedCategory || categories[0]?.id}
                    onValueChange={(val) => setValue('categoryId', val)}
                    disabled={isPending}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="categoryId"
                    {...register('categoryId')}
                    placeholder="General / Category Name"
                    disabled={isPending}
                  />
                )}
                {errors.categoryId && (
                  <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandId">Brand (Optional)</Label>
                {brands.length > 0 ? (
                  <Select
                    value={selectedBrand || ''}
                    onValueChange={(val) => setValue('brandId', val === 'none' ? '' : val)}
                    disabled={isPending}
                  >
                    <SelectTrigger id="brandId">
                      <SelectValue placeholder="Select brand (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / Generic</SelectItem>
                      {brands.map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="brandId"
                    {...register('brandId')}
                    placeholder="Brand name (optional)"
                    disabled={isPending}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitId">Unit of Measure *</Label>
                {units.length > 0 ? (
                  <Select
                    value={selectedUnit || units[0]?.id}
                    onValueChange={(val) => setValue('unitId', val)}
                    disabled={isPending}
                  >
                    <SelectTrigger id="unitId">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.shortName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="unitId"
                    {...register('unitId')}
                    placeholder="PCS / Piece / Box / KG"
                    disabled={isPending}
                  />
                )}
                {errors.unitId && (
                  <p className="text-sm text-destructive">{errors.unitId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter product description"
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="price">Sale Price (KSh) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={isPending}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Cost Price (KSh) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  {...register('cost', { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={isPending}
                />
                {errors.cost && (
                  <p className="text-sm text-destructive">{errors.cost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock *</Label>
                <Input
                  id="minStock"
                  type="number"
                  {...register('minStock', { valueAsNumber: true })}
                  placeholder="0"
                  disabled={isPending}
                />
                {errors.minStock && (
                  <p className="text-sm text-destructive">{errors.minStock.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level *</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  {...register('reorderLevel', { valueAsNumber: true })}
                  placeholder="0"
                  disabled={isPending}
                />
                {errors.reorderLevel && (
                  <p className="text-sm text-destructive">{errors.reorderLevel.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending} className="px-8">
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Saving to database...' : isEdit ? 'Update Product' : 'Save Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/products')}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Documents & Attachments — only shown when editing an existing product */}
      {isEdit && id && (
        <DocumentPanel entityType="product" entityId={id} />
      )}
    </div>
  )
}
