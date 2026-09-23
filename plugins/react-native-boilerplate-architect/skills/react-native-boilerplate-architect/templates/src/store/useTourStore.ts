import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { TOUR_STEPS } from '@/constants/tourSteps';

export interface TourTargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TourState {
  completed: boolean;
  isActive: boolean;
  currentStepIndex: number;
  targets: Record<string, TourTargetRect | undefined>;
  start: () => void;
  next: () => void;
  skip: () => void;
  registerTarget: (id: string, rect: TourTargetRect) => void;
}

/**
 * Store for the product tour (spotlight coach-marks) that walks a new user
 * through real UI elements across screens. Only `completed` is persisted —
 * step progress isn't, because the tour always restarts from the beginning
 * (mirrors `useAppPreferencesStore`'s persist + partialize pattern).
 */
export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      completed: false,
      isActive: false,
      currentStepIndex: 0,
      targets: {},

      start: () => set({ isActive: true, currentStepIndex: 0, targets: {} }),

      next: () =>
        set((state) => {
          const nextIndex = state.currentStepIndex + 1;
          if (nextIndex >= TOUR_STEPS.length) {
            return { isActive: false, completed: true, currentStepIndex: 0, targets: {} };
          }
          return { currentStepIndex: nextIndex };
        }),

      skip: () => set({ isActive: false, completed: true, currentStepIndex: 0, targets: {} }),

      registerTarget: (id, rect) => set((state) => ({ targets: { ...state.targets, [id]: rect } })),
    }),
    {
      name: 'tour-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ completed: state.completed }),
    }
  )
);
