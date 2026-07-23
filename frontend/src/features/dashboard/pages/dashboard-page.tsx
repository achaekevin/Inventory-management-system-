import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Warehouse,
  AlertTriangle,
  RefreshCw,
  Plus,
  Building2,
  FileText,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '../components/stat-card'
import { SalesChart } from '../components/sales-chart'
import { RevenueChart } from '../components/revenue-chart'
import { CategoryChart } from '../components/category-chart'
import { RecentSales } from '../components/recent-sales'
import { TopProducts } from '../components/top-products'
import { LowStockAlert } from '../components/low-stock-alert'
import { useDashboard } from '../hooks/use-dashboard'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getPrimaryRoleCategory } from '@/utils/permissions'
import { formatCurrency, formatNumber } from '@/utils/format'

export function DashboardPage() {
  const { dashboardData, isLoading, refetch } = useDashboard()
  const { user } = useAuth()
  const roleCategory = getPrimaryRoleCategory(user)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading role-based dashboard...</p>
        </div>
      </div>
    )
  }

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
  ]

  return (
    <div className="space-y-6">
      {/* Header with Role Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {roleCategory === 'super-admin' && (
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Super Administrator
              </Badge>
            )}
            {roleCategory === 'inventory-manager' && (
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3.5 w-3.5" />
                Inventory Manager
              </Badge>
            )}
            {roleCategory === 'procurement-officer' && (
              <Badge variant="outline" className="border-info text-info gap-1">
                <Building2 className="h-3.5 w-3.5" />
                Procurement Officer
              </Badge>
            )}
            {roleCategory === 'sales-officer' && (
              <Badge variant="outline" className="border-success text-success gap-1">
                <ShoppingCart className="h-3.5 w-3.5" />
                Sales & POS Officer
              </Badge>
            )}
            {roleCategory === 'finance-manager' && (
              <Badge variant="outline" className="border-warning text-warning gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Finance & Reports Manager
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.firstName || 'User'}</span>! 
            {roleCategory === 'super-admin' && ' You have full administrative control across all system modules.'}
            {roleCategory === 'inventory-manager' && ' Here is your inventory, stock levels, and warehouse summary.'}
            {roleCategory === 'procurement-officer' && ' Here is your procurement, supplier, and purchase order tracking.'}
            {roleCategory === 'sales-officer' && ' Here is your sales activity, POS status, and customer overview.'}
            {roleCategory === 'finance-manager' && ' Here is your financial overview, revenues, and reports analytics.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {/* Role-Specific Primary Shortcuts */}
          {roleCategory === 'super-admin' && (
            <Button asChild size="sm" className="bg-gradient-to-r from-primary to-purple-600">
              <Link to="/products/new">
                <Plus className="mr-1 h-4 w-4" /> Add Product
              </Link>
            </Button>
          )}
          {roleCategory === 'sales-officer' && (
            <Button asChild size="sm" className="bg-success text-white hover:bg-success/90">
              <Link to="/sales/pos">
                <Zap className="mr-1 h-4 w-4" /> POS Terminal
              </Link>
            </Button>
          )}
          {roleCategory === 'inventory-manager' && (
            <Button asChild size="sm">
              <Link to="/products/new">
                <Plus className="mr-1 h-4 w-4" /> Add Product
              </Link>
            </Button>
          )}
          {roleCategory === 'procurement-officer' && (
            <Button asChild size="sm">
              <Link to="/purchases">
                <FileText className="mr-1 h-4 w-4" /> New Order
              </Link>
            </Button>
          )}
          {roleCategory === 'finance-manager' && (
            <Button asChild size="sm" variant="secondary">
              <Link to="/reports">
                <BarChart3 className="mr-1 h-4 w-4" /> Export Reports
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUPER ADMINISTRATOR DASHBOARD (Supersedes all roles)                  */}
      {/* ========================================================================= */}
      {roleCategory === 'super-admin' && (
        <>
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

          <div className="grid gap-4 md:grid-cols-2">
            <SalesChart data={salesChartData} description="Monthly sales overview" />
            <RevenueChart data={revenueChartData} description="Monthly revenue trend" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CategoryChart data={categoryChartData} description="Distribution by category" />
            <RecentSales sales={recentSales} />
            <TopProducts products={topProducts} />
          </div>

          <LowStockAlert items={lowStockItems} />
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. INVENTORY MANAGER DASHBOARD                                            */}
      {/* ========================================================================= */}
      {roleCategory === 'inventory-manager' && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Products"
              value={formatNumber(stats.totalProducts)}
              icon={Package}
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
            />
            <StatCard
              title="Low Stock Items"
              value={formatNumber(stats.lowStockItems)}
              icon={AlertTriangle}
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
              trend="down"
            />
            <StatCard
              title="Out of Stock Items"
              value={formatNumber(stats.outOfStockItems)}
              icon={AlertTriangle}
              iconColor="text-destructive"
              iconBgColor="bg-destructive/10"
            />
            <StatCard
              title="Total Inventory Value"
              value={formatCurrency(stats.totalInventoryValue)}
              icon={DollarSign}
              iconColor="text-success"
              iconBgColor="bg-success/10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TopProducts products={topProducts} />
            <CategoryChart data={categoryChartData} description="Inventory distribution" />
          </div>

          <LowStockAlert items={lowStockItems} />
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. PROCUREMENT OFFICER DASHBOARD                                         */}
      {/* ========================================================================= */}
      {roleCategory === 'procurement-officer' && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Pending Purchase Orders"
              value={formatNumber(stats.pendingOrders)}
              icon={FileText}
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
            />
            <StatCard
              title="Total Suppliers"
              value={formatNumber(stats.totalSuppliers)}
              icon={Building2}
              iconColor="text-info"
              iconBgColor="bg-info/10"
            />
            <StatCard
              title="Low Stock Requiring Orders"
              value={formatNumber(stats.lowStockItems)}
              icon={AlertTriangle}
              iconColor="text-destructive"
              iconBgColor="bg-destructive/10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <LowStockAlert items={lowStockItems} />
            <TopProducts products={topProducts} />
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. SALES & POS OFFICER DASHBOARD                                          */}
      {/* ========================================================================= */}
      {roleCategory === 'sales-officer' && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Sales Revenue"
              value={formatCurrency(stats.totalRevenue)}
              change={12.5}
              icon={DollarSign}
              iconColor="text-success"
              iconBgColor="bg-success/10"
              trend="up"
            />
            <StatCard
              title="Pending Sales Orders"
              value={formatNumber(stats.pendingOrders)}
              icon={ShoppingCart}
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
            />
            <StatCard
              title="Total Customers"
              value={formatNumber(stats.totalCustomers)}
              icon={Users}
              iconColor="text-info"
              iconBgColor="bg-info/10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <RecentSales sales={recentSales} />
            <TopProducts products={topProducts} />
            <SalesChart data={salesChartData} description="Recent Sales Trends" />
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 5. FINANCE & REPORTS MANAGER DASHBOARD                                    */}
      {/* ========================================================================= */}
      {roleCategory === 'finance-manager' && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              title="Total Net Profit"
              value={formatCurrency(stats.totalProfit)}
              change={15.8}
              icon={TrendingUp}
              iconColor="text-success"
              iconBgColor="bg-success/10"
              trend="up"
            />
            <StatCard
              title="Total Expenses"
              value={formatCurrency(stats.totalExpenses)}
              icon={CreditCard}
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <RevenueChart data={revenueChartData} description="Monthly Revenue & Expense" />
            <SalesChart data={salesChartData} description="Monthly Sales Volume" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CategoryChart data={categoryChartData} description="Revenue distribution by category" />
            <RecentSales sales={recentSales} />
          </div>
        </>
      )}

      {/* Fallback for general user */}
      {roleCategory === 'general-user' && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Products"
              value={formatNumber(stats.totalProducts)}
              icon={Package}
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
            />
            <StatCard
              title="Low Stock Items"
              value={formatNumber(stats.lowStockItems)}
              icon={AlertTriangle}
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
            />
            <StatCard
              title="Pending Orders"
              value={formatNumber(stats.pendingOrders)}
              icon={ShoppingCart}
              iconColor="text-info"
              iconBgColor="bg-info/10"
            />
          </div>
          <TopProducts products={topProducts} />
        </>
      )}
    </div>
  )
}
