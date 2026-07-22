import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Warehouse,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '../components/stat-card'
import { SalesChart } from '../components/sales-chart'
import { RevenueChart } from '../components/revenue-chart'
import { CategoryChart } from '../components/category-chart'
import { RecentSales } from '../components/recent-sales'
import { TopProducts } from '../components/top-products'
import { LowStockAlert } from '../components/low-stock-alert'
import { useDashboard } from '../hooks/use-dashboard'
import { formatCurrency, formatNumber } from '@/utils/format'

export function DashboardPage() {
  const { dashboardData, isLoading, refetch } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Mock data for demonstration (replace with actual API data)
  const stats = dashboardData?.stats || {
    totalProducts: 1234,
    totalInventoryValue: 45678.90,
    totalRevenue: 98765.43,
    totalProfit: 23456.78,
    totalExpenses: 12345.67,
    pendingOrders: 45,
    lowStockItems: 12,
    outOfStockItems: 3,
    totalCustomers: 567,
    totalSuppliers: 89,
  }

  const salesChartData = dashboardData?.salesChart || [
    { label: 'Jan', value: 4000 },
    { label: 'Feb', value: 3000 },
    { label: 'Mar', value: 5000 },
    { label: 'Apr', value: 4500 },
    { label: 'May', value: 6000 },
    { label: 'Jun', value: 5500 },
  ]

  const revenueChartData = dashboardData?.revenueChart || [
    { label: 'Jan', value: 12000 },
    { label: 'Feb', value: 19000 },
    { label: 'Mar', value: 15000 },
    { label: 'Apr', value: 22000 },
    { label: 'May', value: 18000 },
    { label: 'Jun', value: 25000 },
  ]

  const categoryChartData = dashboardData?.categoryChart || [
    { label: 'Electronics', value: 35 },
    { label: 'Clothing', value: 25 },
    { label: 'Food', value: 20 },
    { label: 'Books', value: 15 },
    { label: 'Others', value: 5 },
  ]

  const recentSales = dashboardData?.recentSales || [
    {
      id: '1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      amount: 1250.00,
      time: '2 hours ago',
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      amount: 890.50,
      time: '4 hours ago',
    },
    {
      id: '3',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      amount: 2100.00,
      time: '6 hours ago',
    },
    {
      id: '4',
      customerName: 'Alice Williams',
      customerEmail: 'alice@example.com',
      amount: 650.75,
      time: '1 day ago',
    },
    {
      id: '5',
      customerName: 'Charlie Brown',
      customerEmail: 'charlie@example.com',
      amount: 1450.00,
      time: '1 day ago',
    },
  ]

  const topProducts = dashboardData?.topProducts || [
    {
      id: '1',
      name: 'Wireless Headphones',
      category: 'Electronics',
      quantity: 245,
      revenue: 12250,
    },
    {
      id: '2',
      name: 'Smart Watch',
      category: 'Electronics',
      quantity: 198,
      revenue: 39600,
    },
    {
      id: '3',
      name: 'Running Shoes',
      category: 'Clothing',
      quantity: 156,
      revenue: 11700,
    },
    {
      id: '4',
      name: 'Coffee Maker',
      category: 'Appliances',
      quantity: 134,
      revenue: 10720,
    },
    {
      id: '5',
      name: 'Desk Lamp',
      category: 'Furniture',
      quantity: 112,
      revenue: 3360,
    },
  ]

  const lowStockItems = dashboardData?.lowStockItems || [
    {
      id: '1',
      name: 'Wireless Mouse',
      currentStock: 5,
      minStock: 20,
      sku: 'WM-001',
    },
    {
      id: '2',
      name: 'USB Cable',
      currentStock: 8,
      minStock: 50,
      sku: 'UC-002',
    },
    {
      id: '3',
      name: 'Phone Case',
      currentStock: 12,
      minStock: 30,
      sku: 'PC-003',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your business.
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change={12.5}
          icon={DollarSign}
          iconColor="text-success"
          iconBgColor="bg-success/10"
          trend="up"
        />
        <StatCard
          title="Total Products"
          value={formatNumber(stats.totalProducts)}
          change={8.2}
          icon={Package}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          trend="up"
        />
        <StatCard
          title="Total Customers"
          value={formatNumber(stats.totalCustomers)}
          change={5.3}
          icon={Users}
          iconColor="text-info"
          iconBgColor="bg-info/10"
          trend="up"
        />
        <StatCard
          title="Low Stock Items"
          value={formatNumber(stats.lowStockItems)}
          change={-2.1}
          icon={AlertTriangle}
          iconColor="text-warning"
          iconBgColor="bg-warning/10"
          trend="down"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Profit"
          value={formatCurrency(stats.totalProfit)}
          change={15.8}
          icon={TrendingUp}
          iconColor="text-success"
          iconBgColor="bg-success/10"
          trend="up"
        />
        <StatCard
          title="Pending Orders"
          value={formatNumber(stats.pendingOrders)}
          icon={ShoppingCart}
          iconColor="text-warning"
          iconBgColor="bg-warning/10"
        />
        <StatCard
          title="Total Suppliers"
          value={formatNumber(stats.totalSuppliers)}
          icon={Warehouse}
          iconColor="text-secondary"
          iconBgColor="bg-secondary/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <SalesChart data={salesChartData} description="Monthly sales overview" />
        <RevenueChart data={revenueChartData} description="Monthly revenue trend" />
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CategoryChart data={categoryChartData} description="Distribution by category" />
        <RecentSales sales={recentSales} />
        <TopProducts products={topProducts} />
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert items={lowStockItems} />
    </div>
  )
}
