'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSamity } from '@/context/SamityContext';
import { Clock, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import { calculateTimeRemaining } from '@/lib/rotationSchedule';

export function RotationCountdownCard() {
  const { currentSamity, currentUser, setActiveView } = useSamity();

  if (!currentSamity || !currentUser) return null;

  const totalRotations = currentSamity.totalRotations || 6;
  const currentRotationIndex = currentSamity.currentRotationIndex || 1;
  const rotationsPerDraw = currentSamity.rotationsPerDraw || 2;
  const intervalType = currentSamity.rotationIntervalType || 'WEEK';
  const intervalDays = currentSamity.rotationIntervalDays || 7;

  // Calculate target deadline for current rotation
  const targetDeadline = useMemo(() => {
    if (currentSamity.nextRotationDeadline) {
      return new Date(currentSamity.nextRotationDeadline).toISOString();
    }
    const startMs = new Date(currentSamity.cycleStartDate || Date.now()).getTime();
    return new Date(startMs + currentRotationIndex * intervalDays * 86400000).toISOString();
  }, [
    currentSamity.nextRotationDeadline,
    currentSamity.cycleStartDate,
    currentRotationIndex,
    intervalDays,
  ]);

  // Real-time ticking countdown
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(targetDeadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDeadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDeadline]);

  const isDrawRotation = currentRotationIndex % rotationsPerDraw === 0;
  const currentDrawRound = isDrawRotation ? currentRotationIndex / rotationsPerDraw : null;
  const nextDrawRotation = Math.ceil(currentRotationIndex / rotationsPerDraw) * rotationsPerDraw;
  const nextDrawRound = Math.ceil(currentRotationIndex / rotationsPerDraw);

  // Check user's payment for current rotation
  const currentRotationPayment = currentSamity.payments.find((p) => {
    if (p.userId !== currentUser.id) return false;
    return p.month.includes(`Rotation ${currentRotationIndex}`);
  });

  const getIntervalTag = () => {
    switch (intervalType) {
      case 'DAY': return '1 Day';
      case 'WEEK': return 'Weekly';
      case 'BIWEEKLY': return '14 Days';
      case 'MONTH': return 'Monthly';
      case 'CUSTOM': return `${intervalDays} Days`;
      default: return `${intervalDays}d`;
    }
  };

  const deadlineFormatted = new Date(targetDeadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
      {/* Top Header: Minimal text */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-600 text-white">
            R{currentRotationIndex}
          </span>
          <span className="text-xs font-bold text-slate-800">
            Rotation {currentRotationIndex}/{totalRotations}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {getIntervalTag()}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Draw at R{nextDrawRotation}</span>
        </div>
      </div>

      {/* Countdown Box */}
      <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
        <div>
          <div className="text-[10px] text-indigo-300 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Time Left</span>
          </div>
          <div className="text-lg font-black font-mono tracking-tight mt-0.5">
            {timeLeft.isExpired ? (
              <span className="text-amber-400 text-xs font-bold">Rotation Ended</span>
            ) : (
              <span>
                {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h{' '}
                {String(timeLeft.minutes).padStart(2, '0')}m{' '}
                <span className="text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400">Due Date</div>
          <div className="text-xs font-bold text-slate-200">{deadlineFormatted}</div>
        </div>
      </div>

      {/* Action & Status Row */}
      <div className="flex items-center justify-between pt-0.5">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Deposit
          </div>
          <div className="text-sm font-extrabold text-slate-900">
            BDT {currentSamity.fixedDepositAmount.toLocaleString()}
          </div>
        </div>

        {currentRotationPayment?.status === 'VERIFIED' ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Paid</span>
          </span>
        ) : currentRotationPayment?.status === 'PENDING' ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setActiveView('pay')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition cursor-pointer"
          >
            <span>Pay Now</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Compact Timeline Dots */}
      <div className="flex items-center gap-1 pt-1">
        {Array.from({ length: totalRotations }).map((_, idx) => {
          const rotNum = idx + 1;
          const isCompleted = rotNum < currentRotationIndex;
          const isActive = rotNum === currentRotationIndex;
          const isDraw = rotNum % rotationsPerDraw === 0;

          return (
            <div
              key={rotNum}
              title={`Rotation ${rotNum}${isDraw ? ' (Draw)' : ''}`}
              className={`flex-1 h-2 rounded-full transition-all ${
                isActive
                  ? 'bg-indigo-600 ring-2 ring-indigo-200 scale-105'
                  : isCompleted
                  ? 'bg-emerald-500'
                  : isDraw
                  ? 'bg-amber-300'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
