import { motion } from 'framer-motion';
import { UserPlus, Settings, Activity, TrendingUp } from 'lucide-react';
import { Section, SectionHeader } from './Section';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Register Your Business',
    description: 'Sign up in minutes with your business details. No credit card required for trial period.',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configure Products & Warehouses',
    description: 'Set up your inventory structure, add products, categories, and warehouse locations.',
  },
  {
    number: '03',
    icon: Activity,
    title: 'Track Inventory & Sales',
    description: 'Start processing orders, tracking stock movements, and managing purchases in real-time.',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Analyze & Grow',
    description: 'Use insights from reports and analytics to optimize operations and scale your business.',
  },
];

export function HowItWorks() {
  return (
    <Section background="gradient">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          subtitle="How It Works"
          title="Get Started in Four Simple Steps"
          description="From setup to success, we'll guide you every step of the way."
        />

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-600 to-primary" 
               style={{ top: '6rem', left: '12%', right: '12%' }} />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Number Circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.2, type: 'spring' }}
                  className="relative mb-6 mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-600 animate-pulse opacity-50" />
                  <span className="text-2xl font-bold relative z-10">{step.number}</span>
                </motion.div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="mb-4 mx-auto inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary"
                >
                  <step.icon className="w-8 h-8" />
                </motion.div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.4 }}
                    className="hidden lg:block absolute top-10 -right-8 text-primary"
                  >
                    <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
                      <path
                        d="M0 12H62M62 12L52 2M62 12L52 22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
