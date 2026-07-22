import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Section, SectionHeader } from './Section';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for small businesses getting started',
    features: [
      'Up to 100 products',
      '1 warehouse location',
      '2 user accounts',
      'Basic inventory tracking',
      'Sales & purchase orders',
      'Basic reports',
      'Email support',
      'Mobile responsive',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: 'per month',
    description: 'For growing businesses with multiple locations',
    features: [
      'Unlimited products',
      'Up to 5 warehouses',
      '10 user accounts',
      'Advanced inventory tracking',
      'Multi-warehouse transfers',
      'Barcode & QR code support',
      'Advanced reports & analytics',
      'Role-based access control',
      'Priority email support',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large organizations with complex needs',
    features: [
      'Unlimited everything',
      'Unlimited warehouses',
      'Unlimited users',
      'Custom integrations',
      'Dedicated account manager',
      'Custom reports',
      'Advanced security features',
      'SLA guarantee',
      '24/7 phone support',
      'On-premise deployment option',
      'Custom training',
      'White-label option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function Pricing() {
  return (
    <Section id="pricing">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          subtitle="Pricing"
          title="Choose the Right Plan for Your Business"
          description="Start free and scale as you grow. No hidden fees, cancel anytime."
        />

        <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card
                className={`p-8 h-full flex flex-col ${
                  plan.popular
                    ? 'border-2 border-primary shadow-xl scale-105'
                    : 'border-2 hover:border-primary/50'
                } transition-all duration-300`}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground text-sm ml-2">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center text-muted-foreground"
        >
          <p className="text-sm">
            All plans include SSL encryption, daily backups, and 99.9% uptime guarantee.
          </p>
          <p className="text-sm mt-2">
            Need a custom plan?{' '}
            <a href="#contact" className="text-primary hover:underline font-medium">
              Contact our sales team
            </a>
          </p>
        </motion.div>
      </div>
    </Section>
  );
}
