import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ChartData } from '@/types'

interface RevenueChartProps {
  data: ChartData[]
  title?: string
  description?: string
}

const barColors = [
  'hsl(220, 70%, 50%)',
  'hsl(200, 70%, 50%)',
  'hsl(180, 70%, 50%)',
  'hsl(160, 70%, 50%)',
  'hsl(140, 70%, 50%)',
  'hsl(120, 70%, 50%)',
]

export function RevenueChart({ data, title = 'Revenue Trend', description }: RevenueChartProps) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
      
      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-4 right-4 w-8 h-8 bg-emerald-500/20 rounded-full blur-sm"
      />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg"
              >
                <Coins className="w-3.5 h-3.5 text-white" />
              </motion.div>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-muted/30" 
                vertical={false}
              />
              <XAxis
                dataKey="label"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar
                dataKey="value"
                fill="url(#revenueGradient)"
                radius={[8, 8, 0, 0]}
                name="Revenue"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        
        {/* Animated Bottom Accent */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        />
      </CardContent>
    </Card>
  )
}
