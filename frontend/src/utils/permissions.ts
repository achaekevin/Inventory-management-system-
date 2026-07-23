import { User } from '@/types'

export type RoleCategory = 
  | 'super-admin'
  | 'inventory-manager'
  | 'procurement-officer'
  | 'sales-officer'
  | 'finance-manager'
  | 'general-user'

export function getUserRoleSlugs(user: User | null): string[] {
  if (!user) return []
  if (Array.isArray(user.roles)) {
    return user.roles.map(r => String(r).toLowerCase())
  }
  if (typeof user.role === 'string') {
    return [user.role.toLowerCase()]
  }
  return []
}

export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false
  const roles = getUserRoleSlugs(user)
  return roles.some(r => 
    r === 'super-administrator' || 
    r === 'super_admin' || 
    r === 'admin' || 
    r.includes('super') || 
    r.includes('admin')
  )
}

export function getPrimaryRoleCategory(user: User | null): RoleCategory {
  if (!user) return 'general-user'
  
  if (isSuperAdmin(user)) {
    return 'super-admin'
  }
  
  const roles = getUserRoleSlugs(user)
  
  if (roles.some(r => r.includes('inventory') || r.includes('warehouse') || r.includes('stock'))) {
    return 'inventory-manager'
  }
  
  if (roles.some(r => r.includes('procurement') || r.includes('purchase') || r.includes('supplier'))) {
    return 'procurement-officer'
  }
  
  if (roles.some(r => r.includes('sales') || r.includes('pos') || r.includes('cashier'))) {
    return 'sales-officer'
  }
  
  if (roles.some(r => r.includes('finance') || r.includes('report') || r.includes('account'))) {
    return 'finance-manager'
  }
  
  return 'general-user'
}

export function isAllowedRoute(user: User | null, href: string): boolean {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  
  const roleCat = getPrimaryRoleCategory(user)
  
  switch (href) {
    case '/dashboard':
      return true
    case '/products':
    case '/categories':
    case '/inventory':
    case '/warehouses':
      return roleCat === 'inventory-manager' || roleCat === 'procurement-officer' || roleCat === 'sales-officer'
    case '/sales':
    case '/customers':
      return roleCat === 'sales-officer' || roleCat === 'finance-manager'
    case '/purchases':
    case '/suppliers':
      return roleCat === 'procurement-officer' || roleCat === 'finance-manager'
    case '/payments':
    case '/reports':
      return roleCat === 'finance-manager' || roleCat === 'sales-officer'
    case '/users':
    case '/settings':
      return false // Admin only
    default:
      return true
  }
}
