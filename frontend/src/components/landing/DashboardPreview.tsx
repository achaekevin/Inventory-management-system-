import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Coins, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Section, SectionHeader } from './Section';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const kpiData = [
  {
    title: 'Total Revenue',
    value: 'KSh 12,450,000',
    change: '+23.5%',
    trend: 'up',
    icon: Coins,
    color: 'text-green-600',
  },
  {
    title: 'Total Products',
    value: '2,847',
    change: '+12.3%',
    trend: 'up',
    icon: Package,
    color: 'text-blue-600',
  },
  {
    title: 'Active Orders',
    value: '1,249',
    change: '+8.7%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'text-purple-600',
  },
  {
    title: 'Low Stock Items',
    value: '23',
    change: '-15.2%',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-orange-600',
  },
];

const inventoryData = [
  { month: 'Jan', value: 4200 },
  { month: 'Feb', value: 3800 },
  { month: 'Mar', value: 4600 },
  { month: 'Apr', value: 5200 },
  { month: 'May', value: 4800 },
  { month: 'Jun', value: 5800 },
];

const salesData = [
  { day: 'Mon', sales: 1200 },
  { day: 'Tue', sales: 1900 },
  { day: 'Wed', sales: 1500 },
  { day: 'Thu', sales: 2200 },
  { day: 'Fri', sales: 2800 },
  { day: 'Sat', sales: 3200 },
  { day: 'Sun', sales: 2400 },
];

const recentTransactions = [
  { id: 'ORD-1234', type: 'Sale', amount: 'KSh 1,250.00', status: 'Completed' },
  { id: 'PO-5678', type: 'Purchase', amount: 'KSh 3,500.00', status: 'Pending' },
  { id: 'ORD-1235', type: 'Sale', amount: 'KSh 890.00', status: 'Completed' },
  { id: 'ORD-1236', type: 'Sale', amount: 'KSh 2,100.00', status: 'Processing' },
];

const lowStockAlerts = [
  { product: 'Wireless Mouse Pro', stock: 5, reorder: 20 },
  { product: 'USB-C Cable 6ft', stock: 8, reorder: 50 },
  { product: 'Laptop Stand Aluminum', stock: 3, reorder: 15 },
];

export function DashboardPreview() {
  return (
    <Section id="product" background="gradient">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          subtitle="Interactive Preview"
          title="See Your Business at a Glance"
          description="Real-time dashboard with actionable insights to help you make informed decisions."
        />

        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {kpi.change}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inventory Levels Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Inventory Levels</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Sales Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Sales</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Transactions and Alerts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{transaction.id}</p>
                        <p className="text-xs text-muted-foreground">{transaction.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{transaction.amount}</p>
                        <p className={`text-xs ${
                          transaction.status === 'Completed' ? 'text-green-600' :
                          transaction.status === 'Pending' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {transaction.status}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Low Stock Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
                </div>
                <div className="space-y-3">
                  {lowStockAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.product}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
                    >
                      <p className="font-medium text-sm mb-1">{alert.product}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Current: <span className="font-semibold text-orange-600">{alert.stock}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Reorder: <span className="font-semibold">{alert.reorder}</span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
