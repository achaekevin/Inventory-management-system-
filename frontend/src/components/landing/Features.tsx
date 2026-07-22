import {
  Package,
  Warehouse,
  ShoppingCart,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  Bell,
  QrCode,
  FileText,
  Building2,
  UserCog,
} from 'lucide-react';
import { Section, SectionHeader } from './Section';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: Package,
    title: 'Product Management',
    description: 'Organize products with categories, brands, units, and detailed specifications. Track SKUs, barcodes, and variants effortlessly.',
  },
  {
    icon: TrendingUp,
    title: 'Inventory Tracking',
    description: 'Real-time stock monitoring with automatic updates. Set reorder points, track stock movements, and prevent stockouts.',
  },
  {
    icon: Warehouse,
    title: 'Multi-Warehouse Support',
    description: 'Manage inventory across multiple warehouses. Transfer stock between locations and maintain separate stock levels.',
  },
  {
    icon: ShoppingCart,
    title: 'Purchase Management',
    description: 'Create purchase orders, receive goods, and manage supplier relationships. Track purchase history and pending orders.',
  },
  {
    icon: Users,
    title: 'Sales & POS',
    description: 'Process sales quickly with an intuitive point-of-sale interface. Generate invoices, handle returns, and manage customer orders.',
  },
  {
    icon: QrCode,
    title: 'Barcode & QR Codes',
    description: 'Generate and scan barcodes and QR codes for products. Speed up inventory counts and reduce manual entry errors.',
  },
  {
    icon: BarChart3,
    title: 'Reporting & Analytics',
    description: 'Comprehensive reports on sales, inventory, purchases, and profitability. Make data-driven decisions with actionable insights.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    description: 'Secure your system with granular permissions. Assign roles with specific access levels to protect sensitive data.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get alerts for low stock, pending orders, and important events. Stay informed with customizable notification preferences.',
  },
  {
    icon: Building2,
    title: 'Customer Management',
    description: 'Maintain detailed customer records, track purchase history, and manage customer balances for better relationships.',
  },
  {
    icon: FileText,
    title: 'Supplier Management',
    description: 'Organize supplier information, track payment terms, and monitor supplier performance for optimal procurement.',
  },
  {
    icon: UserCog,
    title: 'User Management',
    description: 'Create and manage user accounts with different roles. Track user activities with comprehensive audit logs.',
  },
];

export function Features() {
  return (
    <Section id="features" background="muted">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          subtitle="Features"
          title="Everything You Need to Manage Inventory"
          description="Powerful features designed to streamline your operations, from product tracking to advanced analytics."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
