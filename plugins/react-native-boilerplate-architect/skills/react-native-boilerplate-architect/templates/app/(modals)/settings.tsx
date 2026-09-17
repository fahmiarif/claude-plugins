import React from 'react';

import { SettingsScreen } from '@/screens/Settings/SettingsScreen';

// Anything pushed as a modal (settings, filters, share sheets) lives under
// (modals) so the root layout's presentation: 'modal' applies uniformly.
export default function Settings() {
  return <SettingsScreen />;
}
