import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Layers, Target } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { CHART_COLORS } from '@/lib/constants'

interface CategoryChartProps {
  data: Array<{ label: string; value: number }>
  title?: string
  description?: string
}

const enhancedColors = [
  'hsl(210, 100%, 56%)',
  'hsl(195, 100%, 50%)',
  'hsl(180, 100%, 45%)',
  'hsl(165, 100%, 40%)',
  'hsl(150, 100%, 35%)',
  'hsl(135, 100%, 30%)',
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg"
      >
        <p className="font-medium text-foreground">{payload[0].name}</p>
        <p className="text-sm text-muted-foreground">
          Value: <span className="font-semibold text-primary">{payload[0].value}</span>
        </p>
      </motion.div>
    )
  }
  return null
}

export function CategoryChart({ 
  data, 
  title = 'Product Categories', 
  description 
}: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
      
      {/* Floating Elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-6 right-6 w-6 h-6 bg-blue-500/20 rounded-full blur-sm"
      />
      
      <motion.div
        animate={{
          y: [0, -8, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-6 left-6 w-4 h-4 bg-cyan-500/30 rounded-full blur-sm"
      />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
              >
                <Layers className="w-3.5 h-3.5 text-white" />
              </motion.div>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="flex items-center gap-1">
                <Target className="w-4 h-4 text-blue-500" />
                {description}
              </CardDescription>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-right"
          >
            <div className="text-2xl font-bold text-foreground">{total}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </motion.div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pb-6">
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {enhancedColors.map((color, index) => (
                    <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={300}
                  animationDuration={1200}
                >
                  {data.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient-${index % enhancedColors.length})`}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
          
          {/* Custom Legend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            {data.map((entry, index) => (
              <motion.div
                key={entry.label}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: enhancedColors[index % enhancedColors.length] }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{entry.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Center Circle Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center"
        >
          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">{data.length}</div>
          <div className="text-xs text-muted-foreground">Categories</div>
        </motion.div>
        
        {/* Animated Bottom Accent */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        />
      </CardContent>
    </Card>
  )
}
