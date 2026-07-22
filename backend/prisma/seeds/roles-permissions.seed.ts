import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define all permissions organized by module
const permissions = [
  // Dashboard
  { name: 'View Dashboard', slug: 'dashboard.view', module: 'dashboard' },

  // Products
  { name: 'Create Products', slug: 'products.create', module: 'products' },
  { name: 'View Products', slug: 'products.view', module: 'products' },
  { name: 'Update Products', slug: 'products.update', module: 'products' },
  { name: 'Delete Products', slug: 'products.delete', module: 'products' },

  // Categories
  { name: 'Create Categories', slug: 'categories.create', module: 'categories' },
  { name: 'View Categories', slug: 'categories.view', module: 'categories' },
  { name: 'Update Categories', slug: 'categories.update', module: 'categories' },
  { name: 'Delete Categories', slug: 'categories.delete', module: 'categories' },

  // Brands
  { name: 'Create Brands', slug: 'brands.create', module: 'brands' },
  { name: 'View Brands', slug: 'brands.view', module: 'brands' },
  { name: 'Update Brands', slug: 'brands.update', module: 'brands' },
  { name: 'Delete Brands', slug: 'brands.delete', module: 'brands' },

  // Units
  { name: 'Create Units', slug: 'units.create', module: 'units' },
  { name: 'View Units', slug: 'units.view', module: 'units' },
  { name: 'Update Units', slug: 'units.update', module: 'units' },
  { name: 'Delete Units', slug: 'units.delete', module: 'units' },

  // Inventory
  { name: 'View Inventory', slug: 'inventory.view', module: 'inventory' },
  { name: 'Adjust Inventory', slug: 'inventory.adjust', module: 'inventory' },
  { name: 'Transfer Stock', slug: 'inventory.transfer', module: 'inventory' },
  { name: 'Audit Inventory', slug: 'inventory.audit', module: 'inventory' },
  { name: 'Delete Inventory', slug: 'inventory.delete', module: 'inventory' },

  // Warehouses
  { name: 'Create Warehouses', slug: 'warehouses.create', module: 'warehouses' },
  { name: 'View Warehouses', slug: 'warehouses.view', module: 'warehouses' },
  { name: 'Update Warehouses', slug: 'warehouses.update', module: 'warehouses' },
  { name: 'Delete Warehouses', slug: 'warehouses.delete', module: 'warehouses' },

  // Suppliers
  { name: 'Create Suppliers', slug: 'suppliers.create', module: 'suppliers' },
  { name: 'View Suppliers', slug: 'suppliers.view', module: 'suppliers' },
  { name: 'Update Suppliers', slug: 'suppliers.update', module: 'suppliers' },
  { name: 'Delete Suppliers', slug: 'suppliers.delete', module: 'suppliers' },

  // Customers
  { name: 'Create Customers', slug: 'customers.create', module: 'customers' },
  { name: 'View Customers', slug: 'customers.view', module: 'customers' },
  { name: 'Update Customers', slug: 'customers.update', module: 'customers' },
  { name: 'Delete Customers', slug: 'customers.delete', module: 'customers' },

  // Purchases
  { name: 'Create Purchases', slug: 'purchases.create', module: 'purchases' },
  { name: 'View Purchases', slug: 'purchases.view', module: 'purchases' },
  { name: 'Update Purchases', slug: 'purchases.update', module: 'purchases' },
  { name: 'Approve Purchases', slug: 'purchases.approve', module: 'purchases' },
  { name: 'Receive Purchases', slug: 'purchases.receive', module: 'purchases' },
  { name: 'Delete Purchases', slug: 'purchases.delete', module: 'purchases' },

  // Sales
  { name: 'Create Sales', slug: 'sales.create', module: 'sales' },
  { name: 'View Sales', slug: 'sales.view', module: 'sales' },
  { name: 'Update Sales', slug: 'sales.update', module: 'sales' },
  { name: 'Return Sales', slug: 'sales.return', module: 'sales' },
  { name: 'Delete Sales', slug: 'sales.delete', module: 'sales' },

  // POS
  { name: 'Use POS', slug: 'pos.use', module: 'pos' },

  // Payments
  { name: 'Create Payments', slug: 'payments.create', module: 'payments' },
  { name: 'View Payments', slug: 'payments.view', module: 'payments' },
  { name: 'Update Payments', slug: 'payments.update', module: 'payments' },
  { name: 'Delete Payments', slug: 'payments.delete', module: 'payments' },

  // Expenses (future module)
  { name: 'Create Expenses', slug: 'expenses.create', module: 'expenses' },
  { name: 'View Expenses', slug: 'expenses.view', module: 'expenses' },
  { name: 'Update Expenses', slug: 'expenses.update', module: 'expenses' },
  { name: 'Delete Expenses', slug: 'expenses.delete', module: 'expenses' },

  // Reports
  { name: 'View Sales Reports', slug: 'reports.sales', module: 'reports' },
  { name: 'View Inventory Reports', slug: 'reports.inventory', module: 'reports' },
  { name: 'View Purchase Reports', slug: 'reports.purchase', module: 'reports' },
  { name: 'View Finance Reports', slug: 'reports.finance', module: 'reports' },
  { name: 'View Customer Reports', slug: 'reports.customers', module: 'reports' },
  { name: 'View Supplier Reports', slug: 'reports.suppliers', module: 'reports' },
  { name: 'Export Reports', slug: 'reports.export', module: 'reports' },

  // Notifications
  { name: 'View Notifications', slug: 'notifications.view', module: 'notifications' },

  // Audit Logs
  { name: 'View Audit Logs', slug: 'audit.view', module: 'audit' },

  // Settings
  { name: 'Manage Settings', slug: 'settings.manage', module: 'settings' },

  // Users
  { name: 'Create Users', slug: 'users.create', module: 'users' },
  { name: 'View Users', slug: 'users.view', module: 'users' },
  { name: 'Update Users', slug: 'users.update', module: 'users' },
  { name: 'Delete Users', slug: 'users.delete', module: 'users' },

  // Roles
  { name: 'Manage Roles', slug: 'roles.manage', module: 'roles' },

  // Permissions
  { name: 'Manage Permissions', slug: 'permissions.manage', module: 'permissions' },

  // Backup
  { name: 'Create Backup', slug: 'backup.create', module: 'backup' },
  { name: 'Restore Backup', slug: 'backup.restore', module: 'backup' },
];

// Define roles with their permissions
const rolesWithPermissions = {
  'Super Administrator': {
    description: 'Full system access with all permissions',
    slug: 'super-administrator',
    permissions: permissions.map((p) => p.slug), // All permissions
  },
  'Inventory Manager': {
    description: 'Manages inventory, products, and warehouse operations',
    slug: 'inventory-manager',
    permissions: [
      'dashboard.view',
      // Products - Create, Read, Update (No Delete)
      'products.create',
      'products.view',
      'products.update',
      // Categories - Full access
      'categories.create',
      'categories.view',
      'categories.update',
      'categories.delete',
      // Brands - Full access
      'brands.create',
      'brands.view',
      'brands.update',
      'brands.delete',
      // Units - Full access
      'units.create',
      'units.view',
      'units.update',
      'units.delete',
      // Inventory - Full access
      'inventory.view',
      'inventory.adjust',
      'inventory.transfer',
      'inventory.audit',
      // Warehouses - Full access
      'warehouses.create',
      'warehouses.view',
      'warehouses.update',
      'warehouses.delete',
      // Reports - Inventory only
      'reports.inventory',
      // Notifications
      'notifications.view',
    ],
  },
  'Procurement Officer': {
    description: 'Handles purchasing and supplier management',
    slug: 'procurement-officer',
    permissions: [
      'dashboard.view',
      // Suppliers - Full CRUD
      'suppliers.create',
      'suppliers.view',
      'suppliers.update',
      'suppliers.delete',
      // Purchases - Full CRUD
      'purchases.create',
      'purchases.view',
      'purchases.update',
      'purchases.approve',
      'purchases.receive',
      'purchases.delete',
      // Inventory - Limited (view and update through purchases)
      'inventory.view',
      // Products - View only
      'products.view',
      // Warehouses - View only
      'warehouses.view',
      // Reports - Purchase and Supplier reports
      'reports.purchase',
      'reports.suppliers',
      // Notifications
      'notifications.view',
    ],
  },
  'Sales & POS Officer': {
    description: 'Manages sales, POS, and customer operations',
    slug: 'sales-pos-officer',
    permissions: [
      'dashboard.view',
      // Customers - Full CRUD
      'customers.create',
      'customers.view',
      'customers.update',
      'customers.delete',
      // Sales - Full CRUD
      'sales.create',
      'sales.view',
      'sales.update',
      'sales.return',
      'sales.delete',
      // POS - Full access
      'pos.use',
      // Payments - Customer payments
      'payments.create',
      'payments.view',
      // Products - View only
      'products.view',
      // Inventory - View only
      'inventory.view',
      // Warehouses - View only
      'warehouses.view',
      // Reports - Sales and Customer reports
      'reports.sales',
      'reports.customers',
      // Notifications
      'notifications.view',
    ],
  },
  'Finance & Reports Manager': {
    description: 'Oversees financial operations and business reporting',
    slug: 'finance-reports-manager',
    permissions: [
      'dashboard.view',
      // Payments - Full CRUD
      'payments.create',
      'payments.view',
      'payments.update',
      'payments.delete',
      // Expenses - Full CRUD
      'expenses.create',
      'expenses.view',
      'expenses.update',
      'expenses.delete',
      // Reports - All financial reports
      'reports.sales',
      'reports.inventory',
      'reports.purchase',
      'reports.finance',
      'reports.customers',
      'reports.suppliers',
      'reports.export',
      // View only access
      'customers.view',
      'suppliers.view',
      'products.view',
      'inventory.view',
      'sales.view',
      'purchases.view',
      // Audit logs
      'audit.view',
      // Notifications
      'notifications.view',
    ],
  },
};

export async function seedRolesAndPermissions() {
  console.log('🌱 Seeding roles and permissions...');

  try {
    // Create all permissions
    console.log('Creating permissions...');
    const createdPermissions: any = {};
    
    for (const permission of permissions) {
      const created = await prisma.permission.upsert({
        where: { slug: permission.slug },
        update: permission,
        create: permission,
      });
      createdPermissions[permission.slug] = created;
      console.log(`  ✓ ${permission.name}`);
    }

    console.log(`\n✅ Created ${Object.keys(createdPermissions).length} permissions\n`);

    // Create roles and assign permissions
    console.log('Creating roles...');
    
    for (const [roleName, roleData] of Object.entries(rolesWithPermissions)) {
      const role = await prisma.role.upsert({
        where: { slug: roleData.slug },
        update: {
          name: roleName,
          description: roleData.description,
        },
        create: {
          name: roleName,
          slug: roleData.slug,
          description: roleData.description,
        },
      });

      // Assign permissions to role
      for (const permissionSlug of roleData.permissions) {
        const permission = createdPermissions[permissionSlug];
        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }

      console.log(`  ✓ ${roleName} (${roleData.permissions.length} permissions)`);
    }

    console.log('\n✅ Roles and permissions seeded successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
    throw error;
  }
}

export default seedRolesAndPermissions;
