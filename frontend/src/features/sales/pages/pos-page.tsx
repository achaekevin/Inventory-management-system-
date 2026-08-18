import { useState } from 'react'
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreateSale } from '../hooks/use-sales'
import { useOffline } from '@/hooks/use-offline'
import { formatCurrency, formatNumber } from '@/utils/format'
import { useNavigate } from 'react-router'

interface CartItem {
  id: string
  productId: string
  name: string
  sku: string
  price: number
  quantity: number
  discount: number
}

export function POSPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartItem[]>([])
  const [barcode, setBarcode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [customerId, setCustomerId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash')

  const { mutate: createSale, isPending } = useCreateSale()
  const { isOnline, queueTransaction } = useOffline()

  // Mock product search by barcode (replace with actual API call)
  const searchProduct = (code: string) => {
    // Simulate finding a product
    const mockProduct = {
      id: `prod-${Date.now()}`,
      productId: code,
      name: 'Sample Product',
      sku: code,
      price: 29.99,
      quantity: 1,
      discount: 0,
    }
    
    addToCart(mockProduct)
    setBarcode('')
  }

  const addToCart = (product: CartItem) => {
    const existing = cart.find(item => item.productId === product.productId)
    
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, product])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : null
      }
      return item
    }).filter(Boolean) as CartItem[])
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const discountAmount = (subtotal * discount) / 100
    const taxRate = 0.10 // 10% tax
    const tax = (subtotal - discountAmount) * taxRate
    const total = subtotal - discountAmount + tax

    return { subtotal, discountAmount, tax, total }
  }

  const handleCheckout = async () => {
    const { subtotal, discountAmount, tax, total } = calculateTotals()

    const saleData = {
      customerId: customerId || undefined,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod,
      paymentStatus: 'paid' as const,
    }

    if (!isOnline) {
      await queueTransaction('create_sale', '/sales', saleData)
      setCart([])
      setDiscount(0)
      setCustomerId('')
      return
    }

    createSale(saleData, {
      onSuccess: () => {
        setCart([])
        setDiscount(0)
        setCustomerId('')
        alert('Sale completed successfully!')
      },
      onError: async () => {
        // Fallback to offline queue if API network call fails
        await queueTransaction('create_sale', '/sales', saleData)
        setCart([])
        setDiscount(0)
        setCustomerId('')
      }
    })
  }

  const { subtotal, discountAmount, tax, total } = calculateTotals()

  return (
    <div className="h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Point of Sale</h1>

      <div className="grid gap-6 lg:grid-cols-3 h-full">
        {/* Products & Cart */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Scan barcode or enter product code..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && barcode) {
                      searchProduct(barcode)
                    }
                  }}
                />
                <Button onClick={() => barcode && searchProduct(barcode)}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart Items ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Scan products to add them to cart</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.sku}</div>
                        <div className="text-sm font-medium">{formatCurrency(item.price)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right w-24">
                        <div className="font-bold">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Checkout Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Customer ID (optional)"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Cash
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Card
              </Button>
              <Button
                variant={paymentMethod === 'bank_transfer' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setPaymentMethod('bank_transfer')}
              >
                Bank Transfer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="0"
                  max="100"
                />
                <span className="flex items-center">%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium text-green-600">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (10%):</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={cart.length === 0 || isPending}
          >
            {isPending ? 'Processing...' : `Complete Sale - ${formatCurrency(total)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
