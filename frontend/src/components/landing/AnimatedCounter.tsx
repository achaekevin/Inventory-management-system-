import { useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  end,
  duration = 2.5,
  suffix = '',
  prefix = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const countUpRef = useRef<HTMLSpanElement>(null);

  return (
    <span ref={ref}>
      {inView && (
        <CountUp
          start={0}
          end={end}
          duration={duration}
          separator=","
          decimals={decimals}
          suffix={suffix}
          prefix={prefix}
          useEasing={true}
        />
      )}
    </span>
  );
}
