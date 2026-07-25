import { createBrowserRouter, Navigate } from 'react-router'
import { MainLayout } from '@/layouts/main-layout'
import { AuthLayout } from '@/layouts/auth-layout'
import { 
  LoginPage, 
  ForgotPasswordPage, 
  ResetPasswordPage,
  VerifyOTPPage,
  LockScreenPage,
  SessionExpiredPage,
} from '@/features/auth/pages'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/features/dashboard/pages'
import { ProductsListPage, ProductFormPage } from '@/features/products/pages'
import { CategoriesListPage } from '@/features/categories/pages'
import { BrandsListPage } from '@/features/brands/pages'
import { SuppliersListPage, SupplierFormPage } from '@/features/suppliers/pages'
import { CustomersListPage, CustomerFormPage } from '@/features/customers/pages'
import { InventoryListPage, StockMovementsPage } from '@/features/inventory/pages'
import { PurchasesListPage } from '@/features/purchases/pages'
import { SalesListPage, POSPage } from '@/features/sales/pages'
import { ReportsPage } from '@/features/reports/pages'
import { UsersListPage } from '@/features/users/pages'
import { SettingsPage } from '@/features/settings/pages'
import { ProfilePage } from '@/features/profile/pages/profile-page'
import { PaymentsListPage } from '@/features/payments/pages'
import { WarehousesListPage } from '@/features/warehouses/pages'
import { SmartReorderPage } from '@/features/reorder/pages/smart-reorder-page'
import { PurchaseApprovalPage } from '@/features/workflow/pages/purchase-approval-page'
import { CustomerCreditPage } from '@/features/credit/pages/customer-credit-page'
import { WorkflowAutomationPage } from '@/features/automation/pages/workflow-automation-page'
import { DocumentsPage } from '@/features/documents/pages/documents-page'
import { SaleDetailPage } from '@/features/sales/pages/sale-detail-page'
import { SearchPage } from '@/pages/search-page'
import { LocalizationSettingsPage } from '@/features/localization/pages/localization-settings-page'
import { SecurityCenterPage } from '@/features/security/pages/security-center-page'

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken')
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Public Route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token')
  const isAuthenticated = Boolean(token && token !== 'undefined' && token !== 'null')
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app/*',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        ),
      },
      {
        path: 'verify-otp',
        element: (
          <PublicRoute>
            <VerifyOTPPage />
          </PublicRoute>
        ),
      },
      {
        path: 'lock-screen',
        element: <LockScreenPage />,
      },
      {
        path: 'session-expired',
        element: <SessionExpiredPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // Products
      {
        path: 'products',
        element: <ProductsListPage />,
      },
      {
        path: 'products/new',
        element: <ProductFormPage />,
      },
      {
        path: 'products/:id/edit',
        element: <ProductFormPage />,
      },
      // Categories
      {
        path: 'categories',
        element: <CategoriesListPage />,
      },
      // Brands
      {
        path: 'brands',
        element: <BrandsListPage />,
      },
      // Suppliers
      {
        path: 'suppliers',
        element: <SuppliersListPage />,
      },
      {
        path: 'suppliers/new',
        element: <SupplierFormPage />,
      },
      {
        path: 'suppliers/:id/edit',
        element: <SupplierFormPage />,
      },
      // Customers
      {
        path: 'customers',
        element: <CustomersListPage />,
      },
      {
        path: 'customers/new',
        element: <CustomerFormPage />,
      },
      {
        path: 'customers/:id/edit',
        element: <CustomerFormPage />,
      },
      // Inventory
      {
        path: 'inventory',
        element: <InventoryListPage />,
      },
      {
        path: 'inventory/movements',
        element: <StockMovementsPage />,
      },
      // Purchases
      {
        path: 'purchases',
        element: <PurchasesListPage />,
      },
      // Sales
      {
        path: 'sales',
        element: <SalesListPage />,
      },
      {
        path: 'sales/pos',
        element: <POSPage />,
      },
      // Reports
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      // Users
      {
        path: 'users',
        element: <UsersListPage />,
      },
      // Settings
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      // Warehouses
      {
        path: 'warehouses',
        element: <WarehousesListPage />,
      },
      {
        path: 'payments',
        element: <PaymentsListPage />,
      },
      {
        path: 'notifications',
        element: <div className="p-6">Notifications Module - Coming Soon</div>,
      },
      // Smart Reorder
      {
        path: 'reorder',
        element: <SmartReorderPage />,
      },
      // Purchase Approval Workflow
      {
        path: 'approvals',
        element: <PurchaseApprovalPage />,
      },
      // Customer Credit Management
      {
        path: 'credit',
        element: <CustomerCreditPage />,
      },
      // Workflow Automation
      {
        path: 'automation',
        element: <WorkflowAutomationPage />,
      },
      // Document Management
      {
        path: 'documents',
        element: <DocumentsPage />,
      },
      // Sale Detail
      {
        path: 'sales/:id',
        element: <SaleDetailPage />,
      },
      // Profile
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      // Search
      {
        path: 'search',
        element: <SearchPage />,
      },
      // Localization
      {
        path: 'localization',
        element: <LocalizationSettingsPage />,
      },
      // Security Center
      {
        path: 'security-center',
        element: <SecurityCenterPage />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    ),
  },
])
