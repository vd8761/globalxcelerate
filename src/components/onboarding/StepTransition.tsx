'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface StepTransitionProps {
  children: React.ReactNode;
  direction: 'forward' | 'backward';
  stepKey: string | number;
}

export function StepTransition({ children, direction, stepKey }: StepTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const prevKey = useRef(stepKey);

  useEffect(() => {
    if (prevKey.current !== stepKey) {
      setIsAnimating(true);
      prevKey.current = stepKey;
    }
    const timer = setTimeout(() => setIsAnimating(false), 250);
    return () => clearTimeout(timer);
  }, [stepKey]);

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out',
        isAnimating && direction === 'forward' && 'animate-slide-in-right',
        isAnimating && direction === 'backward' && 'animate-slide-in-left',
      )}
      style={{
        animationDuration: '200ms',
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
}
