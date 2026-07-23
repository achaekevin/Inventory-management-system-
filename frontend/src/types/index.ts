// Common Types
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role?: string
  roles?: string[]
  permissions?: string[]
  isActive?: boolean
  lastLogin?: Date
  createdAt?: Date
  updatedAt?: Date
}

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer'

export type Permission =
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'inventory.view'
  | 'inventory.adjust'
  | 'sales.view'
  | 'sales.create'
  | 'purchases.view'
  | 'purchases.create'
  | 'reports.view'
  | 'users.manage'
  | 'settings.manage'

// Product Types
export interface Product {
  id: string
  sku: string
  barcode?: string
  name: string
  description?: string
  categoryId: string
  category?: Category
  brandId?: string
  brand?: Brand
  unitId: string
  unit?: Unit
  images: string[]
  price: number
  cost: number
  minStock: number
  maxStock: number
  reorderLevel: number
  isActive: boolean
  isFeatured: boolean
  taxable: boolean
  trackInventory: boolean
  hasVariants: boolean
  variants?: ProductVariant[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name: string
  attributes: Record<string, string>
  price: number
  cost: number
  stock: number
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  image?: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Unit {
  id: string
  name: string
  symbol: string
  baseUnit?: string
  conversionFactor?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Inventory Types
export interface InventoryItem {
  id: string
  productId: string
  product?: Product
  warehouseId: string
  warehouse?: Warehouse
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  lastRestocked?: Date
  updatedAt: Date
}

export interface StockMovement {
  id: string
  productId: string
  product?: Product
  warehouseId: string
  warehouse?: Warehouse
  type: StockMovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  referenceType?: string
  referenceId?: string
  notes?: string
  userId: string
  user?: User
  createdAt: Date
}

export type StockMovementType =
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'transfer'
  | 'return'
  | 'damage'
  | 'lost'

export interface StockAdjustment {
  id: string
  productId: string
  warehouseId: string
  adjustmentType: 'increase' | 'decrease'
  quantity: number
  reason: string
  notes?: string
  userId: string
  createdAt: Date
}

// Warehouse Types
export interface Warehouse {
  id: string
  name: string
  code: string
  type: 'main' | 'branch' | 'storage'
  address: Address
  phone?: string
  email?: string
  managerId?: string
  manager?: User
  capacity?: number
  isActive: boolean
  zones?: WarehouseZone[]
  createdAt: Date
  updatedAt: Date
}

export interface WarehouseZone {
  id: string
  warehouseId: string
  name: string
  code: string
  type: string
  capacity?: number
  shelves?: Shelf[]
}

export interface Shelf {
  id: string
  zoneId: string
  code: string
  level: number
  capacity?: number
}

// Customer Types
export interface Customer {
  id: string
  type: 'individual' | 'business'
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phone: string
  address: Address
  billingAddress?: Address
  taxId?: string
  creditLimit?: number
  creditBalance: number
  loyaltyPoints: number
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Supplier Types
export interface Supplier {
  id: string
  name: string
  companyName: string
  email: string
  phone: string
  website?: string
  address: Address
  taxId?: string
  paymentTerms?: string
  creditLimit?: number
  creditBalance: number
  rating?: number
  isActive: boolean
  notes?: string
  contactPerson?: ContactPerson
  createdAt: Date
  updatedAt: Date
}

export interface ContactPerson {
  name: string
  email: string
  phone: string
  position?: string
}

// Address Type
export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

// Purchase Types
export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplier?: Supplier
  warehouseId: string
  warehouse?: Warehouse
  status: PurchaseOrderStatus
  orderDate: Date
  expectedDate?: Date
  receivedDate?: Date
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  discount: number
  shippingCost: number
  total: number
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type PurchaseOrderStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'partial'
  | 'received'
  | 'completed'
  | 'cancelled'

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  productId: string
  product?: Product
  quantity: number
  receivedQuantity: number
  unitPrice: number
  tax: number
  discount: number
  total: number
}

// Sales Types
export interface Sale {
  id: string
  invoiceNumber: string
  customerId?: string
  customer?: Customer
  warehouseId: string
  warehouse?: Warehouse
  status: SaleStatus
  saleDate: Date
  dueDate?: Date
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paidAmount: number
  balanceAmount: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type SaleStatus = 'draft' | 'completed' | 'cancelled' | 'returned'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue'
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'credit'

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  product?: Product
  quantity: number
  unitPrice: number
  tax: number
  discount: number
  total: number
}

// Payment Types
export interface Payment {
  id: string
  paymentNumber: string
  type: 'sale' | 'purchase'
  referenceId: string
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: Date
  notes?: string
  createdBy: string
  createdAt: Date
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: Date
}

export type NotificationType =
  | 'inventory'
  | 'sale'
  | 'purchase'
  | 'payment'
  | 'system'
  | 'alert'

// Activity Log Types
export interface ActivityLog {
  id: string
  userId: string
  user?: User
  action: string
  module: string
  description: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// Report Types
export interface ReportFilter {
  startDate?: Date
  endDate?: Date
  warehouseId?: string
  categoryId?: string
  productId?: string
  customerId?: string
  supplierId?: string
}

export interface SalesReport {
  totalSales: number
  totalRevenue: number
  totalProfit: number
  totalOrders: number
  averageOrderValue: number
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
}

// Settings Types
export interface BusinessSettings {
  companyName: string
  email: string
  phone: string
  address: Address
  logo?: string
  taxId?: string
  currency: string
  timezone: string
  dateFormat: string
  fiscalYearStart: string
}

export interface TaxSettings {
  defaultTaxRate: number
  taxInclusive: boolean
  taxLabel: string
}

// Dashboard Types
export interface DashboardStats {
  totalProducts: number
  totalInventoryValue: number
  totalRevenue: number
  totalProfit: number
  totalExpenses: number
  pendingOrders: number
  lowStockItems: number
  outOfStockItems: number
  totalCustomers: number
  totalSuppliers: number
}

export interface ChartData {
  label: string
  value: number
  date?: string
}
