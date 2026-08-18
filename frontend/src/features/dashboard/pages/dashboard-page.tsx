import { 
  Coins, 
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
  Activity,
  Eye,
  Timer,
  Layers,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <div className="min-h-screen relative overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          {/* Animated Warehouse Elements */}
          <motion.div
            animate={{
              x: ['-100vw', '100vw'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-1/3 w-32 h-16 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-lg blur-sm"
          />
          
          <motion.div
            animate={{
              x: ['100vw', '-100vw'],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'linear',
              delay: 2,
            }}
            className="absolute top-2/3 w-24 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-sm"
          />
        </div>

        {/* Loading Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
              />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Initializing Dashboard</h2>
              <p className="text-muted-foreground">Loading role-based analytics and insights...</p>
            </motion.div>

            {/* Loading Progress Indicators */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '300px' }}
              transition={{ duration: 2, delay: 1 }}
              className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-blue-500 rounded-full"
            />
          </motion.div>
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
    const widgetVariants = {
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" }
      }
    }

    switch (widgetId) {
      case 'stats-summary':
        return (
          <motion.div 
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                change={12.5}
                icon={Coins}
                iconColor="text-emerald-600"
                iconBgColor="bg-emerald-500/10"
                trend="up"
              />
              <StatCard
                title="Total Products"
                value={formatNumber(stats.totalProducts)}
                change={8.2}
                icon={Package}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-500/10"
                trend="up"
              />
              <StatCard
                title="Total Customers"
                value={formatNumber(stats.totalCustomers)}
                change={5.3}
                icon={Users}
                iconColor="text-purple-600"
                iconBgColor="bg-purple-500/10"
                trend="up"
              />
              <StatCard
                title="Low Stock Items"
                value={formatNumber(stats.lowStockItems)}
                change={-2.1}
                icon={AlertTriangle}
                iconColor="text-amber-600"
                iconBgColor="bg-amber-500/10"
                trend="down"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Profit"
                value={formatCurrency(stats.totalProfit)}
                change={15.8}
                icon={TrendingUp}
                iconColor="text-emerald-600"
                iconBgColor="bg-emerald-500/10"
                trend="up"
              />
              <StatCard
                title="Pending Orders"
                value={formatNumber(stats.pendingOrders)}
                icon={ShoppingCart}
                iconColor="text-orange-600"
                iconBgColor="bg-orange-500/10"
              />
              <StatCard
                title="Total Suppliers"
                value={formatNumber(stats.totalSuppliers)}
                icon={Warehouse}
                iconColor="text-slate-600"
                iconBgColor="bg-slate-500/10"
              />
            </div>
          </motion.div>
        )
      case 'sales-chart':
        return (
          <motion.div
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
          >
            <SalesChart data={salesChartData} description="Monthly sales overview" />
          </motion.div>
        )
      case 'revenue-chart':
        return (
          <motion.div
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
          >
            <RevenueChart data={revenueChartData} description="Monthly revenue trend" />
          </motion.div>
        )
      case 'category-chart':
        return (
          <motion.div
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
          >
            <CategoryChart data={categoryChartData} description="Distribution by category" />
          </motion.div>
        )
      case 'recent-sales':
        return (
          <motion.div
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
          >
            <RecentSales sales={recentSales} />
          </motion.div>
        )
      case 'top-products':
        return (
          <motion.div
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
          >
            <TopProducts products={topProducts} />
          </motion.div>
        )
      case 'low-stock-alert':
        return (
          <motion.div
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
          >
            <LowStockAlert items={lowStockItems} />
          </motion.div>
        )
      case 'pinned-reports':
        return (
          <motion.div
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
          >
            <PinnedReportsWidget
              reports={pinnedReports}
              onUnpin={(id) => togglePinReport({ id, name: '' })}
            />
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Ambient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-6 p-6">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {roleCategory === 'super-admin' && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white gap-1.5 shadow-lg">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Super Administrator
                    </Badge>
                  )}
                  {roleCategory === 'inventory-manager' && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white gap-1.5 shadow-lg">
                      <Package className="h-3.5 w-3.5" />
                      Inventory Manager
                    </Badge>
                  )}
                  {roleCategory === 'procurement-officer' && (
                    <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white gap-1.5 shadow-lg">
                      <Building2 className="h-3.5 w-3.5" />
                      Procurement Officer
                    </Badge>
                  )}
                  {roleCategory === 'sales-officer' && (
                    <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 text-white gap-1.5 shadow-lg">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Sales Officer
                    </Badge>
                  )}
                  {roleCategory === 'finance-manager' && (
                    <Badge className="bg-gradient-to-r from-amber-600 to-amber-700 text-white gap-1.5 shadow-lg">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Finance Manager
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground max-w-2xl"
            >
              Welcome back, <span className="font-semibold text-foreground">{user?.firstName || 'User'}</span>! 
              {roleCategory === 'super-admin' && ' Full administrative control across all system modules.'}
              {roleCategory === 'inventory-manager' && ' Manage inventory, stock levels, and warehouse operations.'}
              {roleCategory === 'procurement-officer' && ' Handle procurement, suppliers, and purchase orders.'}
              {roleCategory === 'sales-officer' && ' Manage sales, POS, and customer operations.'}
              {roleCategory === 'finance-manager' && ' Monitor financials, revenues, and analytics.'}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-3"
          >
            {/* Enhanced Customizer Toolbar */}
            <DashboardCustomizerToolbar
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              allWidgets={allWidgets}
              resetLayout={resetLayout}
              toggleWidgetVisibility={toggleWidgetVisibility}
            />

            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm" 
              className="gap-2 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </motion.div>
        </motion.div>

        {/* Enhanced Dashboard Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {widgets.map((widget, idx) => (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative group ${
                  widget.span === 'col-span-full'
                    ? 'md:col-span-3'
                    : widget.span === 'col-span-3'
                    ? 'md:col-span-3'
                    : widget.span === 'col-span-2'
                    ? 'md:col-span-2'
                    : 'md:col-span-1'
                } ${isEditMode ? 'ring-2 ring-dashed ring-primary/40 rounded-xl p-3 bg-primary/5 backdrop-blur-sm' : ''} ${
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
                
                <div className="relative overflow-hidden rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <div className="relative">
                    {renderWidgetContent(widget.id)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
