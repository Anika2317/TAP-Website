import { create } from 'zustand';

/**
 * Zustand store for preserving navigation state per tab.
 * Stores scroll positions and navigation history for each main tab.
 * Synchronized with URL history for iOS/Android WebView consistency.
 */
export const useTabNavigationStore = create((set, get) => ({
  // Map of tab -> scroll position
  scrollPositions: {},
  
  // Map of tab -> navigation stack (array of page paths)
  navigationStacks: {
    Home: ['/'],
    Dilemmas: ['/Dilemmas'],
    Lessons: ['/Lessons'],
    Challenges: ['/Challenges'],
    Social: ['/Social'],
    Journey: ['/Journey'],
  },
  
  // Current active tab
  activeTab: 'Home',
  
  // Last known URL path for sync validation
  lastUrlPath: '/',
  
  setScrollPosition: (tab, position) => {
    set((state) => ({
      scrollPositions: { ...state.scrollPositions, [tab]: position }
    }));
  },
  
  getScrollPosition: (tab) => {
    return get().scrollPositions[tab] || 0;
  },
  
  pushToStack: (tab, path) => {
    set((state) => {
      const currentStack = state.navigationStacks[tab] || [];
      const lastPath = currentStack[currentStack.length - 1];
      
      // Don't push duplicate
      if (lastPath === path) return state;
      
      return {
        navigationStacks: {
          ...state.navigationStacks,
          [tab]: [...currentStack, path]
        },
        lastUrlPath: path
      };
    });
  },
  
  popFromStack: (tab) => {
    set((state) => {
      const currentStack = state.navigationStacks[tab] || [];
      if (currentStack.length <= 1) return state;
      
      const newStack = currentStack.slice(0, -1);
      const newPath = newStack[newStack.length - 1];
      
      return {
        navigationStacks: {
          ...state.navigationStacks,
          [tab]: newStack
        },
        lastUrlPath: newPath
      };
    });
  },
  
  setActiveTab: (tab, currentPath) => {
    set((state) => {
      // Sync URL path with navigation stack when switching tabs
      const stack = state.navigationStacks[tab] || [];
      const expectedPath = stack[stack.length - 1];
      
      // If current path doesn't match expected, update stack to reflect reality
      if (currentPath && currentPath !== expectedPath) {
        return {
          activeTab: tab,
          navigationStacks: {
            ...state.navigationStacks,
            [tab]: [...stack, currentPath]
          },
          lastUrlPath: currentPath
        };
      }
      
      return { 
        activeTab: tab,
        lastUrlPath: expectedPath || currentPath || '/'
      };
    });
  },
  
  resetStack: (tab) => {
    const defaultPaths = {
      Home: '/',
      Dilemmas: '/Dilemmas',
      Lessons: '/Lessons',
      Challenges: '/Challenges',
      Social: '/Social',
      Journey: '/Journey',
    };
    
    const defaultPath = defaultPaths[tab] || `/${tab}`;
    
    set((state) => ({
      navigationStacks: {
        ...state.navigationStacks,
        [tab]: [defaultPath]
      },
      lastUrlPath: defaultPath
    }));
  },
  
  // Sync state with actual browser URL
  syncWithUrl: (currentPath) => {
    set({ lastUrlPath: currentPath });
  }
}));