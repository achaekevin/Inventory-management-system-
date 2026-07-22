// App Constants

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Inventory Management System'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy'
export const DATE_TIME_FORMAT = 'MMM dd, yyyy hh:mm a'
export const TIME_FORMAT = 'hh:mm a'
export const ISO_DATE_FORMAT = 'yyyy-MM-dd'

// Currency
export const DEFAULT_CURRENCY = 'USD'
export const CURRENCY_SYMBOL = '$'

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

// Stock Levels
export const STOCK_STATUS = {
  OUT_OF_STOCK: 'out_of_stock',
  LOW_STOCK: 'low_stock',
  IN_STOCK: 'in_stock',
  OVERSTOCK: 'overstock',
} as const

// Order Status Colors
export const STATUS_COLORS = {
  draft: 'gray',
  pending: 'yellow',
  approved: 'blue',
  completed: 'green',
  cancelled: 'red',
  partial: 'orange',
} as const

// Payment Status
export const PAYMENT_STATUS_COLORS = {
  pending: 'yellow',
  partial: 'orange',
  paid: 'green',
  overdue: 'red',
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const

// Permissions
export const PERMISSIONS = {
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',
  SALES_VIEW: 'sales.view',
  SALES_CREATE: 'sales.create',
  PURCHASES_VIEW: 'purchases.view',
  PURCHASES_CREATE: 'purchases.create',
  REPORTS_VIEW: 'reports.view',
  USERS_MANAGE: 'users.manage',
  SETTINGS_MANAGE: 'settings.manage',
} as const

// API Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
  LANGUAGE: 'language',
  WAREHOUSE: 'selected_warehouse',
  COMPANY: 'selected_company',
} as const

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

// Chart Colors
export const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--info))',
  'hsl(var(--destructive))',
  'hsl(var(--secondary))',
]

// Notification Types
export const NOTIFICATION_TYPES = {
  INVENTORY: 'inventory',
  SALE: 'sale',
  PURCHASE: 'purchase',
  PAYMENT: 'payment',
  SYSTEM: 'system',
  ALERT: 'alert',
} as const

// Activity Modules
export const ACTIVITY_MODULES = {
  AUTH: 'auth',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  SALES: 'sales',
  PURCHASES: 'purchases',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  USERS: 'users',
  SETTINGS: 'settings',
} as const

// Export Formats
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
} as const

// Stock Movement Types
export const STOCK_MOVEMENT_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
  RETURN: 'return',
  DAMAGE: 'damage',
  LOST: 'lost',
} as const

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'credit', label: 'Credit' },
] as const

// Countries (Sample - add more as needed)
export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'ZA', name: 'South Africa' },
] as const

// Timezones (Sample)
export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
] as const

// Currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
] as const
