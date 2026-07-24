import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportFilters {
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface SaleReportRow {
  id: string
  invoiceNumber: string
  date: string
  customerName: string
  items: number
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: string
}

export interface InventoryReportRow {
  id: string
  sku: string
  name: string
  category: string
  unit: string
  currentStock: number
  minStock: number
  reorderLevel: number
  costPrice: number
  salePrice: number
  stockValue: number
  status: string
}

export interface PurchaseReportRow {
  id: string
  poNumber: string
  date: string
  supplierName: string
  items: number
  subtotal: number
  tax: number
  total: number
  status: string
}

export interface CustomerReportRow {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  creditLimit: number
  creditBalance: number
  status: string
}

export interface ProfitLossRow {
  period: string
  revenue: number
  costOfGoods: number
  grossProfit: number
  grossMargin: number
}

// ─── API fetchers ─────────────────────────────────────────────────────────────

async function fetchSalesReport(filters: ReportFilters) {
  const params = new URLSearchParams()
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  const res = await apiClient.get<any>(`/sales?${params}`)
  const raw: any[] = res.data || []
  return raw.map((s): SaleReportRow => ({
    id: s.id,
    invoiceNumber: s.invoiceNumber || `INV-${s.id.slice(0, 8).toUpperCase()}`,
    date: new Date(s.createdAt).toLocaleDateString('en-KE'),
    customerName: s.customer?.name || 'Walk-in',
    items: s.items?.length || 0,
    subtotal: s.subtotal || s.total || 0,
    tax: s.tax || 0,
    discount: s.discount || 0,
    total: s.total || 0,
    paymentMethod: s.paymentMethod || 'cash',
    paymentStatus: s.paymentStatus || 'paid',
  }))
}

async function fetchInventoryReport() {
  const res = await apiClient.get<any>('/products?pageSize=500')
  const raw: any[] = res.data || []
  return raw.map((p): InventoryReportRow => {
    const currentStock = p.currentStock || 0
    const costPrice = p.cost || 0
    return {
      id: p.id,
      sku: p.sku || '',
      name: p.name || '',
      category: p.category?.name || '',
      unit: p.unit?.name || '',
      currentStock,
      minStock: p.minStock || 0,
      reorderLevel: p.reorderLevel || 0,
      costPrice,
      salePrice: p.price || 0,
      stockValue: currentStock * costPrice,
      status: currentStock <= 0 ? 'Out of Stock' : currentStock <= (p.minStock || 0) ? 'Low Stock' : 'In Stock',
    }
  })
}

async function fetchPurchaseReport(filters: ReportFilters) {
  const params = new URLSearchParams()
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  const res = await apiClient.get<any>(`/purchases?${params}`)
  const raw: any[] = res.data || []
  return raw.map((p): PurchaseReportRow => ({
    id: p.id,
    poNumber: p.poNumber || `PO-${p.id.slice(0, 8).toUpperCase()}`,
    date: new Date(p.createdAt).toLocaleDateString('en-KE'),
    supplierName: p.supplier?.name || '—',
    items: p.items?.length || 0,
    subtotal: p.subtotal || p.totalAmount || 0,
    tax: p.tax || 0,
    total: p.totalAmount || p.total || 0,
    status: p.status || '—',
  }))
}

async function fetchCustomerReport() {
  const res = await apiClient.get<any>('/customers?pageSize=500')
  const raw: any[] = res.data || []
  return raw.map((c): CustomerReportRow => ({
    id: c.id,
    name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
    email: c.email || '',
    phone: c.phone || '',
    totalOrders: c.totalOrders || 0,
    totalSpent: c.totalSpent || 0,
    creditLimit: c.creditLimit || 0,
    creditBalance: c.creditBalance || 0,
    status: c.isActive ? 'Active' : 'Inactive',
  }))
}

// ─── React Query hooks ────────────────────────────────────────────────────────

export function useSalesReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'sales', filters],
    queryFn: () => fetchSalesReport(filters),
    enabled,
    staleTime: 60_000,
  })
}

export function useInventoryReport(enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: fetchInventoryReport,
    enabled,
    staleTime: 60_000,
  })
}

export function usePurchaseReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'purchases', filters],
    queryFn: () => fetchPurchaseReport(filters),
    enabled,
    staleTime: 60_000,
  })
}

export function useCustomerReport(enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'customers'],
    queryFn: fetchCustomerReport,
    enabled,
    staleTime: 60_000,
  })
}
