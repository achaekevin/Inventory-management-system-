/**
 * seed-all-users.js
 * Comprehensive seed script to create all permissions, roles, and default system users.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

  // Expenses
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

const rolesWithPermissions = {
  'Super Administrator': {
    description: 'Full system access with all permissions',
    slug: 'super-administrator',
    permissions: permissions.map((p) => p.slug),
  },
  'Inventory Manager': {
    description: 'Manages inventory, products, and warehouse operations',
    slug: 'inventory-manager',
    permissions: [
      'dashboard.view',
      'products.create', 'products.view', 'products.update',
      'categories.create', 'categories.view', 'categories.update', 'categories.delete',
      'brands.create', 'brands.view', 'brands.update', 'brands.delete',
      'units.create', 'units.view', 'units.update', 'units.delete',
      'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.audit',
      'warehouses.create', 'warehouses.view', 'warehouses.update', 'warehouses.delete',
      'reports.inventory',
      'notifications.view',
    ],
  },
  'Procurement Officer': {
    description: 'Handles purchasing and supplier management',
    slug: 'procurement-officer',
    permissions: [
      'dashboard.view',
      'suppliers.create', 'suppliers.view', 'suppliers.update', 'suppliers.delete',
      'purchases.create', 'purchases.view', 'purchases.update', 'purchases.approve', 'purchases.receive', 'purchases.delete',
      'inventory.view',
      'products.view',
      'warehouses.view',
      'reports.purchase', 'reports.suppliers',
      'notifications.view',
    ],
  },
  'Sales & POS Officer': {
    description: 'Manages sales, POS, and customer operations',
    slug: 'sales-pos-officer',
    permissions: [
      'dashboard.view',
      'customers.create', 'customers.view', 'customers.update', 'customers.delete',
      'sales.create', 'sales.view', 'sales.update', 'sales.return', 'sales.delete',
      'pos.use',
      'payments.create', 'payments.view',
      'products.view',
      'inventory.view',
      'warehouses.view',
      'reports.sales', 'reports.customers',
      'notifications.view',
    ],
  },
  'Finance & Reports Manager': {
    description: 'Oversees financial operations and business reporting',
    slug: 'finance-reports-manager',
    permissions: [
      'dashboard.view',
      'payments.create', 'payments.view', 'payments.update', 'payments.delete',
      'expenses.create', 'expenses.view', 'expenses.update', 'expenses.delete',
      'reports.sales', 'reports.inventory', 'reports.purchase', 'reports.finance', 'reports.customers', 'reports.suppliers', 'reports.export',
      'customers.view', 'suppliers.view', 'products.view', 'inventory.view', 'sales.view', 'purchases.view',
      'audit.view',
      'notifications.view',
    ],
  },
};

const defaultUsers = [
  {
    email: 'admin@inventory.com',
    password: 'Admin@123',
    firstName: 'Super',
    lastName: 'Administrator',
    roleSlug: 'super-administrator',
    phone: '+254700000001',
  },
  {
    email: 'inventory@inventory.com',
    password: 'Inventory@123',
    firstName: 'Inventory',
    lastName: 'Manager',
    roleSlug: 'inventory-manager',
    phone: '+254700000002',
  },
  {
    email: 'procurement@inventory.com',
    password: 'Procurement@123',
    firstName: 'Procurement',
    lastName: 'Officer',
    roleSlug: 'procurement-officer',
    phone: '+254700000003',
  },
  {
    email: 'sales@inventory.com',
    password: 'Sales@123',
    firstName: 'Sales',
    lastName: 'Officer',
    roleSlug: 'sales-pos-officer',
    phone: '+254700000004',
  },
  {
    email: 'finance@inventory.com',
    password: 'Finance@123',
    firstName: 'Finance',
    lastName: 'Manager',
    roleSlug: 'finance-reports-manager',
    phone: '+254700000005',
  },
];

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // 1. Seed Permissions
  console.log('1. Seeding permissions...');
  const createdPermissions = {};
  for (const perm of permissions) {
    const created = await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: perm,
      create: perm,
    });
    createdPermissions[perm.slug] = created;
  }
  console.log(`   ✓ Created/updated ${Object.keys(createdPermissions).length} permissions.`);

  // 2. Seed Roles & Assign Permissions
  console.log('\n2. Seeding roles and role-permissions...');
  const createdRoles = {};
  for (const [roleName, roleData] of Object.entries(rolesWithPermissions)) {
    const role = await prisma.role.upsert({
      where: { slug: roleData.slug },
      update: { name: roleName, description: roleData.description },
      create: { name: roleName, slug: roleData.slug, description: roleData.description },
    });
    createdRoles[roleData.slug] = role;

    // Attach permissions
    for (const permSlug of roleData.permissions) {
      const perm = createdPermissions[permSlug];
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: perm.id },
          },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
    console.log(`   ✓ Role '${roleName}' (${roleData.slug}) configured with ${roleData.permissions.length} permissions.`);
  }

  // 3. Seed Users
  console.log('\n3. Seeding default system users...');
  for (const userData of defaultUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const role = createdRoles[userData.roleSlug];

    if (!role) {
      console.error(`   ❌ Role ${userData.roleSlug} not found for ${userData.email}`);
      continue;
    }

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isActive: true,
        failedLoginCount: 0,
        lockedUntil: null,
      },
      create: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });

    // Assign Role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: user.id, roleId: role.id },
      },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });

    console.log(`   ✓ User created/updated: ${userData.email} | Password: ${userData.password} | Role: ${role.name}`);
  }

  console.log('\n🎉 Database seeding completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
