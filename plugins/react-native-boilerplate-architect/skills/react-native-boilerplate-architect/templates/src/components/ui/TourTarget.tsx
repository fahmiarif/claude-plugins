import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

import { useTourTarget } from '@/hooks/useTourTarget';

interface TourTargetProps extends ViewProps {
  /** Must match a TOUR_STEPS entry's `targetId`. */
  id: string;
  children: ReactNode;
}

/**
 * Wraps any element that should be spotlight-able by the product tour,
 * without changing its own layout/behavior. Add this around a button,
 * card, or input, then reference the same `id` in TOUR_STEPS (see
 * `constants/tourSteps.ts`).
 */
export function TourTarget({ id, children, style, ...rest }: TourTargetProps) {
  const { ref, onLayout } = useTourTarget(id);

  return (
    <View ref={ref} onLayout={onLayout} collapsable={false} style={style} {...rest}>
      {children}
    </View>
  );
}
