import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface Product {
  id: string
  name: string
  category: string
  quantity: number
  revenue: number
}

interface TopProductsProps {
  products: Product[]
  title?: string
  description?: string
}

export function TopProducts({ 
  products, 
  title = 'Top Products', 
  description = 'Best selling items' 
}: TopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No products to display
            </p>
          ) : (
            products.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{product.quantity} sold</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
