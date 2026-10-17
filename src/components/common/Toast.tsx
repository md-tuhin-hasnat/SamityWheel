'use client';

import React from 'react';
import { useSamity } from '@/context/SamityContext';
import { AnimatePresence, motion } from 'motion/react';

export function Toast() {
  const { toast, closeToast } = useSamity();

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm"
        >
          <div className="rounded-xl shadow-xl px-4 py-3 flex items-center justify-between gap-3 bg-slate-900/95 backdrop-blur-sm text-white border border-slate-700/50">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-600 uppercase tracking-wider">
              {toast.label}
            </span>
            <div className="flex-1 text-xs font-medium text-slate-100">{toast.message}</div>
            <button
              type="button"
              onClick={closeToast}
              className="text-slate-400 hover:text-white text-xs font-bold px-1 transition"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
