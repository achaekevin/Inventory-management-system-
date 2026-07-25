import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import {
  Search,
  Package,
  Users,
  Building2,
  ShoppingCart,
  FileText,
  UserCheck,
  Calendar,
  Filter,
  X,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  searchApi,
  SearchResultItem,
  SearchCounts,
  EntityType,
} from '@/features/search/api/search-service'
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '@/features/search/utils/recent-searches'
import { cn } from '@/lib/utils'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const initialQuery = searchParams.get('q') || ''
  const initialType = (searchParams.get('type') || 'all') as EntityType

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<EntityType>(initialType)
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '')
  const [startDate, setStartDate] = useState<string>(searchParams.get('startDate') || '')
  const [endDate, setEndDate] = useState<string>(searchParams.get('endDate') || '')
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [counts, setCounts] = useState<SearchCounts>({
    all: 0,
    products: 0,
    customers: 0,
    suppliers: 0,
    orders: 0,
    invoices: 0,
    users: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalResults: 0,
  })

  const [recentQueries, setRecentQueries] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState<boolean>(false)

  // Load recent searches on mount
  useEffect(() => {
    setRecentQueries(getRecentSearches())
  }, [])

  // Execute search
  const performSearch = useCallback(
    async (
      q: string,
      type: EntityType,
      status: string,
      sDate: string,
      eDate: string,
      pageNum: number
    ) => {
      setIsLoading(true)
      try {
        const response = await searchApi.globalSearch({
          q,
          type,
          status: status || undefined,
          startDate: sDate || undefined,
          endDate: eDate || undefined,
          page: pageNum,
          limit: 15,
        })

        if (response.success && response.data) {
          setResults(response.data.results || [])
          if (response.data.counts) {
            setCounts(response.data.counts)
          }
          if (response.pagination) {
            setPagination({
              page: response.pagination.page,
              limit: response.pagination.limit,
              totalPages: response.pagination.totalPages,
              totalResults: response.pagination.totalResults,
            })
          }
        }
      } catch (error) {
        console.error('Failed to perform search:', error)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Trigger search on query / filter changes
  useEffect(() => {
    performSearch(query, activeTab, statusFilter, startDate, endDate, page)
  }, [activeTab, statusFilter, startDate, endDate, page, performSearch])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const updated = addRecentSearch(query)
      setRecentQueries(updated)
    }
    setPage(1)
    updateUrlParams(query, activeTab, statusFilter, startDate, endDate, 1)
    performSearch(query, activeTab, statusFilter, startDate, endDate, 1)
  }

  const updateUrlParams = (
    q: string,
    type: EntityType,
    status: string,
    sDate: string,
    eDate: string,
    p: number
  ) => {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (type && type !== 'all') params.type = type
    if (status) params.status = status
    if (sDate) params.startDate = sDate
    if (eDate) params.endDate = eDate
    if (p > 1) params.page = String(p)
    setSearchParams(params)
  }

  const handleTabChange = (type: EntityType) => {
    setActiveTab(type)
    setPage(1)
    updateUrlParams(query, type, statusFilter, startDate, endDate, 1)
  }

  const handleRecentClick = (q: string) => {
    setQuery(q)
    setPage(1)
    const updated = addRecentSearch(q)
    setRecentQueries(updated)
    updateUrlParams(q, activeTab, statusFilter, startDate, endDate, 1)
    performSearch(q, activeTab, statusFilter, startDate, endDate, 1)
  }

  const handleRemoveRecent = (e: React.MouseEvent, q: string) => {
    e.stopPropagation()
    const updated = removeRecentSearch(q)
    setRecentQueries(updated)
  }

  const handleClearAllRecent = () => {
    clearRecentSearches()
    setRecentQueries([])
  }

  const resetFilters = () => {
    setStatusFilter('')
    setStartDate('')
    setEndDate('')
    setPage(1)
    updateUrlParams(query, activeTab, '', '', '', 1)
  }

  const getEntityIcon = (type: string, subType?: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-5 w-5 text-blue-500" />
      case 'customer':
        return <Users className="h-5 w-5 text-emerald-500" />
      case 'supplier':
        return <Building2 className="h-5 w-5 text-amber-500" />
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-purple-500" />
      case 'invoice':
        return <FileText className="h-5 w-5 text-indigo-500" />
      case 'user':
        return <UserCheck className="h-5 w-5 text-rose-500" />
      default:
        return <Search className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const s = status ? status.toLowerCase() : ''
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary'
    let className = ''

    if (['active', 'completed', 'paid', 'approved'].includes(s)) {
      className = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    } else if (['pending', 'draft', 'submitted', 'partial'].includes(s)) {
      className = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    } else if (['inactive', 'cancelled', 'rejected', 'failed'].includes(s)) {
      variant = 'destructive'
    }

    return (
      <Badge variant={variant} className={cn('capitalize text-xs font-medium', className)}>
        {status}
      </Badge>
    )
  }

  const tabs: { id: EntityType; label: string; count: number; icon: any }[] = [
    { id: 'all', label: 'All Results', count: counts.all, icon: Search },
    { id: 'products', label: 'Products', count: counts.products, icon: Package },
    { id: 'customers', label: 'Customers', count: counts.customers, icon: Users },
    { id: 'suppliers', label: 'Suppliers', count: counts.suppliers, icon: Building2 },
    { id: 'orders', label: 'Orders', count: counts.orders, icon: ShoppingCart },
    { id: 'invoices', label: 'Invoices', count: counts.invoices, icon: FileText },
    { id: 'users', label: 'Users', count: counts.users, icon: UserCheck },
  ]

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6 max-w-7xl">
      {/* Search Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Advanced Search</h1>
          <p className="text-sm text-muted-foreground">
            Search across products, customers, suppliers, orders, invoices, and system users.
          </p>
        </div>

        {/* Global Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative flex w-full items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, SKU, invoice #, customer, email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-11 pr-10 text-base shadow-sm rounded-lg"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setPage(1)
                  updateUrlParams('', activeTab, statusFilter, startDate, endDate, 1)
                  performSearch('', activeTab, statusFilter, startDate, endDate, 1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="lg" className="h-12 px-6 gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button
            type="button"
            variant={showFilters ? 'default' : 'outline'}
            size="lg"
            className="h-12 px-4 gap-2 md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Recent Searches Chips */}
      {recentQueries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
            <History className="h-3.5 w-3.5" />
            <span>Recent:</span>
          </div>
          {recentQueries.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="cursor-pointer gap-1.5 px-2.5 py-1 text-xs hover:bg-accent transition-colors"
              onClick={() => handleRecentClick(item)}
            >
              <span>{item}</span>
              <X
                className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors"
                onClick={(e) => handleRemoveRecent(e, item)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllRecent}
            className="ml-auto text-xs text-muted-foreground hover:text-destructive h-7 px-2"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Entity Filter Tabs & Advanced Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-2">
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <Badge
                    variant={isActive ? 'secondary' : 'outline'}
                    className={cn(
                      'ml-1 text-[11px] px-1.5 py-0.2',
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground border-transparent' : ''
                    )}
                  >
                    {tab.count}
                  </Badge>
                </button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="hidden md:flex items-center gap-2 h-9 text-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{showFilters ? 'Hide Filters' : 'More Filters'}</span>
            {(statusFilter || startDate || endDate) && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {/* Collapsible Advanced Filters Bar */}
        {showFilters && (
          <Card className="bg-muted/40 border-muted">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Status
                </label>
                <input
                  type="text"
                  placeholder="e.g. active, completed, paid"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setPage(1)
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setPage(1)
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={resetFilters} className="h-9 text-xs w-full">
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Container */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Searching matching records...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent className="flex flex-col items-center justify-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">No matching records found</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {query
                    ? `No results matching "${query}". Try adjusting keywords or clearing search filters.`
                    : 'Enter a search term above to search across products, customers, orders, and invoices.'}
                </p>
              </div>
              {(statusFilter || startDate || endDate) && (
                <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2 text-xs">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item) => (
              <Card
                key={`${item.type}-${item.id}`}
                className="group hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(item.url)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-muted p-2 group-hover:bg-primary/10 transition-colors">
                        {getEntityIcon(item.type, item.subType)}
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold mb-0.5">
                          {item.subType || item.type}
                        </Badge>
                        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </CardTitle>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <CardDescription className="text-xs line-clamp-2 mt-2">
                    {item.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 border-t bg-muted/20 p-3 flex items-center justify-between text-xs text-muted-foreground mt-auto">
                  <span>
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Showing page <span className="font-medium text-foreground">{pagination.page}</span> of{' '}
              <span className="font-medium text-foreground">{pagination.totalPages}</span> ({pagination.totalResults} results)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => {
                  const newPage = page - 1
                  setPage(newPage)
                  updateUrlParams(query, activeTab, statusFilter, startDate, endDate, newPage)
                }}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || isLoading}
                onClick={() => {
                  const newPage = page + 1
                  setPage(newPage)
                  updateUrlParams(query, activeTab, statusFilter, startDate, endDate, newPage)
                }}
                className="h-8 gap-1 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
