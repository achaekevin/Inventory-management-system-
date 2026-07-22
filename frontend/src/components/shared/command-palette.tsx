import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'

interface Command {
  id: string
  title: string
  subtitle?: string
  icon: React.ElementType
  action: () => void
  category: string
}

export function CommandPalette() {
  const navigate = useNavigate()
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: Command[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'View overview',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
      category: 'Navigation',
    },
    {
      id: 'products',
      title: 'Products',
      subtitle: 'Manage products',
      icon: Package,
      action: () => navigate('/products'),
      category: 'Navigation',
    },
    {
      id: 'sales',
      title: 'Sales',
      subtitle: 'View and create sales',
      icon: ShoppingCart,
      action: () => navigate('/sales'),
      category: 'Navigation',
    },
    {
      id: 'customers',
      title: 'Customers',
      subtitle: 'Manage customers',
      icon: Users,
      action: () => navigate('/customers'),
      category: 'Navigation',
    },
    {
      id: 'warehouses',
      title: 'Warehouses',
      subtitle: 'Manage warehouses',
      icon: Warehouse,
      action: () => navigate('/warehouses'),
      category: 'Navigation',
    },
    {
      id: 'purchases',
      title: 'Purchases',
      subtitle: 'View purchase orders',
      icon: FileText,
      action: () => navigate('/purchases'),
      category: 'Navigation',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Configure system',
      icon: Settings,
      action: () => navigate('/settings'),
      category: 'Navigation',
    },
  ]

  const filteredCommands = commands.filter((command) =>
    command.title.toLowerCase().includes(search.toLowerCase()) ||
    command.subtitle?.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!isCommandPaletteOpen)
      }

      if (!isCommandPaletteOpen) return

      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          setCommandPaletteOpen(false)
          setSearch('')
          setSelectedIndex(0)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandPaletteOpen, filteredCommands, selectedIndex, setCommandPaletteOpen])

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSelectedIndex(0)
    }
  }, [search, isCommandPaletteOpen])

  if (!isCommandPaletteOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Command Palette */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-2xl -translate-x-1/2 rounded-lg border bg-background shadow-lg">
        {/* Search Input */}
        <div className="flex items-center border-b px-4">
          <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for commands..."
            className="flex h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon
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
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                      index === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">{command.title}</span>
                      {command.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {command.subtitle}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, ↵ to select, ESC to close</span>
          </div>
        </div>
      </div>
    </>
  )
}
