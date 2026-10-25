import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTabNavigationStore } from '@/lib/tabNavigationStore';

/**
 * Dedicated navigation hook for iOS/Android WebViews
 * Enforces strict history management to prevent stack drift
 * Synchronized with tabNavigationStore for consistent state
 */
export function useWebViewNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { syncWithUrl, activeTab, lastUrlPath } = useTabNavigationStore();
  const isNavigating = useRef(false);

  // Sync URL changes with store
  useEffect(() => {
    if (!isNavigating.current) {
      syncWithUrl(location.pathname);
    }
    isNavigating.current = false;
  }, [location.pathname, syncWithUrl]);

  // Handle browser/hardware back button with store sync
  const handleBackNavigation = useCallback((cb) => {
    const handlePopState = (e) => {
      if (cb) {
        e.preventDefault();
        cb();
        syncWithUrl(location.pathname);
      } else {
        syncWithUrl(location.pathname);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27 || e.key === 'Back' || e.keyCode === 4) {
        e.preventDefault();
        if (cb) {
          cb();
        } else {
          navigate(-1);
        }
        syncWithUrl(location.pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, syncWithUrl, location.pathname]);

  // Programmatic navigation with history state tracking and store sync
  const navigateTo = useCallback((path, options = {}) => {
    isNavigating.current = true;
    navigate(path, {
      ...options,
      state: {
        ...options.state,
        timestamp: Date.now(),
        from: location.pathname,
        tab: activeTab,
      },
    });
    syncWithUrl(path);
  }, [navigate, location.pathname, activeTab, syncWithUrl]);

  // Go back safely
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate]);

  return {
    navigateTo,
    goBack,
    handleBackNavigation,
    currentPath: location.pathname,
    locationState: location.state,
  };
}