import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { TOUR_STEPS } from '@/constants/tourSteps';
import { useTheme } from '@/hooks/useTheme';
import { useTourStore } from '@/store/useTourStore';

const SPOTLIGHT_PADDING = 8;
const TARGET_WAIT_TIMEOUT_MS = 4000;
const CARD_MARGIN = 16;

/**
 * Spotlight tour overlay — mounted once in app/_layout.tsx (optional
 * pattern, see SKILL.md). Reads the active step from useTourStore,
 * navigates to its target screen, then spotlights the real UI element
 * already registered via <TourTarget />.
 */
export function TourOverlay() {
  const { colors, typography } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = useTourStore((state) => state.isActive);
  const currentStepIndex = useTourStore((state) => state.currentStepIndex);
  const targets = useTourStore((state) => state.targets);
  const next = useTourStore((state) => state.next);
  const skip = useTourStore((state) => state.skip);

  const step = TOUR_STEPS[currentStepIndex];

  // Steps with `resolveScreen` (dynamic target) resolve at render time;
  // static steps just use `screen` as-is.
  const resolvedScreen = !step ? null : step.resolveScreen ? step.resolveScreen() : step.screen;

  // If a dynamic step can't resolve right now (e.g. no data yet), skip it.
  useEffect(() => {
    if (isActive && step?.resolveScreen && resolvedScreen === null) {
      next();
    }
  }, [isActive, step, resolvedScreen, next]);

  useEffect(() => {
    if (isActive && resolvedScreen && pathname !== resolvedScreen) {
      router.push(resolvedScreen as never);
    }
  }, [isActive, resolvedScreen, pathname, router]);

  // If the target never registers (its UI condition wasn't met), skip ahead.
  useEffect(() => {
    if (!isActive || !step) return;
    if (targets[step.targetId]) return;
    const timer = setTimeout(() => {
      if (!useTourStore.getState().targets[step.targetId]) next();
    }, TARGET_WAIT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isActive, step, currentStepIndex, targets, next]);

  const rect = step ? targets[step.targetId] : undefined;
  const visible = !!(isActive && step && rect && (!resolvedScreen || pathname === resolvedScreen));

  // Modal stays mounted from first render (not just while active) — just
  // toggles `visible`. A Modal window needs a moment to "warm up" the
  // first time it opens; creating it fresh exactly at step 1 risks a
  // first frame out of sync with real screen coordinates.
  let content = null;
  if (visible && rect && step) {
    const { width: screenW, height: screenH } = Dimensions.get('window');
    const clampedLeft = Math.max(rect.x - SPOTLIGHT_PADDING, 0);
    const clampedRight = Math.min(rect.x + rect.width + SPOTLIGHT_PADDING, screenW);
    const spot = {
      x: clampedLeft,
      y: Math.max(rect.y - SPOTLIGHT_PADDING, 0),
      width: clampedRight - clampedLeft,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    };

    const spaceBelow = screenH - (spot.y + spot.height);
    // If the target sits in the lower half of the screen, or there isn't
    // enough room below, place the card ABOVE the target so it never
    // overlaps or covers it.
    const showCardBelow = spot.y < screenH * 0.45 && spaceBelow >= 200;

    // Cap card height to the space actually available on the chosen side
    // — guarantees the card can never cover the spotlight, regardless of
    // content length (short vs long title/description).
    const cardMaxHeight = Math.max((showCardBelow ? spaceBelow : spot.y) - CARD_MARGIN, 120);

    // Cap card width and center it on large screens/tablets — on a
    // normal phone this collapses to ~20px side margins.
    const cardWidth = Math.min(screenW - 40, 460);
    const cardLeft = (screenW - cardWidth) / 2;

    const stepLabel = `${currentStepIndex + 1} / ${TOUR_STEPS.length}`;
    const isLast = currentStepIndex === TOUR_STEPS.length - 1;

    const isCircle = Math.abs(spot.width - spot.height) < 10 && spot.width < 100;
    const spotRadius = isCircle ? spot.width / 2 : 16;

    content = (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View pointerEvents="none" style={[styles.dim, { top: 0, left: 0, right: 0, height: spot.y }]} />
        <View pointerEvents="none" style={[styles.dim, { top: spot.y + spot.height, left: 0, right: 0, bottom: 0 }]} />
        <View pointerEvents="none" style={[styles.dim, { top: spot.y, left: 0, width: spot.x, height: spot.height }]} />
        <View
          pointerEvents="none"
          style={[styles.dim, { top: spot.y, left: spot.x + spot.width, right: 0, height: spot.height }]}
        />

        <Animated.View
          key={`spot-${step.id}`}
          entering={FadeIn.duration(200)}
          pointerEvents="none"
          style={[
            styles.spotBorder,
            { top: spot.y, left: spot.x, width: spot.width, height: spot.height, borderRadius: spotRadius, borderColor: colors.primary },
          ]}
        />

        {/* Block interaction with whatever's behind the tour — only the card is interactive. */}
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => {}} />

        <Animated.View
          key={`card-${step.id}`}
          entering={FadeIn.duration(220).delay(60)}
          exiting={FadeOut.duration(120)}
          style={[
            styles.card,
            { backgroundColor: colors.surface, left: cardLeft, width: cardWidth, maxHeight: cardMaxHeight },
            showCardBelow ? { top: spot.y + spot.height + 16 } : { top: Math.max(spot.y - 200, 16) },
          ]}
        >
          <View style={styles.stepLabelRow}>
            <View style={[styles.sparkleBadge, { backgroundColor: `${colors.primary}1A` }]}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{stepLabel}</Text>
          </View>

          <Text style={[typography.subheading, { color: colors.text, marginBottom: 6 }]}>{step.title}</Text>
          <Text style={[typography.body, { color: colors.textMuted, marginBottom: 16 }]}>{step.description}</Text>

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={skip} hitSlop={8}>
              <Text style={[typography.caption, { color: colors.textMuted, fontWeight: '600' }]}>Lewati</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={next}>
              <Text style={styles.nextBtnText}>{isLast ? 'Selesai' : 'Lanjut'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={skip} statusBarTranslucent>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  spotBorder: {
    position: 'absolute',
    borderWidth: 2,
  },
  card: {
    position: 'absolute',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  stepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sparkleBadge: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
