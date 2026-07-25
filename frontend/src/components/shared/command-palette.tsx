import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import {
  Search,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  FileText,
  Settings,
  Building2,
  UserCheck,
  History,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { searchApi, SearchResultItem } from '@/features/search/api/search-service'
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '@/features/search/utils/recent-searches'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ElementType
  action: () => void
  category: string
  type?: string
}

export function CommandPalette() {
  const navigate = useNavigate()
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [autocompleteResults, setAutocompleteResults] = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentQueries, setRecentQueries] = useState<string[]>([])

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setRecentQueries(getRecentSearches())
      setSelectedIndex(0)
    }
  }, [isCommandPaletteOpen])

  // Debounced Autocomplete Fetching
  useEffect(() => {
    if (!search || search.trim().length < 1) {
      setAutocompleteResults([])
      setIsLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await searchApi.autocomplete(search)
        if (response.success && response.data) {
          setAutocompleteResults(response.data)
        }
      } catch (error) {
        console.error('Autocomplete fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [search])

  const staticNavigationCommands: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'View system overview & analytics',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
      category: 'Navigation',
    },
    {
      id: 'products',
      title: 'Products List',
      subtitle: 'Manage catalog & inventory items',
      icon: Package,
      action: () => navigate('/products'),
      category: 'Navigation',
    },
    {
      id: 'sales',
      title: 'Sales & Invoices',
      subtitle: 'View sales orders & generate invoices',
      icon: ShoppingCart,
      action: () => navigate('/sales'),
      category: 'Navigation',
    },
    {
      id: 'customers',
      title: 'Customers',
      subtitle: 'View customer directory & credit',
      icon: Users,
      action: () => navigate('/customers'),
      category: 'Navigation',
    },
    {
      id: 'suppliers',
      title: 'Suppliers',
      subtitle: 'Manage vendor details & orders',
      icon: Building2,
      action: () => navigate('/suppliers'),
      category: 'Navigation',
    },
    {
      id: 'purchases',
      title: 'Purchases',
      subtitle: 'View purchase orders & workflows',
      icon: FileText,
      action: () => navigate('/purchases'),
      category: 'Navigation',
    },
    {
      id: 'warehouses',
      title: 'Warehouses',
      subtitle: 'Manage stock locations & transfers',
      icon: Warehouse,
      action: () => navigate('/warehouses'),
      category: 'Navigation',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Configure system settings & security',
      icon: Settings,
      action: () => navigate('/settings'),
      category: 'Navigation',
    },
  ]

  // Map autocomplete items into CommandItem structure
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return Package
      case 'customer':
        return Users
      case 'supplier':
        return Building2
      case 'order':
        return ShoppingCart
      case 'invoice':
        return FileText
      case 'user':
        return UserCheck
      default:
        return Search
    }
  }

  const autocompleteCommands: CommandItem[] = autocompleteResults.map((item) => ({
    id: `autocomplete-${item.type}-${item.id}`,
    title: item.title,
    subtitle: item.subtitle,
    icon: getEntityIcon(item.type),
    action: () => {
      if (search) addRecentSearch(search)
      navigate(item.url)
    },
    category: `Search Suggestions (${item.subType || item.type})`,
    type: item.type,
  }))

  const searchPageCommand: CommandItem | null = search.trim()
    ? {
        id: 'view-all-search',
        title: `View all search results for "${search}"`,
        subtitle: 'Open advanced search page with entity & date filters',
        icon: ArrowRight,
        action: () => {
          addRecentSearch(search)
          navigate(`/search?q=${encodeURIComponent(search)}`)
        },
        category: 'Advanced Search',
      }
    : null

  const filteredNavigation = staticNavigationCommands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.subtitle?.toLowerCase().includes(search.toLowerCase())
  )

  const combinedCommands: CommandItem[] = searchPageCommand
    ? [searchPageCommand, ...autocompleteCommands, ...filteredNavigation]
    : filteredNavigation

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!isCommandPaletteOpen)
      }

      if (!isCommandPaletteOpen) return

      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < combinedCommands.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : combinedCommands.length - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (combinedCommands[selectedIndex]) {
          combinedCommands[selectedIndex].action()
          setCommandPaletteOpen(false)
          setSearch('')
          setSelectedIndex(0)
        }
      }
    },
    [isCommandPaletteOpen, combinedCommands, selectedIndex, setCommandPaletteOpen]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  if (!isCommandPaletteOpen) return null

  const handleSelectRecentQuery = (q: string) => {
    setSearch(q)
    addRecentSearch(q)
    navigate(`/search?q=${encodeURIComponent(q)}`)
    setCommandPaletteOpen(false)
  }

  const handleRemoveRecentQuery = (e: React.MouseEvent, q: string) => {
    e.stopPropagation()
    const updated = removeRecentSearch(q)
    setRecentQueries(updated)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Command Palette Modal */}
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-2xl -translate-x-1/2 rounded-xl border bg-background shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center border-b px-4 py-1 bg-muted/20">
          <Search className="mr-2.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, customers, suppliers, orders, invoices, users..."
            className="flex h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Recent Searches Section (when search is empty or active) */}
        {recentQueries.length > 0 && !search && (
          <div className="border-b bg-muted/10 px-4 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                <span>Recent Searches</span>
              </div>
              <button
                onClick={() => {
                  clearRecentSearches()
                  setRecentQueries([])
                }}
                className="text-[11px] text-muted-foreground hover:text-destructive"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentQueries.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="cursor-pointer gap-1 px-2 py-0.5 text-xs hover:bg-accent transition-colors"
                  onClick={() => handleSelectRecentQuery(item)}
                >
                  <span>{item}</span>
                  <X
                    className="h-3 w-3 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleRemoveRecentQuery(e, item)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {combinedCommands.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Search className="h-8 w-8 text-muted-foreground/50" />
              <p>No results or commands found for "{search}"</p>
              <button
                onClick={() => {
                  addRecentSearch(search)
                  navigate(`/search?q=${encodeURIComponent(search)}`)
                  setCommandPaletteOpen(false)
                }}
                className="text-xs text-primary font-medium hover:underline mt-1"
              >
                Try Advanced Search Page &rarr;
              </button>
            </div>
          ) : (
            combinedCommands.map((command, index) => {
              const Icon = command.icon
              const isSelected = index === selectedIndex
              return (
                <button
                  key={command.id}
                  onClick={() => {
                    command.action()
                    setCommandPaletteOpen(false)
                    setSearch('')
                    setSelectedIndex(0)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'rounded-md p-1.5 shrink-0',
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-medium truncate">{command.title}</span>
                      {command.subtitle && (
                        <span
                          className={cn(
                            'text-xs truncate',
                            isSelected
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          )}
                        >
                          {command.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={isSelected ? 'secondary' : 'outline'}
                    className={cn(
                      'ml-2 shrink-0 text-[10px] capitalize',
                      isSelected ? 'bg-primary-foreground/20 text-primary-foreground border-transparent' : ''
                    )}
                  >
                    {command.category}
                  </Badge>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Navigate with ↑↓, Select with ↵, Close with ESC</span>
          <button
            onClick={() => {
              if (search) addRecentSearch(search)
              navigate(`/search?q=${encodeURIComponent(search)}`)
              setCommandPaletteOpen(false)
            }}
            className="text-primary hover:underline font-medium flex items-center gap-1"
          >
            <span>Advanced Search</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </>
  )
}
