import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { capitalize } from '@/utils/format'

export function Breadcrumbs() {
  const location = useLocation()
  
  const pathnames = location.pathname.split('/').filter((x) => x)

  if (pathnames.length === 0 || pathnames[0] === 'dashboard') {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        
        // Skip IDs in breadcrumbs (simple check if it's all numbers)
        if (/^\d+$/.test(name) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name)) {
          return null
        }

        return (
          <div key={routeTo} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {capitalize(name.replace(/-/g, ' '))}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-foreground transition-colors"
              >
                {capitalize(name.replace(/-/g, ' '))}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
