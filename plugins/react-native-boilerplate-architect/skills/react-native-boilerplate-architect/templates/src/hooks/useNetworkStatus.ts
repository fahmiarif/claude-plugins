import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Wraps NetInfo's event-based API in a simple boolean. `isConnected`/
 * `isInternetReachable` can be `null` momentarily before the first native
 * callback fires — treated as "assume online" here so the offline banner
 * doesn't flash on cold start before the first real event arrives.
 */
export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
    });
    return () => unsubscribe();
  }, []);

  return { isOffline };
}
