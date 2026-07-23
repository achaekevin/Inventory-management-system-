import { useInView } from 'react-intersection-observer';
import CountUpRaw from 'react-countup';

const CountUp: any = (CountUpRaw as any)?.default || CountUpRaw;

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
    threshold: 0.1,
  });

  const isCountUpValid = typeof CountUp === 'function';

  return (
    <span ref={ref}>
      {inView && isCountUpValid ? (
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
      ) : (
        `${prefix}${end.toLocaleString()}${suffix}`
      )}
    </span>
  );
}
