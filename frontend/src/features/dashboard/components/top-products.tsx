import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Trophy, Star, TrendingUp } from 'lucide-react'
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

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
    case 1:
      return { icon: Star, color: 'text-gray-400', bg: 'bg-gray-400/10' }
    case 2:
      return { icon: Star, color: 'text-amber-600', bg: 'bg-amber-600/10' }
    default:
      return { icon: Package, color: 'text-primary', bg: 'bg-primary/10' }
  }
}

export function TopProducts({ 
  products, 
  title = 'Top Products', 
  description = 'Best selling items' 
}: TopProductsProps) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5" />
      
      {/* Floating Elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-4 right-4 w-5 h-5 bg-yellow-500/20 rounded-full blur-sm"
      />
      
      <motion.div
        animate={{
          y: [0, -12, 0],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute bottom-4 left-4 w-3 h-3 bg-orange-500/30 rounded-full blur-sm"
      />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-3.5 h-3.5 text-white" />
              </motion.div>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                {description}
              </CardDescription>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
          >
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              Top {products.length}
            </Badge>
          </motion.div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="space-y-3">
          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No products to display</p>
            </motion.div>
          ) : (
            products.map((product, index) => {
              const { icon: RankIcon, color, bg } = getRankIcon(index)
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "hsl(var(--accent))",
                  }}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:shadow-md transition-all duration-200"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ring-2 ring-border/20`}
                  >
                    <RankIcon className={`h-5 w-5 ${color}`} />
                  </motion.div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <motion.p 
                        className="text-sm font-medium leading-none"
                        whileHover={{ color: "hsl(var(--primary))" }}
                      >
                        {product.name}
                      </motion.p>
                      <Badge 
                        variant={index < 3 ? "default" : "secondary"} 
                        className={`text-xs ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          ''
                        }`}
                      >
                        #{index + 1}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="space-y-1"
                    >
                      <p className="text-sm font-bold text-foreground">
                        {product.quantity} sold
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        {formatCurrency(product.revenue)}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
        
        {/* Animated Bottom Accent */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        />
      </CardContent>
    </Card>
  )
}
