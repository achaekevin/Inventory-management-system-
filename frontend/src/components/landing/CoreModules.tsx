import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Award,
  Warehouse,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  Users,
  Building,
  FileBarChart,
  UserCog,
  Settings,
} from 'lucide-react';
import { Section, SectionHeader } from './Section';
import { Card } from '@/components/ui/card';

const modules = [
  {
    icon: LayoutDashboard,
    name: 'Dashboard',
    description: 'Real-time overview with KPIs, charts, and quick actions',
  },
  {
    icon: Package,
    name: 'Products',
    description: 'Complete product catalog with variants and specifications',
  },
  {
    icon: FolderTree,
    name: 'Categories',
    description: 'Organize products into hierarchical categories',
  },
  {
    icon: Award,
    name: 'Brands',
    description: 'Manage product brands and manufacturer information',
  },
  {
    icon: Warehouse,
    name: 'Inventory',
    description: 'Track stock levels, movements, and adjustments',
  },
  {
    icon: MapPin,
    name: 'Warehouses',
    description: 'Multi-location inventory management and transfers',
  },
  {
    icon: ShoppingBag,
    name: 'Purchases',
    description: 'Purchase orders, goods receiving, and supplier payments',
  },
  {
    icon: ShoppingCart,
    name: 'Sales',
    description: 'Sales orders, invoicing, and customer payments',
  },
  {
    icon: Users,
    name: 'Customers',
    description: 'Customer database with purchase history and balances',
  },
  {
    icon: Building,
    name: 'Suppliers',
    description: 'Supplier management with payment terms and performance',
  },
  {
    icon: FileBarChart,
    name: 'Reports',
    description: 'Comprehensive analytics and exportable reports',
  },
  {
    icon: UserCog,
    name: 'Users & Roles',
    description: 'User management with role-based access control',
  },
  {
    icon: Settings,
    name: 'Settings',
    description: 'System configuration and business preferences',
  },
];

export function CoreModules() {
  return (
    <Section id="solutions">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          subtitle="Core Modules"
          title="Complete Inventory Management Suite"
          description="All the tools you need to run your inventory operations efficiently in one integrated platform."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((module, index) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-5 h-full hover:shadow-lg transition-all hover:border-primary/50 border-2">
                <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                  <module.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base mb-1">{module.name}</h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
