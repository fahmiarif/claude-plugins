import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

/**
 * Every screen wraps its content in this instead of repeating
 * SafeAreaView + padding per screen. Set `scroll` for content taller than
 * the viewport; leave it off for screens that manage their own scrolling
 * (e.g. a screen whose body is just a FlashList).
 */
export const Screen = ({ children, scroll = false, style }: ScreenProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView style={[styles.content, style]} contentContainerStyle={styles.scrollContent}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
