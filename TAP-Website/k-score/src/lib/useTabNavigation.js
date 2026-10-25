import { useRef, useEffect } from 'react';

const tabScrollPositions = new Map();

export function useTabNavigation(tabName) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    // Restore scroll position when tab becomes active
    const savedPosition = tabScrollPositions.get(tabName);
    if (savedPosition !== undefined && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = savedPosition;
    }

    // Save scroll position when component unmounts or tab changes
    return () => {
      if (scrollContainerRef.current) {
        tabScrollPositions.set(tabName, scrollContainerRef.current.scrollTop);
      }
    };
  }, [tabName]);

  return scrollContainerRef;
}