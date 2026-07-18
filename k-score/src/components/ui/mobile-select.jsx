import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Mobile-optimized bottom sheet select component
 * Replaces native <select> with touch-friendly interface
 */
export function MobileSelect({ 
  value, 
  onValueChange, 
  options = [], 
  placeholder = "Select an option",
  className,
  triggerClassName,
  label,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "relative flex items-center justify-between w-full min-h-[44px] px-4 py-2.5 text-left",
          "bg-white border border-slate-200 rounded-xl",
          "text-sm font-medium text-slate-700",
          "transition-all duration-150",
          "focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500",
          "active:scale-[0.98]",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover:border-slate-300 cursor-pointer",
          triggerClassName
        )}
        aria-label={label || placeholder}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-400"}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 transition-transform",
          isOpen && "rotate-180"
        )} aria-hidden="true" />
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl shadow-2xl"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
              onClick={(e) => e.stopPropagation()}
              role="listbox"
              aria-label={label || placeholder}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">
                  {label || placeholder}
                </h3>
              </div>

              {/* Options */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {options.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-6 py-4 min-h-[56px]",
                        "text-left transition-colors",
                        "focus:outline-none focus:ring-4 focus:ring-inset focus:ring-emerald-500/50",
                        "active:bg-slate-50",
                        isSelected ? "bg-emerald-50 text-emerald-900" : "text-slate-700 hover:bg-slate-50"
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="font-medium">{option.label}</span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Close Button */}
              <div className="px-6 py-4 border-t border-slate-100">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full min-h-[48px] py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}