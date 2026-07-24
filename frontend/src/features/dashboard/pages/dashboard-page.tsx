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
import { PinnedReportsWidget } from '../components/pinned-reports-widget'
import { DashboardCustomizerToolbar, WidgetCardControls } from '../components/dashboard-customizer'
import { useDashboard } from '../hooks/use-dashboard'
import { useDashboardLayout } from '../hooks/use-dashboard-layout'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getPrimaryRoleCategory } from '@/utils/permissions'
import { formatCurrency, formatNumber } from '@/utils/format'

export function DashboardPage() {
  const { dashboardData, isLoading, refetch } = useDashboard()
  const { user } = useAuth()
  const roleCategory = getPrimaryRoleCategory(user)

  const {
    isEditMode,
    setIsEditMode,
    widgets,
    allWidgets,
    pinnedReports,
    moveWidget,
    resizeWidget,
    toggleWidgetVisibility,
    resetLayout,
    togglePinReport,
  } = useDashboardLayout()

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
    totalProducts: 0,
    totalInventoryValue: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalExpenses: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
  }

  const salesChartData = dashboardData?.salesChart || []
  const revenueChartData = dashboardData?.revenueChart || []
  const categoryChartData = dashboardData?.categoryChart || []
  const recentSales = dashboardData?.recentSales || []
  const topProducts = dashboardData?.topProducts || []
  const lowStockItems = dashboardData?.lowStockItems || []

  // Render individual widget component by ID
  const renderWidgetContent = (widgetId: string) => {
    switch (widgetId) {
      case 'stats-summary':
        return (
          <div className="space-y-4">
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
          </div>
        )
      case 'sales-chart':
        return <SalesChart data={salesChartData} description="Monthly sales overview" />
      case 'revenue-chart':
        return <RevenueChart data={revenueChartData} description="Monthly revenue trend" />
      case 'category-chart':
        return <CategoryChart data={categoryChartData} description="Distribution by category" />
      case 'recent-sales':
        return <RecentSales sales={recentSales} />
      case 'top-products':
        return <TopProducts products={topProducts} />
      case 'low-stock-alert':
        return <LowStockAlert items={lowStockItems} />
      case 'pinned-reports':
        return (
          <PinnedReportsWidget
            reports={pinnedReports}
            onUnpin={(id) => togglePinReport({ id, name: '' })}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Role Banner & Customizer */}
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Customizer Toolbar */}
          <DashboardCustomizerToolbar
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            allWidgets={allWidgets}
            resetLayout={resetLayout}
            toggleWidgetVisibility={toggleWidgetVisibility}
          />

          <Button onClick={() => refetch()} variant="outline" size="sm" className="text-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Customizable Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {widgets.map((widget, idx) => (
          <div
            key={widget.id}
            className={`relative transition-all duration-300 ${
              widget.span === 'col-span-full'
                ? 'md:col-span-3'
                : widget.span === 'col-span-3'
                ? 'md:col-span-3'
                : widget.span === 'col-span-2'
                ? 'md:col-span-2'
                : 'md:col-span-1'
            } ${isEditMode ? 'ring-2 ring-dashed ring-primary/40 rounded-xl p-2 bg-primary/5' : ''} ${
              !widget.visible && isEditMode ? 'opacity-40' : ''
            }`}
          >
            {isEditMode && (
              <WidgetCardControls
                widget={widget}
                isFirst={idx === 0}
                isLast={idx === widgets.length - 1}
                onMoveUp={() => moveWidget(widget.id, 'up')}
                onMoveDown={() => moveWidget(widget.id, 'down')}
                onResize={(span) => resizeWidget(widget.id, span)}
                onToggleVisibility={() => toggleWidgetVisibility(widget.id)}
              />
            )}
            {renderWidgetContent(widget.id)}
          </div>
        ))}
      </div>
    </div>
  )
}
