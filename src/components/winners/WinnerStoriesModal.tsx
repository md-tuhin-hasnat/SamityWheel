'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import {
  X,
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Heart,
  PartyPopper,
  ShieldCheck,
} from 'lucide-react';

export interface WinnerStoryItem {
  id: string;
  name: string;
  phone?: string;
  wonMonth: string;
  amount: number;
  drawNumber?: number;
  dateStr?: string;
  themeIndex: number;
}

interface WinnerStoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  storyList: WinnerStoryItem[];
  samityName: string;
}

const STORY_DURATION_MS = 5000;

// Diverse theme definitions for distinct per-slide aesthetics
interface SlideTheme {
  bgGradient: string;
  accentColor: string;
  trophyGradient: string;
  potBorder: string;
  potGlow: string;
  badgeBg: string;
}

const SLIDE_THEMES: SlideTheme[] = [
  {
    // Theme 0: Royal Amethyst & Fuchsia
    bgGradient: 'from-purple-950 via-slate-950 to-indigo-950',
    accentColor: 'text-fuchsia-400',
    trophyGradient: 'from-fuchsia-500 via-pink-400 to-amber-400',
    potBorder: 'border-fuchsia-500/30',
    potGlow: 'bg-fuchsia-500/10',
    badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
  },
  {
    // Theme 1: Emerald & Mint Jade
    bgGradient: 'from-emerald-950 via-slate-950 to-teal-950',
    accentColor: 'text-emerald-400',
    trophyGradient: 'from-emerald-400 via-teal-300 to-amber-300',
    potBorder: 'border-emerald-500/30',
    potGlow: 'bg-emerald-500/10',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  },
  {
    // Theme 2: Sunset Crimson & Warm Coral
    bgGradient: 'from-rose-950 via-slate-950 to-orange-950',
    accentColor: 'text-rose-400',
    trophyGradient: 'from-rose-500 via-orange-400 to-amber-300',
    potBorder: 'border-rose-500/30',
    potGlow: 'bg-rose-500/10',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
  },
  {
    // Theme 3: Electric Sapphire & Cyan
    bgGradient: 'from-blue-950 via-slate-950 to-cyan-950',
    accentColor: 'text-cyan-400',
    trophyGradient: 'from-cyan-400 via-blue-400 to-indigo-300',
    potBorder: 'border-cyan-500/30',
    potGlow: 'bg-cyan-500/10',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
  },
  {
    // Theme 4: Majestic Gold & Velvet Noir
    bgGradient: 'from-amber-950 via-slate-950 to-yellow-950',
    accentColor: 'text-amber-400',
    trophyGradient: 'from-amber-400 via-yellow-300 to-orange-400',
    potBorder: 'border-amber-500/30',
    potGlow: 'bg-amber-500/10',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  },
];

// Motion animation variants for seamless directional slide transitions
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 140 : -140,
    opacity: 0,
    scale: 0.94,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 350, damping: 30 },
      opacity: { duration: 0.22 },
      scale: { duration: 0.22 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -140 : 140,
    opacity: 0,
    scale: 0.94,
    transition: {
      x: { type: 'spring' as const, stiffness: 350, damping: 30 },
      opacity: { duration: 0.18 },
      scale: { duration: 0.18 },
    },
  }),
};

export function WinnerStoriesModal({
  isOpen,
  onClose,
  initialIndex = 0,
  storyList,
  samityName,
}: WinnerStoriesModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<number>(1);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; char: string; left: number }[]>([]);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  // Sync initialIndex on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, storyList.length - 1)));
      setDirection(1);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
      setIsPaused(false);
    }
  }, [isOpen, initialIndex, storyList.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < storyList.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
    } else {
      onClose();
    }
  }, [currentIndex, storyList.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
    }
  }, [currentIndex]);

  // Timer loop for auto-advancing
  useEffect(() => {
    if (!isOpen) return;

    if (isPaused) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    startTimeRef.current = Date.now() - elapsedBeforePauseRef.current;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      elapsedBeforePauseRef.current = elapsed;
      const pct = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
      setProgress(pct);

      if (pct >= 100) {
        handleNext();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPaused, currentIndex, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') setIsPaused((p) => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  const handleHeartReaction = () => {
    const emojis = ['❤️', '🎉', '🏆', '🔥', '👏', '⭐'];
    const newItems = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      char: emojis[Math.floor(Math.random() * emojis.length)],
      left: 15 + Math.random() * 70,
    }));
    setFloatingEmojis((prev) => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => !newItems.some((n) => n.id === item.id)));
    }, 1800);
  };

  if (!isOpen || storyList.length === 0) return null;

  const currentItem = storyList[currentIndex];
  const theme = SLIDE_THEMES[currentItem.themeIndex % SLIDE_THEMES.length];
  const initials = currentItem.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Container with dynamic theme gradient */}
      <div
        className={`relative w-full max-w-sm sm:max-w-md h-full sm:h-[680px] bg-gradient-to-b ${theme.bgGradient} rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border-0 sm:border border-white/10 transition-colors duration-700`}
      >
        {/* Floating Celebration Emojis */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingEmojis.map((emoji) => (
            <span
              key={emoji.id}
              style={{ left: `${emoji.left}%` }}
              className="absolute bottom-20 text-3xl animate-bounce transition-all opacity-95 filter drop-shadow-md"
            >
              {emoji.char}
            </span>
          ))}
        </div>

        {/* TOP: Segmented Progress Bars (Facebook Story style) */}
        <div className="px-4 pt-3.5 pb-2 z-20 space-y-2.5">
          <div className="flex items-center gap-1.5">
            {storyList.map((item, idx) => {
              let fillWidth = '0%';
              if (idx < currentIndex) fillWidth = '100%';
              if (idx === currentIndex) fillWidth = `${progress}%`;

              return (
                <div
                  key={item.id}
                  className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white rounded-full transition-all duration-75"
                    style={{ width: fillWidth }}
                  />
                </div>
              );
            })}
          </div>

          {/* Story Author Header */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full bg-gradient-to-tr ${theme.trophyGradient} p-[2px] shadow-sm`}
              >
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-xs text-white">
                  {initials}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>{currentItem.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${theme.badgeBg}`}>
                    {currentIndex === 0 ? 'Latest Draw' : `Draw #${storyList.length - currentIndex}`}
                  </span>
                </div>
                <div className="text-[10px] text-white/70 font-medium">
                  {currentItem.wonMonth} • {samityName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                className="p-1.5 rounded-full hover:bg-white/10 transition active:scale-95 cursor-pointer"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 transition active:scale-95 cursor-pointer"
                title="Close Story"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* TAP NAVIGATION GESTURE ZONES (Left 30% = prev, Right 30% = next, Center hold = pause) */}
        <div
          className="absolute inset-x-0 top-16 bottom-20 z-10 flex"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          />
          <div className="w-1/3 h-full" />
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          />
        </div>

        {/* STORY BODY CONTENT: Animated Slide Transitions */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentItem.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col items-center text-center space-y-4 my-auto"
            >
              {/* Winner Golden Trophy Badge */}
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-tr ${theme.trophyGradient} p-1 shadow-2xl animate-pulse`}
                >
                  <div className="w-full h-full rounded-full bg-slate-950/90 flex flex-col items-center justify-center text-white border-2 border-white/20">
                    <Trophy className="w-11 h-11 text-amber-300 stroke-[2.2]" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-900">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              {/* Title & Name */}
              <div className="space-y-1">
                <div
                  className={`text-[11px] font-black uppercase tracking-widest ${theme.accentColor} flex items-center justify-center gap-1.5`}
                >
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span>Samity Lottery Winner</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentItem.name}
                </h2>
                <div className="text-xs text-white/70 font-medium">
                  {currentItem.wonMonth} {currentItem.dateStr ? `• ${currentItem.dateStr}` : ''}
                </div>
              </div>

              {/* Amount Won Highlight Pill */}
              <div
                className={`w-full max-w-[270px] p-3.5 rounded-2xl ${theme.potGlow} backdrop-blur-md border ${theme.potBorder} text-center shadow-inner`}
              >
                <div className="text-[10px] text-white/70 uppercase font-black tracking-wider">
                  Jackpot Pot Collected
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono mt-0.5 tracking-tight">
                  BDT {currentItem.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-300 font-bold mt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified &amp; Awarded</span>
                </div>
              </div>

              <p className="text-xs text-white/80 max-w-[260px] leading-relaxed font-medium">
                {currentItem.id === 'preview'
                  ? 'Complete your rotation deposit to enter the upcoming lottery draw!'
                  : 'Congratulations to our winner on transparent lottery rotation!'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="px-4 py-3 border-t border-white/10 z-20 flex items-center justify-between bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition active:scale-95 cursor-pointer"
              title="Previous Story"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-white/75 px-1 font-bold">
              {currentIndex + 1} / {storyList.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
              title="Next Story"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleHeartReaction}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Celebrate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
