import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Zap,
  CheckCircle,
  BarChart3,
  Coins,
  Clock,
  Shield,
} from 'lucide-react';
import { Section, SectionHeader } from './Section';

const benefits = [
  {
    icon: Target,
    title: 'Reduce Stock Shortages',
    description: 'Prevent stockouts with automated reorder points and low stock alerts. Keep your shelves stocked and customers satisfied.',
  },
  {
    icon: CheckCircle,
    title: 'Improve Inventory Accuracy',
    description: 'Eliminate manual errors with barcode scanning and automated stock updates. Achieve 99%+ inventory accuracy.',
  },
  {
    icon: Zap,
    title: 'Speed Up Operations',
    description: 'Process orders faster with intuitive interfaces and automation. Reduce order processing time by up to 60%.',
  },
  {
    icon: TrendingUp,
    title: 'Simplify Purchasing',
    description: 'Streamline procurement with automated purchase orders and supplier management. Reduce purchasing cycle time.',
  },
  {
    icon: BarChart3,
    title: 'Improve Sales Visibility',
    description: 'Track sales trends, best-sellers, and customer preferences. Make informed decisions with real-time data.',
  },
  {
    icon: Coins,
    title: 'Increase Profitability',
    description: 'Reduce carrying costs, minimize waste, and optimize pricing. Improve profit margins with data-driven insights.',
  },
  {
    icon: Clock,
    title: 'Save Time Daily',
    description: 'Automate repetitive tasks and eliminate manual data entry. Free up hours each week for strategic work.',
  },
  {
    icon: Shield,
    title: 'Make Better Decisions',
    description: 'Access comprehensive reports and analytics. Base decisions on accurate data rather than guesswork.',
  },
];

export function Benefits() {
  return (
    <Section background="muted">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          subtitle="Business Benefits"
          title="Transform Your Business Operations"
          description="See measurable improvements in efficiency, accuracy, and profitability within weeks of implementation."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg"
              >
                <benefit.icon className="w-8 h-8" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-medium">
            <CheckCircle className="w-5 h-5" />
            <span>Join hundreds of businesses improving their operations</span>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
