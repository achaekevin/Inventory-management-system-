import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import seedRolesAndPermissions from './seeds/roles-permissions.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Seed roles and permissions
  await seedRolesAndPermissions();

  // Create default Super Administrator user
  console.log('Creating default Super Administrator...');
  
  // Default seed password (configurable via SEED_DEFAULT_PASSWORD env var)
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'Admin@123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);
  
  const superAdminRole = await prisma.role.findUnique({
    where: { slug: 'super-administrator' },
  });

  if (!superAdminRole) {
    throw new Error('Super Administrator role not found');
  }

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      email: 'admin@inventory.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567890',
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Assign Super Administrator role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log('  ✓ Super Administrator created');
  console.log('    Email: admin@inventory.com');
  console.log('    Password: Admin@123');
  console.log('    Role: Super Administrator\n');

  // Create demo users for each role
  console.log('Creating demo users for each role...');

  const demoUsers = [
    {
      email: 'inventory@inventory.com',
      password: 'Inventory@123',
      firstName: 'John',
      lastName: 'Inventory',
      phone: '+1234567891',
      roleSlug: 'inventory-manager',
    },
    {
      email: 'procurement@inventory.com',
      password: 'Procurement@123',
      firstName: 'Jane',
      lastName: 'Procurement',
      phone: '+1234567892',
      roleSlug: 'procurement-officer',
    },
    {
      email: 'sales@inventory.com',
      password: 'Sales@123',
      firstName: 'Mike',
      lastName: 'Sales',
      phone: '+1234567893',
      roleSlug: 'sales-pos-officer',
    },
    {
      email: 'finance@inventory.com',
      password: 'Finance@123',
      firstName: 'Sarah',
      lastName: 'Finance',
      phone: '+1234567894',
      roleSlug: 'finance-reports-manager',
    },
  ];

  for (const userData of demoUsers) {
    const hashedPass = await bcrypt.hash(userData.password, 12);
    const role = await prisma.role.findUnique({
      where: { slug: userData.roleSlug },
    });

    if (!role) continue;

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPass,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });

    console.log(`  ✓ ${userData.firstName} ${userData.lastName} (${role.name})`);
    console.log(`    Email: ${userData.email}`);
    console.log(`    Password: ${userData.password}`);
  }

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('═══════════════════════════════════════════');
  console.log('Default Login Credentials:');
  console.log('═══════════════════════════════════════════');
  console.log('Super Administrator:');
  console.log('  Email: admin@inventory.com');
  console.log('  Password: Admin@123');
  console.log('\nInventory Manager:');
  console.log('  Email: inventory@inventory.com');
  console.log('  Password: Inventory@123');
  console.log('\nProcurement Officer:');
  console.log('  Email: procurement@inventory.com');
  console.log('  Password: Procurement@123');
  console.log('\nSales & POS Officer:');
  console.log('  Email: sales@inventory.com');
  console.log('  Password: Sales@123');
  console.log('\nFinance & Reports Manager:');
  console.log('  Email: finance@inventory.com');
  console.log('  Password: Finance@123');
  console.log('═══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
