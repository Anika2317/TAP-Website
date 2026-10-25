import { useEffect } from 'react';
import { useWebViewNavigation } from './useWebViewNavigation';

/**
 * Custom hook to handle physical back button in mobile WebViews
 * Ensures consistent navigation behavior across iOS/Android
 * @deprecated Use useWebViewNavigation for new implementations
 */
export function useBackButton(onBack) {
  const { handleBackNavigation } = useWebViewNavigation();

  useEffect(() => {
    return handleBackNavigation(onBack);
  }, [onBack, handleBackNavigation]);
}