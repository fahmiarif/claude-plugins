// Only needed if the Firebase Cloud Messaging optional pattern is
// adopted (see SKILL.md's "Optional patterns" → "Firebase Cloud
// Messaging") — registers the background message handler before Expo
// Router boots. If FCM isn't adopted, delete this file and revert
// package.json's "main" field back to "expo-router/entry".
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
  console.log('Message handled in the background:', remoteMessage);
});

// Must be imported last — Expo Router's own docs: "always import it last
// to ensure all configurations are properly set up before the app renders."
// eslint-disable-next-line import/first
import 'expo-router/entry';
