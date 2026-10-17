'use client';

import React from 'react';
import Image from 'next/image';
import { useSamity } from '@/context/SamityContext';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Home Overview',
  pay: 'Pay Monthly Deposit',
  wheel: 'Monthly Wheel Draw',
  winners: 'Winners & Members',
  admin: 'Admin Control',
  auth: 'Account Access',
};

export function Header() {
  const { state, currentMonth, currentUser, setActiveView } = useSamity();

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-indigo-600 flex items-center justify-center shadow-xs border border-indigo-500/20">
          <Image
            src="/icons/icon-192.png"
            alt="SamityWheel Logo"
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 leading-none tracking-tight">SamityWheel</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/60">
              {currentMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {PAGE_TITLES[state.activeView] || 'Home Overview'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setActiveView('auth')}
        className="flex items-center gap-2 pl-2 py-1 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition active:scale-95 border border-slate-200/60"
      >
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
          {initials}
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-slate-800 leading-none">
            {currentUser.name.split(' ')[0]}
          </div>
          <div className="text-[10px] text-slate-500 leading-none mt-0.5 font-medium">
            {currentUser.role === 'admin' ? 'Admin' : 'Member'}
          </div>
        </div>
      </button>
    </header>
  );
}
