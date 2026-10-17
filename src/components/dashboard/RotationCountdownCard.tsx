'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSamity } from '@/context/SamityContext';
import { Clock, Disc, ArrowUpRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { calculateTimeRemaining } from '@/lib/rotationSchedule';

export function RotationCountdownCard() {
  const { currentSamity, currentUser, setActiveView } = useSamity();

  if (!currentSamity || !currentUser) return null;

  const totalRotations = currentSamity.totalRotations || 6;
  const currentRotationIndex = currentSamity.currentRotationIndex || 1;
  const rotationsPerDraw = currentSamity.rotationsPerDraw || 2;
  const intervalType = currentSamity.rotationIntervalType || 'WEEK';
  const intervalDays = currentSamity.rotationIntervalDays || 7;
  const activeMembersCount = currentSamity.members.filter((m) => m.inActiveCycle !== false).length || 3;

  // Calculate target deadline for the current rotation
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

  // Real-time ticking countdown state
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(targetDeadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDeadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDeadline]);

  // Is current rotation a draw rotation?
  const isDrawRotation = currentRotationIndex % rotationsPerDraw === 0;
  const currentDrawRound = isDrawRotation ? currentRotationIndex / rotationsPerDraw : null;
  const rotationsUntilNextDraw = isDrawRotation ? 0 : rotationsPerDraw - (currentRotationIndex % rotationsPerDraw);
  const nextDrawRound = Math.ceil(currentRotationIndex / rotationsPerDraw);

  // Check user's payment for current rotation
  const currentRotationPayment = currentSamity.payments.find((p) => {
    if (p.userId !== currentUser.id) return false;
    const isExactRotationMatch = p.month.includes(`Rotation ${currentRotationIndex}`);
    return isExactRotationMatch;
  });

  // Human-readable interval label
  const getIntervalLabel = () => {
    switch (intervalType) {
      case 'DAY':
        return 'Daily (1 Day)';
      case 'WEEK':
        return 'Weekly (7 Days)';
      case 'BIWEEKLY':
        return 'Bi-Weekly (14 Days)';
      case 'MONTH':
        return 'Monthly (30 Days)';
      case 'CUSTOM':
        return `Custom (${intervalDays} Days)`;
      default:
        return `${intervalDays} Days`;
    }
  };

  // Formatted deadline date
  const deadlineDateObj = new Date(targetDeadline);
  const formattedDeadline = deadlineDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4 relative overflow-hidden">
      {/* Decorative top-right accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50/80 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header: Current Rotation & Frequency */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            R{currentRotationIndex}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Rotation {currentRotationIndex} of {totalRotations}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Frequency: {getIntervalLabel()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Cycle Math
          </span>
          <span className="text-[11px] font-bold text-slate-700 font-mono">
            {activeMembersCount}M × {totalRotations / activeMembersCount} = {totalRotations}R
          </span>
        </div>
      </div>

      {/* Live Countdown Clock Section */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-inner relative overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold text-indigo-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Time Left in Rotation {currentRotationIndex}</span>
          </span>
          <span className="text-[10px] text-slate-300 font-medium">
            Due: {formattedDeadline}
          </span>
        </div>

        {timeLeft.isExpired ? (
          <div className="py-2 text-center text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Rotation period ended. Awaiting next round or draw.</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Days */}
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-indigo-200">
                Days
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-indigo-200">
                Hours
              </div>
            </div>

            {/* Minutes */}
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-indigo-200">
                Mins
              </div>
            </div>

            {/* Seconds */}
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 tracking-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-amber-200">
                Secs
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Draw Milestone Banner */}
      <div
        className={`p-3 rounded-2xl flex items-center justify-between text-xs transition ${
          isDrawRotation
            ? 'bg-amber-500/10 border border-amber-300/50 text-amber-900'
            : 'bg-indigo-50/70 border border-indigo-100 text-indigo-950'
        }`}
      >
        <div className="flex items-center gap-2">
          {isDrawRotation ? (
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Disc className="w-4 h-4" />
            </div>
          )}

          <div>
            <div className="font-bold">
              {isDrawRotation
                ? `🎡 Lucky Draw #${currentDrawRound} Milestone!`
                : `Lucky Draw every ${rotationsPerDraw} rotations`}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isDrawRotation
                ? `This rotation culminates in Lucky Draw #${currentDrawRound}. Ensure all deposits are paid!`
                : `Draw #${nextDrawRound} scheduled after ${rotationsUntilNextDraw} more ${
                    rotationsUntilNextDraw === 1 ? 'rotation' : 'rotations'
                  }.`}
            </div>
          </div>
        </div>

        {isDrawRotation && (
          <button
            type="button"
            onClick={() => setActiveView('wheel')}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 active:scale-95 transition cursor-pointer shadow-xs"
          >
            Wheel →
          </button>
        )}
      </div>

      {/* Rotation Payment Status & CTA Button */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Your Contribution for Rotation {currentRotationIndex}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base font-black text-slate-900">
              BDT {currentSamity.fixedDepositAmount.toLocaleString()}
            </span>
            {currentRotationPayment?.status === 'VERIFIED' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paid &amp; Verified</span>
              </span>
            ) : currentRotationPayment?.status === 'PENDING' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Approval</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                <span>Payment Due</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        {currentRotationPayment?.status === 'VERIFIED' ? (
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Good for Rotation {currentRotationIndex}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setActiveView('pay')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <span>{currentRotationPayment ? 'View / Update Deposit' : `Pay for Rotation ${currentRotationIndex}`}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cycle Rotation Timeline / Stepper */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>Cycle Progression:</span>
          <span className="font-mono">
            {currentRotationIndex} / {totalRotations} Rotations Completed or Active
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: totalRotations }).map((_, idx) => {
            const rotNum = idx + 1;
            const isCompleted = rotNum < currentRotationIndex;
            const isActive = rotNum === currentRotationIndex;
            const isDraw = rotNum % rotationsPerDraw === 0;
            const drawRound = isDraw ? rotNum / rotationsPerDraw : null;

            return (
              <div
                key={rotNum}
                className={`py-2 px-1 rounded-xl text-center border text-[10px] font-bold transition relative ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-200'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <div>R{rotNum}</div>
                {isDraw ? (
                  <div className={`text-[8px] font-extrabold ${isActive ? 'text-amber-200' : 'text-amber-600'}`}>
                    🎁 D{drawRound}
                  </div>
                ) : (
                  <div className="text-[8px] opacity-70">Pay</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
