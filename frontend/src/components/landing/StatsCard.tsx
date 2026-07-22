import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface StatsCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  index?: number;
}

export function StatsCard({
  icon: Icon,
  value,
  label,
  suffix = '',
  prefix = '',
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="mb-3 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-4xl md:text-5xl font-bold mb-2">
        <AnimatedCounter
          end={value}
          suffix={suffix}
          prefix={prefix}
        />
      </div>
      <p className="text-muted-foreground text-sm md:text-base">{label}</p>
    </motion.div>
  );
}
