'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSamity } from '@/context/SamityContext';
import { AdminFilter } from '@/types/samity';
import { useAudioSynth } from '@/hooks/useAudioSynth';
import { Check, Eye, Disc, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const WHEEL_COLORS = [
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#db2777',
  '#7c3aed',
  '#2563eb',
];

export function AdminView() {
  const {
    state,
    currentMonth,
    memberUsers,
    eligibleWheelUsers,
    verifiedPot,
    pendingPaymentsCount,
    setAdminSubTab,
    setAdminFilter,
    advanceNextMonth,
    saveFixedDepositAmount,
    verifyPayment,
    openReceiptModal,
    recordWinner,
    showToast,
  } = useSamity();

  const [depositInput, setDepositInput] = useState(state.fixedDepositAmount.toString());

  // Wheel animation states for Admin Spin Tab
  const { playTickSound, playWinnerFanfare } = useAudioSynth(state.soundEnabled);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const monthWinner = state.winnersHistory.find((w) => w.month === currentMonth);

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
      const radius = Math.min(cx, cy) - 10;

      ctx.clearRect(0, 0, width, height);

      if (eligibleWheelUsers.length === 0) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Cycle Complete', cx, cy);
        return;
      }

      const sliceAngle = (Math.PI * 2) / eligibleWheelUsers.length;

      eligibleWheelUsers.forEach((member, i) => {
        const startAngle = angleOffset + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        const firstName = member.name.split(' ')[0];
        ctx.fillText(firstName, radius - 14, 4);
        ctx.restore();
      });

      // Center Hub
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DRAW', cx, cy);
    },
    [eligibleWheelUsers]
  );

  useEffect(() => {
    if (state.adminSubTab === 'spin') {
      drawWheel(currentAngleRef.current);
    }
  }, [state.adminSubTab, drawWheel]);

  const spinWheel = () => {
    if (isSpinning) return;

    if (monthWinner) {
      showToast(`${monthWinner.userName} already won for ${currentMonth}.`, 'DRAWN');
      return;
    }

    if (eligibleWheelUsers.length === 0) {
      showToast('All members have already won in this cycle.', 'COMPLETE');
      return;
    }

    if (verifiedPot <= 0) {
      showToast('Verify at least one deposit before spinning.', 'EMPTY POT');
      return;
    }

    setIsSpinning(true);

    const winningIndex = Math.floor(Math.random() * eligibleWheelUsers.length);
    const winner = eligibleWheelUsers[winningIndex];

    const sliceAngle = (Math.PI * 2) / eligibleWheelUsers.length;
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
        recordWinner({
          userId: winner.id,
          userName: winner.name,
          amount: verifiedPot,
          month: currentMonth,
        });
        playWinnerFanfare();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
        showToast(`${winner.name} won BDT ${verifiedPot.toLocaleString()}!`, 'WINNER');
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // Filter payments
  const filteredPayments = state.payments.filter((p) => {
    if (state.adminFilter === 'pending') return p.status === 'pending';
    if (state.adminFilter === 'verified') return p.status === 'verified';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Admin Top Controls Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              Admin Control Panel
            </div>
            <h2 className="text-base font-extrabold tracking-tight mt-0.5">{currentMonth}</h2>
          </div>
          <button
            type="button"
            onClick={advanceNextMonth}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition active:scale-95 flex items-center gap-1 shadow-xs"
          >
            <span>Next Month</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fixed Monthly Amount Setting */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <label htmlFor="adminFixedDepositInput" className="text-slate-300 font-medium">
            Monthly Fixed Deposit (BDT)
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="adminFixedDepositInput"
              type="number"
              min={500}
              step={500}
              value={depositInput}
              onChange={(e) => setDepositInput(e.target.value)}
              className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => saveFixedDepositAmount(Number(depositInput) || 5000)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition active:scale-95"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="grid grid-cols-2 bg-slate-200/90 p-1 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setAdminSubTab('verify')}
          className={`py-2 rounded-lg transition active:scale-98 ${
            state.adminSubTab === 'verify'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Verify Queue ({pendingPaymentsCount})
        </button>
        <button
          type="button"
          onClick={() => setAdminSubTab('spin')}
          className={`py-2 rounded-lg transition active:scale-98 ${
            state.adminSubTab === 'spin'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Spin Wheel Draw
        </button>
      </div>

      {/* Sub-View A: Payment Verification Queue */}
      {state.adminSubTab === 'verify' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Submitted Deposits</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
              {(['all', 'pending', 'verified'] as AdminFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setAdminFilter(f)}
                  className={`px-2.5 py-1 rounded capitalize transition ${
                    state.adminFilter === f
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredPayments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No payments match the current filter.
              </div>
            ) : (
              filteredPayments.map((p) => {
                const member = state.users.find((u) => u.id === p.userId);
                const isPending = p.status === 'pending';

                return (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {member?.name || 'Member'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/50'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {p.month} • {p.method} • <span className="font-mono text-slate-600">{p.trxId}</span>
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">
                        BDT {p.amount.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.screenshot && (
                        <button
                          type="button"
                          onClick={() =>
                            openReceiptModal(
                              p.screenshot,
                              `${p.method} Receipt`,
                              `${member?.name} • ${p.month}`
                            )
                          }
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
                          title="View Proof Voucher"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => verifyPayment(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Verify</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Sub-View B: Admin Wheel Control */}
      {state.adminSubTab === 'spin' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-indigo-600 uppercase">{currentMonth}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Verified Pot: BDT {verifiedPot.toLocaleString()}
            </span>
          </div>

          <div className="relative w-60 h-60 flex items-center justify-center my-3">
            <div className="absolute -top-2.5 z-10 drop-shadow">
              <svg className="w-6 h-6 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21L3 5h18l-9 16z" />
              </svg>
            </div>
            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              className="w-full h-full max-w-full h-auto rounded-full"
            />
          </div>

          {monthWinner && (
            <div className="w-full my-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <div className="text-[11px] font-bold uppercase text-emerald-700">Selected Winner</div>
              <div className="text-base font-extrabold mt-0.5">{monthWinner.userName}</div>
              <div className="text-xs text-emerald-700 font-medium">
                Awarded BDT {monthWinner.amount.toLocaleString()}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={spinWheel}
            disabled={isSpinning || !!monthWinner || eligibleWheelUsers.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2 shadow-xs"
          >
            <Disc className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>
              {isSpinning
                ? 'Spinning Wheel...'
                : monthWinner
                ? 'Winner Awarded'
                : 'Spin Wheel Now'}
            </span>
          </button>

          {/* Wheel Pool Status */}
          <div className="w-full mt-4 pt-3 border-t border-slate-100 text-left">
            <div className="text-xs font-bold text-slate-800 mb-2">Wheel Pool Breakdown</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Eligible in current wheel:</span>
                <span className="font-bold text-indigo-600">{eligibleWheelUsers.length} members</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Already won in this cycle:</span>
                <span className="font-bold text-amber-600">
                  {memberUsers.filter((u) => u.hasWon).length} members
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
