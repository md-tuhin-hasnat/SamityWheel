'use client';

import React from 'react';
import { useSamity } from '@/context/SamityContext';
import { AppView } from '@/types/samity';
import { Home, PlusCircle, Disc, Trophy, ShieldCheck } from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'pay', label: 'Pay', icon: PlusCircle },
  { id: 'wheel', label: 'Wheel', icon: Disc },
  { id: 'winners', label: 'Winners', icon: Trophy },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

export function BottomNav() {
  const { state, setActiveView, pendingPaymentsCount } = useSamity();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 grid grid-cols-5 py-1 px-1 safe-bottom shadow-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = state.activeView === item.id;
        const isAdmin = item.id === 'admin';

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveView(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {isAdmin && pendingPaymentsCount > 0 && (
                <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
