'use client';

import React from 'react';
import { useSamity } from '@/context/SamityContext';
import { Volume2, VolumeX } from 'lucide-react';

export function QuickSwitcher() {
  const { state, setCurrentUserId, setActiveView, toggleSound } = useSamity();

  return (
    <div className="bg-slate-900 text-white px-3 py-2 border-b border-slate-800">
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[11px] font-semibold text-slate-400">Test As:</span>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setCurrentUserId('u1')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition active:scale-95 ${
              state.currentUserId === 'u1'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Rahim
          </button>
          <button
            type="button"
            onClick={() => setCurrentUserId('u2')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition active:scale-95 ${
              state.currentUserId === 'u2'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Nusrat
          </button>
          <button
            type="button"
            onClick={() => setCurrentUserId('admin1')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition active:scale-95 ${
              state.currentUserId === 'admin1'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setActiveView('auth')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition active:scale-95 ${
              state.activeView === 'auth'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
          >
            Account
          </button>
          <button
            type="button"
            onClick={toggleSound}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 transition flex items-center gap-1 active:scale-95"
            title="Toggle Sound Effects"
          >
            {state.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            <span>{state.soundEnabled ? 'Sound' : 'Mute'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
