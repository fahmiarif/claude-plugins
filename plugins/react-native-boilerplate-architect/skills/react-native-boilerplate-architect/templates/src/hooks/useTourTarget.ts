import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';

import { TOUR_STEPS } from '@/constants/tourSteps';
import { useTourStore } from '@/store/useTourStore';

const CONTINUOUS_MEASURE_INTERVAL_MS = 150;
const MAX_CONTINUOUS_MEASURE_MS = 4000; // stop after this — any transition has long since settled

/**
 * Measures an element's position in the window and registers it with the
 * tour store, but only while this element is the target of the currently
 * active tour step (avoids measuring overhead across the whole app while
 * the tour is inactive).
 *
 * Measured repeatedly on an interval WHILE this step is active (not just
 * once on layout) — a screen-transition animation can still be moving very
 * slowly near its end, so two consecutive reads can look identical while
 * the element hasn't actually settled. Continuous measurement lets the
 * spotlight self-correct until the position is truly final.
 */
export function useTourTarget(targetId: string) {
  const ref = useRef<View>(null);
  const isActive = useTourStore((state) => state.isActive);
  const currentStepIndex = useTourStore((state) => state.currentStepIndex);
  const registerTarget = useTourStore((state) => state.registerTarget);

  const isCurrentTarget = isActive && TOUR_STEPS[currentStepIndex]?.targetId === targetId;

  const measureOnce = useCallback(() => {
    if (!ref.current) return;
    ref.current.measure((_x, _y, width, height, pageX, pageY) => {
      if (width > 0 && height > 0) {
        registerTarget(targetId, { x: pageX, y: pageY, width, height });
      }
    });
  }, [registerTarget, targetId]);

  useEffect(() => {
    if (!isCurrentTarget) return;
    measureOnce();
    const interval = setInterval(measureOnce, CONTINUOUS_MEASURE_INTERVAL_MS);
    const stopTimer = setTimeout(() => clearInterval(interval), MAX_CONTINUOUS_MEASURE_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(stopTimer);
    };
  }, [isCurrentTarget, measureOnce]);

  const onLayout = useCallback(() => {
    if (isCurrentTarget) measureOnce();
  }, [isCurrentTarget, measureOnce]);

  return { ref, onLayout };
}
