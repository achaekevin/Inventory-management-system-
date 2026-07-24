/**
 * create-admin.js
 * Run with: node create-admin.js
 * Creates the default admin user and ensures roles/permissions are seeded.
 */
require('dotenv').config();
const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('./node_modules/bcryptjs');

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@inventory.com';
const ADMIN_PASSWORD = 'Admin@123';

async function run() {
  console.log('🔗 Connecting to database:', process.env.DATABASE_URL?.slice(0, 40) + '...');

  // ── Check existing roles ──
  const roles = await prisma.role.findMany({ select: { id: true, slug: true, name: true } });
  console.log(`\n📋 Found ${roles.length} roles:`, roles.map(r => r.slug).join(', ') || 'NONE');

  // ── If no roles, seed them first ──
  if (roles.length === 0) {
    console.log('\n⚠️  No roles found. Please run: npx ts-node prisma/seeds/roles-permissions.seed.ts');
    console.log('   Or run the full seed: npx prisma db seed');
    await prisma.$disconnect();
    process.exit(1);
  }

  const superAdminRole = roles.find(r => r.slug === 'super-administrator') || roles[0];
  console.log(`\n✅ Using role: ${superAdminRole.slug}`);

  // ── Hash password ──
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // ── Upsert admin user (reset lock + failed count + set new password) ──
  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: hash,
      isActive: true,
      failedLoginCount: 0,
      lockedUntil: null,
    },
    create: {
      email: ADMIN_EMAIL,
      password: hash,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+254700000000',
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  console.log(`\n👤 Admin user: ${user.email} (${user.id})`);

  // ── Assign role ──
  try {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: superAdminRole.id } },
      update: {},
      create: { userId: user.id, roleId: superAdminRole.id },
    });
    console.log(`🎭 Role assigned: ${superAdminRole.slug}`);
  } catch (e) {
    console.warn('Role assignment warning:', e.message);
  }

  // ── Verify ──
  const verify = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { email: true, isActive: true, failedLoginCount: true, lockedUntil: true },
  });
  console.log('\n✅ Final user state:', JSON.stringify(verify, null, 2));
  console.log('\n🎉 Done!');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);

  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error('\n❌ Error:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});
