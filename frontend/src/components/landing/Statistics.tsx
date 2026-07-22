import {
  Layers,
  Users,
  Warehouse,
  FileText,
  Shield,
  Zap,
} from 'lucide-react';
import { Section } from './Section';
import { StatsCard } from './StatsCard';

const stats = [
  {
    icon: Layers,
    value: 16,
    label: 'Core Modules',
    suffix: '+',
  },
  {
    icon: Users,
    value: 5,
    label: 'User Roles',
    suffix: '',
  },
  {
    icon: Warehouse,
    value: 99,
    label: 'Warehouse Support',
    suffix: '+',
  },
  {
    icon: FileText,
    value: 12,
    label: 'Report Types',
    suffix: '+',
  },
  {
    icon: Shield,
    value: 95,
    label: 'Security Permissions',
    suffix: '+',
  },
  {
    icon: Zap,
    value: 99,
    label: 'System Uptime',
    suffix: '%',
  },
];

export function Statistics() {
  return (
    <Section background="muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for <span className="text-gradient">Enterprise Scale</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform with everything you need to manage inventory efficiently
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatsCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              index={index}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
