import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatCurrency } from '@/utils/format'
import { getInitials } from '@/utils/format'

interface SaleItem {
  id: string
  customerName: string
  customerEmail: string
  customerAvatar?: string
  amount: number
  time: string
}

interface RecentSalesProps {
  sales: SaleItem[]
  title?: string
  description?: string
}

export function RecentSales({ 
  sales, 
  title = 'Recent Sales', 
  description = 'Latest transactions' 
}: RecentSalesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent sales
            </p>
          ) : (
            sales.map((sale) => (
              <div key={sale.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={sale.customerAvatar} alt={sale.customerName} />
                  <AvatarFallback>{getInitials(sale.customerName)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">{sale.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.customerEmail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(sale.amount)}</p>
                  <p className="text-xs text-muted-foreground">{sale.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
