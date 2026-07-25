import { useState, useEffect, useCallback } from 'react'
import {
  Flame,
  AlertTriangle,
  Package,
  TrendingUp,
  Snowflake,
  Search,
  Filter,
  RefreshCw,
  Building2,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  inventoryHeatmapApi,
  HeatMapItem,
  HeatClassification,
} from '@/features/inventory-heatmap/api/inventory-heatmap-service'
import { useLocalization } from '@/contexts/localization-context'
import { cn } from '@/lib/utils'

export function InventoryHeatmapPage() {
  const { formatPrice } = useLocalization()
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [heatmapData, setHeatmapData] = useState<{
    heatScore: number
    counts: {
      all: number
      lowStock: number
      overstock: number
      fastMoving: number
      slowMoving: number
      normal: number
    }
    items: HeatMapItem[]
  }>({
    heatScore: 50,
    counts: { all: 0, lowStock: 0, overstock: 0, fastMoving: 0, slowMoving: 0, normal: 0 },
    items: [],
  })

  const fetchHeatmap = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await inventoryHeatmapApi.getHeatmapData({
        classification: activeTab !== 'ALL' ? activeTab : undefined,
      })
      if (res.success && res.data) {
        setHeatmapData(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch inventory heat map:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchHeatmap()
  }, [fetchHeatmap])

  const filteredItems = heatmapData.items.filter((item) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.productName.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.categoryName.toLowerCase().includes(q) ||
      item.warehouseName.toLowerCase().includes(q)
    )
  })

  const getHeatCardStyles = (cls: HeatClassification) => {
    switch (cls) {
      case 'LOW_STOCK':
        return {
          cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/40',
          badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          icon: <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />,
          label: 'Low Stock Risk',
        }
      case 'OVERSTOCK':
        return {
          cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/40',
          badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          icon: <Flame className="h-5 w-5 text-amber-500" />,
          label: 'Overstock Excess',
        }
      case 'FAST_MOVING':
        return {
          cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/40',
          badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
          label: 'Fast-Moving High Velocity',
        }
      case 'SLOW_MOVING':
        return {
          cardBg: 'bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border-slate-500/40',
          badgeBg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
          icon: <Snowflake className="h-5 w-5 text-slate-500" />,
          label: 'Slow-Moving Idle Stock',
        }
      default:
        return {
          cardBg: 'bg-card border-muted',
          badgeBg: 'bg-muted text-muted-foreground',
          icon: <Package className="h-5 w-5 text-muted-foreground" />,
          label: 'Normal Stock',
        }
    }
  }

  const tabs: { id: string; label: string; count: number; icon: any }[] = [
    { id: 'ALL', label: 'All Items', count: heatmapData.counts.all, icon: Package },
    { id: 'LOW_STOCK', label: 'Low Stock', count: heatmapData.counts.lowStock, icon: AlertTriangle },
    { id: 'OVERSTOCK', label: 'Overstock', count: heatmapData.counts.overstock, icon: Flame },
    { id: 'FAST_MOVING', label: 'Fast-Moving', count: heatmapData.counts.fastMoving, icon: TrendingUp },
    { id: 'SLOW_MOVING', label: 'Slow-Moving', count: heatmapData.counts.slowMoving, icon: Snowflake },
  ]

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Flame className="h-7 w-7 text-amber-500" />
            Inventory Heat Map & Stock Velocity
          </h1>
          <p className="text-sm text-muted-foreground">
            Visual inventory heat analytics classifying Overstock, Low stock, Fast-moving, and Slow-moving products.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHeatmap} disabled={isLoading} className="gap-1.5 self-start md:self-auto text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Recalculate Heat Index
        </Button>
      </div>

      {/* Summary Heat Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">{heatmapData.counts.lowStock}</h3>
              <p className="text-[11px] text-muted-foreground">Depletion risk below min stock</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Overstock Excess</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{heatmapData.counts.overstock}</h3>
              <p className="text-[11px] text-muted-foreground">Capital tied in surplus inventory</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
              <Flame className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Fast-Moving Items</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{heatmapData.counts.fastMoving}</h3>
              <p className="text-[11px] text-muted-foreground">High 30-day sales volume</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-slate-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Slow-Moving / Dead Stock</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-600 dark:text-slate-400">{heatmapData.counts.slowMoving}</h3>
              <p className="text-[11px] text-muted-foreground">Zero sales in past 60 days</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-500/10 text-slate-500">
              <Snowflake className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-2">
          {/* Scrollable Classification Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map((t) => {
              const TabIcon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                  <Badge
                    variant={isActive ? 'secondary' : 'outline'}
                    className={cn('ml-1 text-[10px] px-1.5', isActive ? 'bg-primary-foreground/20 text-primary-foreground' : '')}
                  >
                    {t.count}
                  </Badge>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search product, SKU, warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Heat Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Calculating stock heat maps & sales velocity...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <Flame className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-base font-semibold">No items match the selected heat filter</h3>
            <p className="text-xs text-muted-foreground">
              Try selecting "All Items" tab or clearing the search box.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const style = getHeatCardStyles(item.classification)
            return (
              <Card
                key={item.id}
                className={cn('group hover:shadow-md transition-all border shadow-xs flex flex-col justify-between', style.cardBg)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="rounded-lg p-2 bg-background border shadow-2xs">
                      {style.icon}
                    </div>
                    <Badge variant="outline" className={cn('text-[10px] uppercase font-bold tracking-wider', style.badgeBg)}>
                      {item.classification.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-0.5">
                    <CardTitle className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {item.productName}
                    </CardTitle>
                    <CardDescription className="text-[11px] font-mono">
                      SKU: {item.sku} | {item.categoryName}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  {/* Stock Level Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Stock On Hand:</span>
                      <span>{item.quantity} units</span>
                    </div>
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all',
                          item.classification === 'LOW_STOCK'
                            ? 'bg-rose-500'
                            : item.classification === 'OVERSTOCK'
                            ? 'bg-amber-500'
                            : item.classification === 'FAST_MOVING'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        )}
                        style={{ width: `${Math.min(100, Math.max(10, (item.quantity / (item.minStock * 4 || 20)) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Footer Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] border-t pt-2 text-muted-foreground">
                    <div>
                      <span>Location:</span>
                      <strong className="block text-foreground font-medium truncate">{item.warehouseName}</strong>
                    </div>
                    <div>
                      <span>30-Day Sales:</span>
                      <strong className="block text-foreground font-medium">{item.salesCount30Days} sold</strong>
                    </div>
                    <div>
                      <span>Total Value:</span>
                      <strong className="block text-foreground font-medium">{formatPrice(item.totalValue)}</strong>
                    </div>
                    <div>
                      <span>Heat Index:</span>
                      <strong className="block text-foreground font-medium">{item.heatScore}/100</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
