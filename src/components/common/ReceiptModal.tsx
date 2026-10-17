'use client';

import React from 'react';
import { useSamity } from '@/context/SamityContext';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

export function ReceiptModal() {
  const { modal, closeReceiptModal } = useSamity();

  return (
    <AnimatePresence>
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeReceiptModal}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 z-10"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{modal.title || 'Payment Receipt'}</h4>
                <p className="text-xs text-slate-500 font-medium">{modal.subtitle || 'Receipt Proof'}</p>
              </div>
              <button
                type="button"
                onClick={closeReceiptModal}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[260px]">
              {modal.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={modal.imageUrl}
                  alt="Receipt Proof"
                  className="max-h-72 w-auto max-w-full rounded-xl border border-slate-300 shadow-xs"
                />
              ) : (
                <div className="text-xs text-slate-400">No screenshot provided</div>
              )}
            </div>

            <div className="px-4 py-3 bg-white border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={closeReceiptModal}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition active:scale-98"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
