import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ExampleItem } from '../types';

export interface ExampleItemCardProps {
  item: ExampleItem;
}

// Feature-local presentational component. Only lives inside this feature
// folder because nothing outside `example` needs it — if another feature
// starts reusing it, promote it to /src/components instead.
export const ExampleItemCard = ({ item }: ExampleItemCardProps) => (
  <View style={styles.card}>
    <Text style={styles.title}>{item.title}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
