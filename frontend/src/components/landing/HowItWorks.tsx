import { motion } from 'framer-motion';
import { UploadCloud, Radio, ShoppingCart, BarChart3, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UploadCloud,
    title: 'Import & Catalog',
    description: 'Easily upload products via CSV, organize categories, and assign SKUs and Barcodes in seconds.',
    color: 'from-blue-500 to-cyan-500',
    badge: 'Step 1',
  },
  {
    number: '02',
    icon: Radio,
    title: 'Track in Real-Time',
    description: 'Monitor stock levels across multiple warehouse locations with instant automated low-stock alerts.',
    color: 'from-emerald-500 to-teal-500',
    badge: 'Step 2',
  },
  {
    number: '03',
    icon: ShoppingCart,
    title: 'Fulfill & Sell',
    description: 'Process lightning-fast Point-of-Sale checkouts, sales orders, and inter-warehouse stock transfers seamlessly.',
    color: 'from-violet-500 to-purple-500',
    badge: 'Step 3',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Analyze & Scale',
    description: 'Gain actionable insights with automated profit, revenue forecasting, and batch-expiry performance reports.',
    color: 'from-amber-500 to-orange-500',
    badge: 'Step 4',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-36 bg-muted/30 border-t border-b border-border/50">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base mb-4 border border-primary/20">
            <span>🔄 Simple 4-Step Workflow</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
            See how easy it is to adopt InventoryPro, streamline your operations, and scale your business with confidence.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative flex flex-col justify-between rounded-3xl bg-card border border-border/80 p-8 shadow-sm hover:shadow-2xl transition-all duration-300"
            >
              <div>
                {/* Step Top Bar: Icon + Number */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg text-white`}
                  >
                    <step.icon className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <span className="text-4xl font-black text-muted-foreground/30 group-hover:text-primary transition-colors tracking-tight">
                    {step.number}
                  </span>
                </div>

                {/* Badge */}
                <div className="inline-block mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-md">
                    {step.badge}
                  </span>
                </div>

                {/* Step Title */}
                <h3 className="text-2xl font-bold tracking-tight text-foreground mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting arrow for desktop on non-last items */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background border border-border items-center justify-center text-muted-foreground shadow-md">
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
