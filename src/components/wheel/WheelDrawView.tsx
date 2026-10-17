'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSamity } from '@/context/SamityContext';
import { useAudioSynth } from '@/hooks/useAudioSynth';
import confetti from 'canvas-confetti';
import {
  Disc,
  ShieldCheck,
  AlertCircle,
  Trophy,
  Sparkles,
  Eye,
  Calendar,
  Lock,
  Vote,
  TrendingUp,
  CheckCircle2,
  Clock,
  RotateCcw,
  UserCheck,
} from 'lucide-react';

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
    currentUser,
    currentSamity,
    currentMonth,
    eligibleWheelMembers,
    verifiedPot,
    drawWinner,
    submitGuess,
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
  const [hasWatchedReveal, setHasWatchedReveal] = useState(false);

  // Simulator toggle for "1 day after draw" so user can test the guessing game immediately
  const [simulateOneDayAfter, setSimulateOneDayAfter] = useState(false);

  // Winner for current month if already drawn in database
  const monthWinner = currentSamity?.winners.find((w) => w.month === currentMonth);

  // Draw date for current month from samity schedule or day of month
  const scheduledDrawDateText = useMemo(() => {
    if (!currentSamity) return '15th of the month';
    const schedule = currentSamity.drawSchedule?.find((s) => s.month === currentMonth);
    if (schedule?.drawDate) {
      return new Date(schedule.drawDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return `${currentSamity.drawDayOfMonth || 15}th of ${currentMonth}`;
  }, [currentSamity, currentMonth]);

  // Is current date at least 1 day after the draw?
  const isOneDayAfterDraw = useMemo(() => {
    if (simulateOneDayAfter) return true;
    if (!monthWinner?.wonAt) return false;
    const wonDate = new Date(monthWinner.wonAt).getTime();
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return now - wonDate >= oneDayInMs;
  }, [monthWinner, simulateOneDayAfter]);

  // Next round month for prediction game
  const nextMonth = useMemo(() => {
    if (!currentSamity) return 'Next Round';
    const nextIndex = currentSamity.currentMonthIndex + 1;
    return currentSamity.monthsList[nextIndex] || 'Next Round';
  }, [currentSamity]);

  // Remaining eligible candidates for next round
  const nextRoundCandidates = useMemo(() => {
    if (!currentSamity) return [];
    return currentSamity.members.filter(
      (m) =>
        m.inActiveCycle !== false &&
        !m.hasWonInCurrentCycle &&
        m.id !== monthWinner?.memberId
    );
  }, [currentSamity, monthWinner]);

  // Guesses placed for the next round
  const nextRoundGuesses = useMemo(() => {
    if (!currentSamity?.guesses) return [];
    return currentSamity.guesses.filter((g) => g.targetMonth === nextMonth);
  }, [currentSamity, nextMonth]);

  // Current user's prediction for next round
  const myCurrentGuess = useMemo(() => {
    if (!currentUser || !nextRoundGuesses) return null;
    return nextRoundGuesses.find((g) => g.userId === currentUser.id);
  }, [currentUser, nextRoundGuesses]);

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
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 12px Inter, sans-serif';
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

  // Execute wheel animation towards a specific target slice index
  const runSpinAnimation = (winningIndex: number, onComplete: () => void) => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      onComplete();
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
        onComplete();
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // 1. ADMIN ONLY DRAW ACTION
  const handleAdminSpin = async () => {
    if (!isAdmin) {
      showToast('Only Samity Admin can conduct the lucky wheel draw.', 'ADMIN ONLY');
      return;
    }

    if (isSpinning) return;

    if (monthWinner) {
      showToast(`${monthWinner.member.user.name} has already won for ${currentMonth}.`, 'DRAWN');
      return;
    }

    if (eligibleWheelMembers.length === 0) {
      showToast('All members have won once in this cycle.', 'COMPLETE');
      return;
    }

    if (verifiedPot <= 0) {
      showToast('Please verify at least one deposit before spinning.', 'POT EMPTY');
      return;
    }

    const winningIndex = Math.floor(Math.random() * eligibleWheelMembers.length);
    const winner = eligibleWheelMembers[winningIndex];

    runSpinAnimation(winningIndex, async () => {
      const res = await drawWinner(winner.id, currentMonth, verifiedPot);
      if (res.success) {
        playWinnerFanfare();
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
        showToast(`🎉 ${winner.user.name} won BDT ${verifiedPot.toLocaleString()}!`, 'WINNER DRAWN');
        setHasWatchedReveal(true);
      } else {
        showToast(res.error || 'Failed to save winner', 'ERROR');
      }
    });
  };

  // 2. MEMBER REVEAL ACTION ("See Winner" button with spin animation)
  const handleMemberSeeWinner = () => {
    if (!monthWinner) return;

    // Find index of the drawn winner in the eligible list
    const winnerIndex = eligibleWheelMembers.findIndex((m) => m.id === monthWinner.memberId);
    const targetIndex = winnerIndex !== -1 ? winnerIndex : 0;

    runSpinAnimation(targetIndex, () => {
      setHasWatchedReveal(true);
      playWinnerFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast(`🎉 ${monthWinner.member.user.name} won the pot of BDT ${monthWinner.amount.toLocaleString()}!`, 'WINNER REVEALED');
    });
  };

  // 3. GUESS THE NEXT WINNER ACTION
  const handleSelectCandidateGuess = async (candidateId: string) => {
    const res = await submitGuess(nextMonth, candidateId);
    if (res.success) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
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
    <div className="space-y-4">
      {/* Main Wheel Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col items-center text-center relative overflow-hidden">
        {/* Header Badges */}
        <div className="w-full flex items-center justify-between mb-1">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{currentMonth} Draw</span>
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            {eligibleWheelMembers.length} Eligible
          </span>
        </div>

        <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">
          Monthly Lucky Wheel
        </h2>

        {/* Compact Schedule & Rotation Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] font-bold mt-1.5">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {scheduledDrawDateText}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/60">
            R{currentSamity.currentRotationIndex || 1}/{currentSamity.totalRotations || 6}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100/60">
            Draw / {currentSamity.rotationsPerDraw || 2}R
          </span>
        </div>

        {/* WINNER BANNER (Shown if winner drawn & watched, or if admin already drew) */}
        {monthWinner && (hasWatchedReveal || isAdmin) && (
          <div className="w-full mt-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-md animate-in fade-in zoom-in-95 duration-200 text-left relative overflow-hidden">
            <div className="absolute right-3 top-3 opacity-15">
              <Trophy className="w-16 h-16" />
            </div>
            <div className="text-[10px] uppercase font-black text-amber-100 tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>Official Winner for {currentMonth}</span>
            </div>
            <div className="text-lg font-black mt-0.5">{monthWinner.member.user.name}</div>
            <div className="text-xs text-amber-100 font-bold mt-0.5">
              Won Total Pot: BDT {monthWinner.amount.toLocaleString()}
            </div>
          </div>
        )}

        {/* Member "Winner Drawn - Reveal Pending" Teaser */}
        {monthWinner && !isAdmin && !hasWatchedReveal && (
          <div className="w-full mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md animate-in fade-in duration-200 text-left flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-black text-indigo-200 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Draw Finalized by Admin!</span>
              </div>
              <div className="text-xs font-bold text-white">Press below to spin &amp; reveal the winner</div>
            </div>
            <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Wheel Canvas & Pointer */}
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          <div className="absolute -top-3 z-10 drop-shadow-lg">
            <svg className="w-8 h-8 text-slate-900 fill-slate-900" viewBox="0 0 24 24">
              <path d="M12 21L3 5h18l-9 16z" />
            </svg>
          </div>
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="w-full h-full max-w-full h-auto rounded-full shadow-inner"
          />
        </div>

        {/* Pot & Pool Info Bar */}
        <div className="w-full mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
          <div className="text-left">
            <div className="text-[11px] text-slate-500 font-semibold">Verified Pot Amount:</div>
            <div className="font-black text-indigo-700 text-base mt-0.5">
              BDT {verifiedPot.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-500 font-semibold">Participating Members:</div>
            <div className="font-bold text-slate-800 text-xs mt-0.5">
              {eligibleWheelMembers.length} / {currentSamity.members.filter((m) => m.inActiveCycle !== false).length}
            </div>
          </div>
        </div>

        {/* Dynamic CTAs Based on Role & Draw Status */}
        <div className="w-full space-y-2.5">
          {/* CASE 1: ADMIN DRAW CTA (Only Admin can draw) */}
          {isAdmin ? (
            <div>
              {!monthWinner ? (
                <button
                  type="button"
                  onClick={handleAdminSpin}
                  disabled={isSpinning || eligibleWheelMembers.length === 0 || verifiedPot <= 0}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm transition shadow-lg shadow-indigo-600/25 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Disc className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? 'Conducting Official Draw...' : 'Spin Lucky Wheel (Admin Draw)'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleMemberSeeWinner}
                  disabled={isSpinning}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Replay Spin Animation</span>
                </button>
              )}
            </div>
          ) : (
            /* CASE 2: REGULAR MEMBER VIEW */
            <div>
              {!monthWinner ? (
                /* Draw not yet conducted by Admin */
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Admin Draw on {scheduledDrawDateText}</span>
                </div>
              ) : (
                /* Winner is drawn: Member can press "See Winner" */
                <button
                  type="button"
                  onClick={handleMemberSeeWinner}
                  disabled={isSpinning}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm transition shadow-lg shadow-indigo-600/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isSpinning ? 'Spinning...' : 'See Winner (Spin Wheel)'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MINI-GAME: "GUESS THE NEXT WINNER" */}
      {monthWinner && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🎲</span>
              <div>
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>Guess Next Winner</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                    Fun
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isOneDayAfterDraw ? `Predict ${nextMonth}'s winner` : `Unlocks 1 day after draw`}
                </p>
              </div>
            </div>

            {/* Quick Testing Simulator Toggle */}
            <button
              type="button"
              onClick={() => setSimulateOneDayAfter((prev) => !prev)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 transition cursor-pointer"
            >
              {isOneDayAfterDraw ? 'Active' : 'Test'}
            </button>
          </div>

          {isOneDayAfterDraw ? (
            <div className="space-y-3">
              {/* Active User Guess Banner */}
              {myCurrentGuess ? (
                <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      Your Prediction for {nextMonth}:
                    </span>
                    <span className="text-sm font-black text-indigo-900 mt-0.5 block">
                      🎯 {myCurrentGuess.guessedMember?.user?.name || 'Selected Member'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-1 rounded-full border border-indigo-200">
                    Tap below to change
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-800">
                  Pick your friend below to place your lucky prediction!
                </div>
              )}

              {/* Candidates Grid */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Remaining Eligible Candidates ({nextRoundCandidates.length}):
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {nextRoundCandidates.map((candidate) => {
                    const isMyPick = myCurrentGuess?.guessedMemberId === candidate.id;
                    const votesForCandidate = nextRoundGuesses.filter(
                      (g) => g.guessedMemberId === candidate.id
                    ).length;
                    const totalVotes = nextRoundGuesses.length;
                    const percent = totalVotes > 0 ? Math.round((votesForCandidate / totalVotes) * 100) : 0;

                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => handleSelectCandidateGuess(candidate.id)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col gap-1.5 ${
                          isMyPick
                            ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                              {candidate.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900">
                                {candidate.user.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {candidate.user.phone}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isMyPick && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                                Your Pick
                              </span>
                            )}
                            <span className="text-xs font-black text-slate-700">
                              {percent}%
                            </span>
                          </div>
                        </div>

                        {/* Vote Bar */}
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isMyPick ? 'bg-indigo-600' : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.max(percent, 4)}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
              <Clock className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                Prediction Game Opens Tomorrow!
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                The prediction game unlocks exactly 1 day after the draw. Click &quot;Test Game&quot; above to preview and cast your prediction now!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
