import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Clock, TrendingUp } from 'lucide-react'
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
    <Card className="relative overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
      
      {/* Floating Elements */}
      <motion.div
        animate={{
          x: [0, 10, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-4 right-4 w-6 h-6 bg-purple-500/20 rounded-full blur-sm"
      />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-white" />
              </motion.div>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-500" />
                {description}
              </CardDescription>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1"
          >
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              {sales.length} Sales
            </Badge>
          </motion.div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="space-y-3">
          {sales.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <ShoppingCart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No recent sales</p>
            </motion.div>
          ) : (
            sales.map((sale, index) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "hsl(var(--accent))",
                }}
                className="flex items-center p-3 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:shadow-md transition-all duration-200"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                    <AvatarImage src={sale.customerAvatar} alt={sale.customerName} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                      {getInitials(sale.customerName)}
                    </AvatarFallback>
                  </Avatar>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                  />
                </motion.div>
                
                <div className="ml-4 space-y-1 flex-1">
                  <motion.p 
                    className="text-sm font-medium leading-none"
                    whileHover={{ color: "hsl(var(--primary))" }}
                  >
                    {sale.customerName}
                  </motion.p>
                  <p className="text-xs text-muted-foreground truncate">
                    {sale.customerEmail}
                  </p>
                </div>
                
                <div className="text-right space-y-1">
                  <motion.p 
                    className="text-sm font-bold text-green-600"
                    whileHover={{ scale: 1.05 }}
                  >
                    {formatCurrency(sale.amount)}
                  </motion.p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {sale.time}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Animated Bottom Accent */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        />
      </CardContent>
    </Card>
  )
}
