import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Plus, Trash2, Save, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import { useProducts } from '@/features/products/hooks/use-products'
import { useCreatePurchase, usePurchase } from '../hooks/use-purchases'
import { formatCurrency } from '@/utils/format'
import { toast } from 'sonner'

interface PurchaseOrderItem {
  productId: string
  quantity: number
  cost: number
}

export function PurchaseFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: suppliersData } = useSuppliers()
  const { data: productsData } = useProducts()
  const { mutate: createPurchase, isPending: isCreating } = useCreatePurchase()
  const { data: existingPurchase, isLoading } = usePurchase(id || '')

  const rawSuppliers = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.data || [])
  const rawProducts = Array.isArray(productsData) ? productsData : (productsData?.data || [])

  const [supplierId, setSupplierId] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { productId: '', quantity: 1, cost: 0 },
  ])

  useEffect(() => {
    if (rawSuppliers.length > 0 && !supplierId) {
      setSupplierId(rawSuppliers[0].id)
    }
  }, [rawSuppliers, supplierId])

  useEffect(() => {
    if (existingPurchase) {
      setSupplierId(existingPurchase.supplierId || '')
      setDiscount(Number(existingPurchase.discount) || 0)
      setShipping(Number(existingPurchase.shipping) || 0)
      setNotes(existingPurchase.notes || '')
      if (existingPurchase.items && existingPurchase.items.length > 0) {
        setItems(
          existingPurchase.items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            cost: Number(i.unitPrice || i.cost || 0),
          }))
        )
      }
    }
  }, [existingPurchase])

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1, cost: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('Purchase order must have at least one item')
      return
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      // If product changed, autofill default cost
      if (field === 'productId') {
        const prod = rawProducts.find((p: any) => p.id === value)
        if (prod) {
          updated[index].cost = Number(prod.cost) || 0
        }
      }
      return updated
    })
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0)
  const tax = subtotal * 0.1 // 10% standard tax
  const total = Math.max(0, subtotal - discount + shipping + tax)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplierId) {
      toast.error('Please select a supplier')
      return
    }

    const validItems = items.filter((i) => i.productId && i.quantity > 0)
    if (validItems.length === 0) {
      toast.error('Please add at least one product with valid quantity')
      return
    }

    const payload = {
      supplierId,
      items: validItems.map((i) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        cost: Number(i.cost),
      })),
      subtotal,
      tax,
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      total,
      status: 'draft' as const,
      notes: notes || undefined,
      expectedDate: expectedDate ? expectedDate : undefined,
    }

    createPurchase(payload, {
      onSuccess: () => {
        toast.success('Purchase order created successfully!')
        navigate('/purchases')
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to create purchase order')
      },
    })
  }

  if (isLoading && isEdit) {
    return <div className="p-6">Loading purchase order...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Purchase Order Details' : 'New Purchase Order'}
          </h1>
          <p className="text-muted-foreground">
            Create supplier order and record incoming stock
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supplier & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplierId">Select Supplier *</Label>
                {rawSuppliers.length > 0 ? (
                  <Select value={supplierId} onValueChange={setSupplierId} disabled={isCreating}>
                    <SelectTrigger id="supplierId">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {rawSuppliers.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="supplierId"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    placeholder="Enter supplier ID or Name"
                    disabled={isCreating}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDate">Expected Delivery Date (Optional)</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Instructions</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any order notes or shipping instructions"
                disabled={isCreating}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Items Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Items
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              disabled={isCreating}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-end gap-3 p-3 rounded-lg border bg-muted/20"
                >
                  <div className="flex-1 space-y-1 w-full">
                    <Label className="text-xs">Product *</Label>
                    {rawProducts.length > 0 ? (
                      <Select
                        value={item.productId}
                        onValueChange={(val) => handleItemChange(index, 'productId', val)}
                        disabled={isCreating}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {rawProducts.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.sku}) - Stock: {p.currentStock || 0}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        placeholder="Product ID"
                        disabled={isCreating}
                      />
                    )}
                  </div>

                  <div className="w-full md:w-32 space-y-1">
                    <Label className="text-xs">Qty *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      disabled={isCreating}
                    />
                  </div>

                  <div className="w-full md:w-36 space-y-1">
                    <Label className="text-xs">Unit Cost (KSh) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.cost}
                      onChange={(e) =>
                        handleItemChange(index, 'cost', parseFloat(e.target.value) || 0)
                      }
                      disabled={isCreating}
                    />
                  </div>

                  <div className="w-full md:w-32 text-right self-center font-medium text-sm">
                    {formatCurrency(item.quantity * item.cost)}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    disabled={isCreating || items.length <= 1}
                    className="text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="discount">Discount (KSh)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shipping">Shipping / Freight (KSh)</Label>
                  <Input
                    id="shipping"
                    type="number"
                    step="0.01"
                    min={0}
                    value={shipping}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-muted/40 p-4 self-end">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Tax (10%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>+{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 text-primary">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isCreating} className="px-8">
            <Save className="mr-2 h-4 w-4" />
            {isCreating ? 'Saving Order...' : 'Submit Purchase Order'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/purchases')}
            disabled={isCreating}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
