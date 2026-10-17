'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSamity } from '@/context/SamityContext';
import { useAudioSynth } from '@/hooks/useAudioSynth';
import confetti from 'canvas-confetti';
import { Disc, ShieldCheck, AlertCircle } from 'lucide-react';

const WHEEL_COLORS = [
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#db2777',
  '#7c3aed',
  '#2563eb',
];

export function WheelDrawView() {
  const {
    currentSamity,
    currentMonth,
    eligibleWheelMembers,
    verifiedPot,
    drawWinner,
    showToast,
    setActiveView,
    isAdmin,
    soundEnabled,
  } = useSamity();

  const { playTickSound, playWinnerFanfare } = useAudioSynth(soundEnabled);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Winner for current month if already drawn in database
  const monthWinner = currentSamity?.winners.find((w) => w.month === currentMonth);

  const drawWheel = useCallback(
    (angleOffset = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(cx, cy) - 12;

      ctx.clearRect(0, 0, width, height);

      if (eligibleWheelMembers.length === 0) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('All Members Won (Cycle Complete)', cx, cy);
        return;
      }

      const sliceAngle = (Math.PI * 2) / eligibleWheelMembers.length;

      eligibleWheelMembers.forEach((member, i) => {
        const startAngle = angleOffset + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        const firstName = member.user.name.split(' ')[0];
        ctx.fillText(firstName, radius - 16, 4);
        ctx.restore();
      });

      // Center Hub
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DRAW', cx, cy);
    },
    [eligibleWheelMembers]
  );

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  const spinWheel = async () => {
    if (isSpinning) return;

    if (monthWinner) {
      showToast(`${monthWinner.member.user.name} has already won for ${currentMonth}.`, 'DRAWN');
      return;
    }

    if (eligibleWheelMembers.length === 0) {
      showToast('All members have won once in this cycle. Admin can advance to start a new cycle.', 'COMPLETE');
      return;
    }

    if (verifiedPot <= 0) {
      showToast('Please verify at least one deposit before spinning.', 'POT EMPTY');
      return;
    }

    // Accessible animation check
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const winningIndex = Math.floor(Math.random() * eligibleWheelMembers.length);
    const winner = eligibleWheelMembers[winningIndex];

    if (prefersReducedMotion) {
      await drawWinner(winner.id, currentMonth, verifiedPot);
      playWinnerFanfare();
      showToast(`${winner.user.name} won BDT ${verifiedPot.toLocaleString()}!`, 'WINNER');
      return;
    }

    setIsSpinning(true);

    const sliceAngle = (Math.PI * 2) / eligibleWheelMembers.length;
    const pointerAngle = (3 * Math.PI) / 2;
    const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const extraSpins = 6 * Math.PI * 2;
    const startAngle = currentAngleRef.current % (Math.PI * 2);
    const targetAngle = extraSpins + pointerAngle - targetSliceCenter;

    const duration = 3400;
    const startTime = performance.now();
    let lastTickSlice = -1;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      currentAngleRef.current = startAngle + (targetAngle - startAngle) * eased;

      const currentSlice = Math.floor((currentAngleRef.current % (Math.PI * 2)) / sliceAngle);
      if (currentSlice !== lastTickSlice && progress < 0.96) {
        lastTickSlice = currentSlice;
        playTickSound();
      }

      drawWheel(currentAngleRef.current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        drawWinner(winner.id, currentMonth, verifiedPot).then(() => {
          playWinnerFanfare();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          showToast(`${winner.user.name} won BDT ${verifiedPot.toLocaleString()}!`, 'WINNER');
        });
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  };

  if (!currentSamity) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-indigo-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">No Active Samity</h3>
        <p className="text-xs text-slate-500">Please select or join a Samity first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          {currentMonth} Draw
        </span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          {eligibleWheelMembers.length} Eligible
        </span>
      </div>

      <h2 className="text-base font-bold text-slate-900 tracking-tight">Lucky Wheel Draw</h2>
      <p className="text-xs text-slate-500 mt-0.5 font-medium">
        Strict fair cycle: previous winners are excluded automatically
      </p>

      {/* Winner Banner */}
      {monthWinner && (
        <div className="w-full mt-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="text-[11px] uppercase font-bold text-amber-100 tracking-wider">
            Winner for {currentMonth}
          </div>
          <div className="text-base font-extrabold mt-0.5">{monthWinner.member.user.name}</div>
          <div className="text-xs text-amber-50 font-medium">
            Awarded BDT {monthWinner.amount.toLocaleString()}
          </div>
        </div>
      )}

      {/* Wheel Canvas & Pointer */}
      <div className="relative w-64 h-64 flex items-center justify-center my-4">
        <div className="absolute -top-2.5 z-10 drop-shadow-md">
          <svg className="w-7 h-7 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21L3 5h18l-9 16z" />
          </svg>
        </div>
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="w-full h-full max-w-full h-auto rounded-full"
        />
      </div>

      {/* Pot Info */}
      <div className="w-full mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
        <div className="text-left">
          <div className="text-slate-500 font-medium">Verified Pot Amount:</div>
          <div className="font-extrabold text-amber-600 text-sm mt-0.5">
            BDT {verifiedPot.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-500 font-medium">Eligible Pool:</div>
          <div className="font-bold text-slate-800 text-xs mt-0.5">
            {eligibleWheelMembers.length} / {currentSamity.members.length} members
          </div>
        </div>
      </div>

      {/* Spin CTA */}
      <div className="w-full space-y-2">
        <button
          type="button"
          onClick={spinWheel}
          disabled={isSpinning || !!monthWinner || eligibleWheelMembers.length === 0}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
        >
          <Disc className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>
            {isSpinning
              ? 'Spinning Wheel...'
              : monthWinner
              ? 'Draw Completed for Month'
              : 'Spin Lucky Wheel Now'}
          </span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-98 flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Open Admin Control Hub</span>
          </button>
        )}
      </div>
    </div>
  );
}
