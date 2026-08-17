import { motion } from 'framer-motion';
import { Package, TrendingUp, BarChart3, Shield, Zap, Users, FileText, Bell } from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Product Catalog',
    description: 'Comprehensive product management with SKU tracking, categories, and pricing control.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Stock Tracking',
    description: 'Monitor inventory levels across multiple warehouses with live updates and automated alerts.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Powerful reporting tools and dashboards to make data-driven inventory decisions.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    description: 'Secure your data with granular permissions and user role management.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    title: 'Purchase & Sales Management',
    description: 'Streamline procurement and sales processes from order to fulfillment.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Multi-User Collaboration',
    description: 'Enable your team to work together seamlessly with concurrent access.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Organize invoices, receipts, and reports in one centralized location.',
    color: 'from-teal-500 to-green-500',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get instant alerts for low stock, expiring products, and critical updates.',
    color: 'from-pink-500 to-rose-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Explore Our Features
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to manage your inventory efficiently and grow your business
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className="mb-4">
                <div
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
