import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { OnboardingSlide, ONBOARDING_SLIDES } from '@/constants/onboardingSlides';
import { useTheme } from '@/hooks/useTheme';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Swipeable feature-highlight carousel shown once (gated by
 * `hasSeenOnboarding` in `useAppPreferencesStore`). Scroll position drives
 * the dot indicator on the UI thread via Reanimated instead of re-rendering
 * on every scroll frame from JS-driven state.
 */
export const OnboardingScreen = () => {
  const { colors, spacing, typography } = useTheme();
  const markOnboardingSeen = useAppPreferencesStore((state) => state.markOnboardingSeen);
  const listRef = useRef<Animated.FlatList<OnboardingSlide>>(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleMomentumScrollEnd = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH));
  }, []);

  const finishOnboarding = useCallback(() => {
    markOnboardingSeen();
    // replace (not push) — onboarding shouldn't be reachable via back button.
    router.replace('/(auth)/login');
  }, [markOnboardingSeen]);

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      finishOnboarding();
      return;
    }
    listRef.current?.scrollToOffset({ offset: (currentIndex + 1) * SCREEN_WIDTH, animated: true });
  }, [currentIndex, isLastSlide, finishOnboarding]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<OnboardingSlide>) => (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        {/* Swap for the real illustration/asset per slide once designed. */}
        <View style={[styles.illustrationPlaceholder, { backgroundColor: colors.surface }]} />
        <Text style={[typography.heading, { color: colors.text, marginTop: spacing.lg }]}>{item.title}</Text>
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>{item.description}</Text>
      </View>
    ),
    [colors, typography, spacing]
  );

  const keyExtractor = useCallback((item: OnboardingSlide) => item.id, []);

  return (
    <Screen>
      <View style={styles.header}>
        {!isLastSlide && (
          <Text style={[styles.skip, { color: colors.textMuted }]} onPress={finishOnboarding}>
            Lewati
          </Text>
        )}
      </View>

      <Animated.FlatList
        ref={listRef}
        style={styles.list}
        data={ONBOARDING_SLIDES}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      />

      <View style={styles.dots}>
        {ONBOARDING_SLIDES.map((slide, index) => (
          <OnboardingDot key={slide.id} index={index} scrollX={scrollX} color={colors.primary} />
        ))}
      </View>

      <Button label={isLastSlide ? 'Mulai' : 'Lanjut'} onPress={handleNext} />
    </Screen>
  );
};

interface OnboardingDotProps {
  index: number;
  scrollX: SharedValue<number>;
  color: string;
}

// Dims/narrows inactive dots via width+opacity interpolation on the UI
// thread, rather than swapping a discrete active/inactive color from JS.
const OnboardingDot = ({ index, scrollX, color }: OnboardingDotProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], 'clamp');
    return { width, opacity };
  });

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
};

const styles = StyleSheet.create({
  header: {
    height: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skip: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    // Cancels Screen's horizontal padding (spacing.md = 16 each side) so
    // slides can be exactly SCREEN_WIDTH — paging math (scrollToOffset,
    // the dot indicator's interpolation ranges) assumes that width. Slide
    // content stays readable via `slide`'s own paddingHorizontal below.
    marginHorizontal: -16,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 24,
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
