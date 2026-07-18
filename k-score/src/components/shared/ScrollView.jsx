import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const PULL_THRESHOLD = 70;

/**
 * Unified ScrollView component with Pull-to-Refresh functionality
 * Wraps all list-based views for consistent mobile experience
 */
export default function ScrollView({ children, className = '' }) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const pullOpacity = useTransform(pullY, [0, PULL_THRESHOLD], [0, 1]);
  const pullScale = useTransform(pullY, [0, PULL_THRESHOLD], [0.5, 1]);
  const touchStartY = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    const scrollTop = containerRef.current?.scrollTop || window.scrollY;
    if (scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null || refreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || window.scrollY;
    const delta = e.touches[0].clientY - touchStartY.current;
    
    if (delta > 0 && scrollTop === 0) {
      e.preventDefault();
      pullY.set(Math.min(delta * 0.5, PULL_THRESHOLD));
    }
  };

  const handleTouchEnd = async () => {
    if (refreshing) return;
    
    if (pullY.get() >= PULL_THRESHOLD - 5) {
      setRefreshing(true);
      await queryClient.invalidateQueries();
      await new Promise(r => setTimeout(r, 600));
      setRefreshing(false);
    }
    
    animate(pullY, 0, { duration: 0.3 });
    touchStartY.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={className}
      style={{ 
        overflowY: 'auto', 
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y'
      }}
    >
      <motion.div
        style={{ opacity: pullOpacity, scale: pullScale, height: pullY }}
        className="flex items-center justify-center overflow-hidden"
      >
        <RefreshCw className={`w-5 h-5 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
      </motion.div>
      {children}
    </div>
  );
}