import { Bell, Search, Menu, Sun, Moon, Laptop, LogOut, User, Settings, Lock, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/store/ui-store'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useOffline } from '@/hooks/use-offline'
import { useTheme } from '@/contexts/ThemeContext'
import { LanguageCurrencySelector } from './language-currency-selector'
import { getInitials } from '@/utils/format'

export function Header() {
  const { 
    toggleSidebar, 
    setCommandPaletteOpen,
  } = useUIStore()
  
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { isOnline, isSyncing, pendingCount, syncNow } = useOffline()

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system')
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 w-full"
    >
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search Button */}
      <Button
        variant="outline"
        className="relative h-9 w-full max-w-sm justify-start text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-96"
        onClick={() => setCommandPaletteOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search everything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <div className="ml-auto flex items-center gap-2">
        {/* Offline / Online Status Indicator */}
        {!isOnline ? (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-1"
          >
            <WifiOff className="h-3.5 w-3.5 animate-pulse" />
            <span>Offline {pendingCount > 0 && `(${pendingCount})`}</span>
          </Badge>
        ) : pendingCount > 0 ? (
          <Button
            size="sm"
            variant="outline"
            onClick={syncNow}
            disabled={isSyncing}
            className="h-8 gap-1.5 text-xs border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync {pendingCount} Offline</span>
          </Button>
        ) : (
          <Badge
            variant="outline"
            className="hidden sm:inline-flex gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] px-2 py-0.5"
          >
            <Wifi className="h-3 w-3" />
            Online
          </Badge>
        )}
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <div className="space-y-1 p-2">
                <div className="flex flex-col gap-1 rounded-md p-2 hover:bg-accent">
                  <p className="text-sm font-medium">Low stock alert</p>
                  <p className="text-xs text-muted-foreground">
                    Product "Widget A" is running low on stock
                  </p>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex flex-col gap-1 rounded-md p-2 hover:bg-accent">
                  <p className="text-sm font-medium">New order received</p>
                  <p className="text-xs text-muted-foreground">
                    Order #12345 has been placed
                  </p>
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>
                <div className="flex flex-col gap-1 rounded-md p-2 hover:bg-accent">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">
                    Payment of KSh 50,000 received from John Doe
                  </p>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link to="/notifications">View all notifications</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language & Currency Selector */}
        <LanguageCurrencySelector />

        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
              <DropdownMenuRadioItem value="light">
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Laptop className="mr-2 h-4 w-4" />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback>
                  {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/change-password">
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
