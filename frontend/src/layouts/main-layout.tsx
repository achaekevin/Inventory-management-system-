import { Outlet } from 'react-router'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { CommandPalette } from '@/components/shared/command-palette'
import { useUIStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'

export function MainLayout() {
  const { isSidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div
        className={cn(
          'flex flex-col transition-all duration-300',
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Header />
        
        <main className="flex-1 p-6">
          <div className="mb-4">
            <Breadcrumbs />
          </div>
          
          <Outlet />
        </main>

        <footer className="border-t py-4 px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} InvenTrack. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
      <CommandPalette />
    </div>
  )
}
