'use client';

import React, { useState } from 'react';
import { useSamity } from '@/context/SamityContext';
import { X, Building2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface CreateSamityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSamityModal({ isOpen, onClose }: CreateSamityModalProps) {
  const { createSamity, showToast } = useSamity();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('5000');
  const [bKash, setBKash] = useState('');
  const [nagad, setNagad] = useState('');
  const [bank, setBank] = useState('');
  const [cash, setCash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a Samity name', 'REQUIRED');
      return;
    }

    setIsSubmitting(true);
    const res = await createSamity({
      name: name.trim(),
      description: description.trim() || undefined,
      fixedDepositAmount: Number(amount) || 5000,
      bKashNumber: bKash.trim() || undefined,
      nagadNumber: nagad.trim() || undefined,
      bankDetails: bank.trim() || undefined,
      cashInstructions: cash.trim() || undefined,
    });

    setIsSubmitting(false);
    if (res.success) {
      onClose();
      setName('');
      setDescription('');
    } else {
      showToast(res.error || 'Failed to create Samity', 'ERROR');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 z-10 max-h-[90vh] flex flex-col"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Create New Samity</h4>
                  <p className="text-[11px] text-slate-500 font-medium">You will be the Admin and Member #1</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Samity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhanmondi Friends Club"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Monthly Deposit Amount (BDT) *</label>
                <input
                  type="number"
                  min={500}
                  step={500}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short note about the group savings rules"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-900">Payment Collection Channels:</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-0.5">Admin bKash</label>
                  <input
                    type="text"
                    placeholder="017XX-XXXXXX"
                    value={bKash}
                    onChange={(e) => setBKash(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">Admin Nagad</label>
                  <input
                    type="text"
                    placeholder="018XX-XXXXXX"
                    value={nagad}
                    onChange={(e) => setNagad(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">Bank Account Details</label>
                <input
                  type="text"
                  placeholder="e.g. City Bank, A/C: 1502-8899-001"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Samity...' : 'Create Samity & Launch'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
