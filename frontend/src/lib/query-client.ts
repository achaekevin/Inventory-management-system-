import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 0,
    },
  },
})

// Query Keys Factory
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    charts: (filter?: any) => [...queryKeys.dashboard.all, 'charts', filter] as const,
  },

  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.categories.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.categories.all, 'detail', id] as const,
  },

  // Brands
  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.brands.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.brands.all, 'detail', id] as const,
  },

  // Inventory
  inventory: {
    all: ['inventory'] as const,
    lists: () => [...queryKeys.inventory.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.inventory.lists(), filters] as const,
    movements: (filters?: any) => [...queryKeys.inventory.all, 'movements', filters] as const,
    lowStock: () => [...queryKeys.inventory.all, 'lowStock'] as const,
  },

  // Customers
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.customers.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
  },

  // Suppliers
  suppliers: {
    all: ['suppliers'] as const,
    lists: () => [...queryKeys.suppliers.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.suppliers.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.suppliers.all, 'detail', id] as const,
  },

  // Warehouses
  warehouses: {
    all: ['warehouses'] as const,
    lists: () => [...queryKeys.warehouses.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.warehouses.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.warehouses.all, 'detail', id] as const,
  },

  // Purchases
  purchases: {
    all: ['purchases'] as const,
    lists: () => [...queryKeys.purchases.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.purchases.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.purchases.all, 'detail', id] as const,
  },

  // Sales
  sales: {
    all: ['sales'] as const,
    lists: () => [...queryKeys.sales.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.sales.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.sales.all, 'detail', id] as const,
    stats: (period?: string) => [...queryKeys.sales.all, 'stats', period] as const,
  },

  // Payments
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.payments.lists(), filters] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    sales: (filters?: any) => [...queryKeys.reports.all, 'sales', filters] as const,
    purchases: (filters?: any) => [...queryKeys.reports.all, 'purchases', filters] as const,
    inventory: (filters?: any) => [...queryKeys.reports.all, 'inventory', filters] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.users.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.notifications.lists(), filters] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    business: () => [...queryKeys.settings.all, 'business'] as const,
    tax: () => [...queryKeys.settings.all, 'tax'] as const,
  },
}
