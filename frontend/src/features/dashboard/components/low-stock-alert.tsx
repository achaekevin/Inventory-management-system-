import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router'

interface LowStockItem {
  id: string
  name: string
  currentStock: number
  minStock: number
  sku: string
}

interface LowStockAlertProps {
  items: LowStockItem[]
  title?: string
  description?: string
}

export function LowStockAlert({ 
  items, 
  title = 'Low Stock Alert', 
  description = 'Items running low' 
}: LowStockAlertProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              All items are well stocked
            </p>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-1">
                      {item.currentStock} left
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Min: {item.minStock}
                    </p>
                  </div>
                </div>
              ))}
              {items.length > 0 && (
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link to="/inventory">View All Inventory</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
