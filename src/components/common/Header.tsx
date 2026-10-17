'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSamity } from '@/context/SamityContext';
import { ChevronDown, LogOut, Plus, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenCreateSamity: () => void;
}

export function Header({ onOpenCreateSamity }: HeaderProps) {
  const {
    currentUser,
    currentSamity,
    currentMember,
    currentMonth,
    isAdmin,
    selectSamity,
    logout,
    soundEnabled,
    toggleSound,
    setActiveView,
  } = useSamity();

  const [showSamityMenu, setShowSamityMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 shadow-2xs">
      <div className="flex items-center justify-between">
        {/* Left: App Logo & Samity Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-indigo-600 flex items-center justify-center shadow-xs border border-indigo-500/20 shrink-0">
            <Image
              src="/icons/icon-192.png"
              alt="SamityWheel Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSamityMenu((prev) => !prev)}
              className="flex items-center gap-1.5 text-left group"
            >
              <div>
                <div className="flex items-center gap-1">
                  <h1 className="text-sm font-bold text-slate-900 leading-none truncate max-w-[150px]">
                    {currentSamity?.name || 'My Samity'}
                  </h1>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {currentMonth}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Samities Dropdown */}
            {showSamityMenu && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                  Your Samities
                </div>
                <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {currentUser.memberships.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        selectSamity(m.samityId);
                        setShowSamityMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        currentSamity?.id === m.samityId
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <span className="truncate">{m.samityName}</span>
                      <span className="text-[10px] opacity-75 font-semibold uppercase">{m.role}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-1.5 mt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSamityMenu(false);
                      onOpenCreateSamity();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Create New Samity</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sound Toggle & User Profile */}
        <div className="flex items-center gap-1.5 relative">
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition active:scale-95"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="flex items-center gap-1.5 pl-1.5 py-1 pr-2 rounded-full bg-slate-100 hover:bg-slate-200 transition active:scale-95 border border-slate-200/60"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
              {initials}
            </div>
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>

          {/* User Profile Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-11 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.phone}</div>
                <div className="text-[10px] text-indigo-600 font-bold uppercase mt-1">
                  {currentMember?.role === 'ADMIN' ? 'Samity Admin' : 'Active Member'}
                </div>
              </div>

              <div className="pt-1.5 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenCreateSamity();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>New Samity</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
