'use client';

import React, { useState } from 'react';
import { useSamity } from '@/context/SamityContext';
import { Trophy, Play, Sparkles } from 'lucide-react';
import { WinnerStoriesModal, WinnerStoryItem } from './WinnerStoriesModal';

// Vibrant palettes for story avatar rings and previews
const THEME_GRADIENTS = [
  'from-purple-600 via-pink-600 to-amber-500',
  'from-emerald-600 via-teal-600 to-cyan-500',
  'from-rose-600 via-orange-500 to-amber-500',
  'from-indigo-600 via-blue-600 to-teal-400',
  'from-amber-500 via-yellow-500 to-orange-600',
];

export function WinnerStoryTray() {
  const { currentSamity } = useSamity();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  if (!currentSamity) return null;

  const dbWinners = currentSamity.winners || [];
  const wonMembers = currentSamity.members.filter((m) => m.hasWonInCurrentCycle);

  // Combine unique winners and sort LATEST FIRST
  const storyList: WinnerStoryItem[] = [];

  // 1. Process DB winners (sorted newest first)
  const sortedDbWinners = [...dbWinners].sort(
    (a, b) => new Date(b.wonAt).getTime() - new Date(a.wonAt).getTime()
  );

  sortedDbWinners.forEach((w, idx) => {
    storyList.push({
      id: w.id,
      name: w.member?.user?.name || 'Lucky Winner',
      wonMonth: w.month,
      amount: w.amount,
      drawNumber: sortedDbWinners.length - idx,
      dateStr: new Date(w.wonAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      themeIndex: idx % THEME_GRADIENTS.length,
    });
  });

  // 2. Supplement with any members marked as won not already in DB winners
  wonMembers.forEach((m) => {
    if (!storyList.some((s) => s.name === m.user.name)) {
      storyList.push({
        id: m.id,
        name: m.user.name,
        phone: m.user.phone,
        wonMonth: m.wonMonth || 'Recent Draw',
        amount: m.wonAmount || currentSamity.fixedDepositAmount * currentSamity.members.length,
        drawNumber: storyList.length + 1,
        dateStr: 'This Cycle',
        themeIndex: storyList.length % THEME_GRADIENTS.length,
      });
    }
  });

  // If no winners yet, provide an exciting upcoming draw preview story
  if (storyList.length === 0) {
    storyList.push({
      id: 'preview',
      name: 'Next Lucky Winner',
      wonMonth: 'Upcoming Draw',
      amount: currentSamity.fixedDepositAmount * Math.max(1, currentSamity.members.length),
      drawNumber: 1,
      dateStr: 'Coming Soon',
      themeIndex: 0,
    });
  }

  const hasWinners = dbWinners.length > 0 || wonMembers.length > 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-2.5">
        {/* Tray Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1">
              <span>Winner Stories</span>
              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-100">
                Day
              </span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedStoryIndex(0);
              setModalOpen(true);
            }}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer bg-indigo-50/70 hover:bg-indigo-100/70 px-2 py-0.5 rounded-lg active:scale-95"
          >
            <Play className="w-3 h-3 fill-indigo-600" />
            <span>Play Stories</span>
          </button>
        </div>

        {/* Stories Horizontal Tray (Facebook Stories Reel format) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
          {/* Main Reel Starter Card / Circle */}
          <button
            type="button"
            onClick={() => {
              setSelectedStoryIndex(0);
              setModalOpen(true);
            }}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group active:scale-95 transition"
          >
            <div className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-900 p-[2px] flex items-center justify-center border-2 border-white">
                <Trophy className="w-5 h-5 text-amber-400 stroke-[2.2]" />
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-slate-900 max-w-[62px] truncate text-center leading-tight">
              All Stories
            </span>
          </button>

          {/* Individual Winner Story Circles (LATEST FIRST) */}
          {storyList.map((story, idx) => {
            const initials = story.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            const gradient = THEME_GRADIENTS[story.themeIndex % THEME_GRADIENTS.length];
            const isLatest = idx === 0 && hasWinners;

            return (
              <button
                key={story.id}
                type="button"
                onClick={() => {
                  setSelectedStoryIndex(idx);
                  setModalOpen(true);
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group active:scale-95 transition relative"
              >
                <div
                  className={`w-14 h-14 min-w-[56px] min-h-[56px] rounded-full p-[2.5px] bg-gradient-to-tr ${gradient} shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center relative`}
                >
                  <div className="w-full h-full rounded-full bg-slate-900 p-[2px] flex items-center justify-center border-2 border-white">
                    <span className="font-extrabold text-xs text-white tracking-wider">
                      {initials}
                    </span>
                  </div>

                  {isLatest && (
                    <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[8px] border border-white shadow-2xs uppercase">
                      New
                    </span>
                  )}
                </div>

                <div className="text-center max-w-[64px]">
                  <div className="text-[10px] font-bold text-slate-800 truncate leading-tight">
                    {story.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] font-mono text-indigo-600 font-semibold truncate leading-none mt-0.5">
                    {story.wonMonth.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}

          {!hasWinners && (
            <div className="flex items-center gap-1.5 pl-2 text-slate-400 text-xs shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-medium">Be the first winner!</span>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Facebook Day Stories Modal with Slide Animations */}
      <WinnerStoriesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialIndex={selectedStoryIndex}
        storyList={storyList}
        samityName={currentSamity.name}
      />
    </>
  );
}
