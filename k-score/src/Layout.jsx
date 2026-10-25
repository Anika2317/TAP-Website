import React, { memo, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Scale, BookOpen, Target, Users, ChevronLeft, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTabNavigationStore } from '@/lib/tabNavigationStore';
import { useWebViewNavigation } from '@/hooks/useWebViewNavigation';

const navItems = [
  { icon: Home, label: 'Home', page: 'Home' },
  { icon: Scale, label: 'Dilemmas', page: 'Dilemmas' },
  { icon: BookOpen, label: 'Lessons', page: 'Lessons' },
  { icon: Target, label: 'Challenges', page: 'Challenges' },
  { icon: Users, label: 'Social', page: 'Social' },
  { icon: Map, label: 'Journey', page: 'Journey' },
];

const mainPages = ['Home', 'Dilemmas', 'Lessons', 'Challenges', 'Affirmations', 'Social', 'Journey', 'Progress'];

const NavItem = memo(({ item, isActive, onTabClick }) => {
  const Icon = item.icon;
  
  return (
    <Link
    key={item.page}
    to={createPageUrl(item.page)}
    onClick={() => {
      onTabClick(item.page);
    }}
    className="relative flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-2xl transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    style={{ WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
    role="tab"
    aria-selected={isActive}
    aria-label={`Navigate to ${item.label}`}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-primary/10 rounded-2xl"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
        />
      )}
      <Icon
        className={`relative z-10 w-[22px] h-[22px] transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
        strokeWidth={isActive ? 2.25 : 1.75}
        aria-hidden="true"
      />
      <span className={`relative z-10 text-[10.5px] leading-none tracking-tight truncate max-w-full px-0.5 ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground font-medium'}`}>
        {item.label}
      </span>
    </Link>
  );
});

NavItem.displayName = 'NavItem';

const Layout = memo(({ children, currentPageName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentPath } = useWebViewNavigation();
  const isSubPage = !mainPages.includes(currentPageName);
  const scrollContainerRef = useRef(null);
  const { setScrollPosition, getScrollPosition, setActiveTab, pushToStack, syncWithUrl } = useTabNavigationStore();

  // Sync store with current URL on mount and path changes
  useEffect(() => {
    syncWithUrl(location.pathname);
  }, [location.pathname, syncWithUrl]);

  // Restore scroll position when returning to a main tab
  useEffect(() => {
    if (mainPages.includes(currentPageName)) {
      const savedPosition = getScrollPosition(currentPageName);
      const container = scrollContainerRef.current || window;
      
      requestAnimationFrame(() => {
        if (container === window) {
          window.scrollTo(0, savedPosition);
        } else if (container) {
          container.scrollTop = savedPosition;
        }
      });
    }
  }, [currentPageName, getScrollPosition]);

  // Save scroll position when navigating away
  useEffect(() => {
    if (!mainPages.includes(currentPageName)) return;

    const handleScroll = () => {
      const position = window.scrollY || document.documentElement.scrollTop;
      setScrollPosition(currentPageName, position);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPageName, setScrollPosition]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName, location.pathname);
    pushToStack(tabName, location.pathname);
  };

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <style>{`
        body {
          overscroll-behavior-y: none;
          -webkit-user-select: none;
          user-select: none;
        }
        p, article, .prose, .markdown-content, [data-selectable], textarea, input {
          -webkit-user-select: text;
          user-select: text;
        }
      `}</style>

      {/* Top header for sub-pages */}
      {isSubPage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="max-w-lg mx-auto px-3 h-12 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-primary font-medium text-sm min-h-[44px] px-2 -ml-2"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              Back
            </button>
          </div>
        </div>
      )}

      <div className={isSubPage ? 'pt-12' : ''} ref={scrollContainerRef}>
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 px-3 pointer-events-none"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
        aria-label="Main navigation"
      >
        <div
          role="tablist"
          className="pointer-events-auto max-w-lg mx-auto flex items-stretch gap-0.5 p-1.5 rounded-[1.6rem] bg-card/85 backdrop-blur-xl border border-border shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]"
        >
          {navItems.map((item) => (
            <NavItem 
              key={item.page} 
              item={item} 
              isActive={currentPageName === item.page}
              onTabClick={handleTabClick}
            />
          ))}
        </div>
      </nav>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;