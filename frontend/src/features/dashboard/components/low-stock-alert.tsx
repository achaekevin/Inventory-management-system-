import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Package, ExternalLink, Zap } from 'lucide-react'
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
  const criticalItems = items.filter(item => item.currentStock <= item.minStock / 2)
  const warningItems = items.filter(item => item.currentStock > item.minStock / 2)

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
      
      {/* Pulsing Alert Indicator */}
      {items.length > 0 && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full blur-sm"
        />
      )}
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={items.length > 0 ? { 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: items.length > 0 ? Infinity : 0,
                  repeatDelay: 3,
                }}
                className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              </motion.div>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-red-500" />
                {description}
              </CardDescription>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
          >
            <Badge 
              variant={items.length > 0 ? "destructive" : "secondary"}
              className={items.length > 0 ? "animate-pulse" : ""}
            >
              {items.length} Alert{items.length !== 1 ? 's' : ''}
            </Badge>
          </motion.div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="space-y-3">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Package className="w-12 h-12 text-green-500/70 mx-auto mb-3" />
              </motion.div>
              <p className="text-sm text-muted-foreground">All items are well stocked</p>
            </motion.div>
          ) : (
            <>
              {/* Critical Items */}
              {criticalItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Critical ({criticalItems.length})
                  </h4>
                  {criticalItems.map((item, index) => (
                    <motion.div
                      key={`critical-${item.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02,
                        backgroundColor: "hsl(var(--destructive) / 0.05)",
                      }}
                      className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900 dark:bg-red-950/20"
                    >
                      <div className="flex-1">
                        <motion.p 
                          className="text-sm font-medium text-red-900 dark:text-red-100"
                          whileHover={{ scale: 1.02 }}
                        >
                          {item.name}
                        </motion.p>
                        <p className="text-xs text-red-600 dark:text-red-400">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Badge variant="destructive" className="animate-pulse">
                            {item.currentStock} left
                          </Badge>
                        </motion.div>
                        <p className="text-xs text-muted-foreground">
                          Min: {item.minStock}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Warning Items */}
              {warningItems.length > 0 && (
                <div className="space-y-2">
                  {criticalItems.length > 0 && <div className="border-t pt-2" />}
                  <h4 className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Warning ({warningItems.length})
                  </h4>
                  {warningItems.map((item, index) => (
                    <motion.div
                      key={`warning-${item.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (criticalItems.length + index) * 0.1 }}
                      whileHover={{ 
                        scale: 1.02,
                        backgroundColor: "hsl(var(--warning) / 0.05)",
                      }}
                      className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-900 dark:bg-orange-950/20"
                    >
                      <div className="flex-1">
                        <motion.p 
                          className="text-sm font-medium text-orange-900 dark:text-orange-100"
                          whileHover={{ scale: 1.02 }}
                        >
                          {item.name}
                        </motion.p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                          {item.currentStock} left
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Min: {item.minStock}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4"
                >
                  <Button asChild variant="outline" className="w-full group hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/20">
                    <Link to="/inventory" className="flex items-center gap-2">
                      View All Inventory
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
        
        {/* Animated Bottom Accent */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${
            items.length > 0 
              ? "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" 
              : "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
          }`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        />
      </CardContent>
    </Card>
  )
}
