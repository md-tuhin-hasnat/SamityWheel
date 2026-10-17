'use client';

import React from 'react';
import { useSamity } from '@/context/SamityContext';
import { ArrowUpRight, Disc, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';
import { RotationCountdownCard } from './RotationCountdownCard';

export function DashboardView() {
  const {
    currentUser,
    currentSamity,
    currentMonth,
    verifiedPot,
    setActiveView,
    openReceiptModal,
  } = useSamity();

  if (!currentSamity || !currentUser) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-indigo-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">No Active Samity Selected</h3>
        <p className="text-xs text-slate-500">
          Create or join a Samity from the top header menu to begin tracking deposits and lucky wheel draws.
        </p>
      </div>
    );
  }

  // User's verified total in this Samity
  const myVerifiedPayments = currentSamity.payments.filter(
    (p) => p.userId === currentUser.id && p.status === 'VERIFIED'
  );
  const userTotalSaved = myVerifiedPayments.reduce((sum, p) => sum + p.amount, 0);
  const monthsPaidCount = myVerifiedPayments.length;

  // Current month payment status for active user
  const currentMonthPayment = currentSamity.payments.find(
    (p) => p.userId === currentUser.id && p.month === currentMonth
  );

  // All payments for active user in this Samity
  const myPayments = currentSamity.payments.filter((p) => p.userId === currentUser.id);

  return (
    <div className="space-y-4">
      {/* Primary Balance Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">
            My Savings
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
            BDT {currentSamity.fixedDepositAmount.toLocaleString()} / mo
          </span>
        </div>

        <div className="text-3xl font-extrabold mt-1.5 tracking-tight">
          BDT {userTotalSaved.toLocaleString()}
        </div>
        <div className="text-[11px] text-indigo-200 mt-0.5 font-medium">
          {monthsPaidCount} {monthsPaidCount === 1 ? 'deposit' : 'deposits'} verified
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-white/15">
          <div>
            <div className="text-[10px] text-indigo-200 font-medium">Status</div>
            <div className="text-xs font-bold flex items-center gap-1 mt-0.5">
              {currentMonthPayment?.status === 'VERIFIED' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-200">Paid</span>
                </>
              ) : currentMonthPayment?.status === 'PENDING' ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-amber-200">Pending</span>
                </>
              ) : (
                <span className="text-rose-200">Due</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-indigo-200 font-medium">Draw Pot</div>
            <div className="text-xs font-bold text-amber-300 mt-0.5">
              BDT {verifiedPot.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Active Rotation & Countdown Card */}
      <RotationCountdownCard />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveView('pay')}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs flex items-center gap-3 transition active:scale-98 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900">Deposit</div>
            <div className="text-[10px] text-slate-400">bKash, Nagad, Cash</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('wheel')}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs flex items-center gap-3 transition active:scale-98 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition">
            <Disc className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900">Wheel</div>
            <div className="text-[10px] text-slate-400">Monthly Draw</div>
          </div>
        </button>
      </div>

      {/* Personal Deposit History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">My Deposit Ledger</h2>
            <p className="text-xs text-slate-500 font-medium">{currentUser.name}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {myPayments.length} entries
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {myPayments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No deposit records submitted yet for this member.
            </div>
          ) : (
            myPayments.map((p) => (
              <div
                key={p.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{p.month}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        p.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <span>{p.method}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-600">{p.trxId}</span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="text-sm font-extrabold text-slate-900">
                    BDT {p.amount.toLocaleString()}
                  </div>
                  {p.screenshot && (
                    <button
                      type="button"
                      onClick={() =>
                        openReceiptModal(
                          p.screenshot,
                          `${p.method} Receipt Proof`,
                          `${p.month} — ${p.trxId}`
                        )
                      }
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 active:scale-95 transition"
                    >
                      <FileText className="w-3 h-3" />
                      <span>View Voucher</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
