'use client';

import React from 'react';
import { useSamity } from '@/context/SamityContext';
import { Trophy, CheckCircle2, Users } from 'lucide-react';

export function WinnersView() {
  const { memberUsers, state } = useSamity();

  const totalMembers = memberUsers.length;
  const winnersCount = memberUsers.filter((u) => u.hasWon).length;
  const progressPercent = totalMembers > 0 ? Math.round((winnersCount / totalMembers) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Cycle Progress Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Current Cycle Progress</div>
              <div className="text-[11px] text-slate-500 font-medium">
                {winnersCount} of {totalMembers} members have won
              </div>
            </div>
          </div>
          <span className="text-xs font-extrabold text-indigo-600 font-mono">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Member Roster & Winner Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Members &amp; Past Winners</h2>
            <p className="text-xs text-slate-500 font-medium">
              Fair cycle: Each member wins exactly once
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{totalMembers}</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {memberUsers.map((member) => {
            const initials = member.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={member.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs ${
                      member.hasWon ? 'bg-amber-500' : 'bg-indigo-600'
                    }`}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{member.name}</span>
                      {member.hasWon && <Trophy className="w-3 h-3 text-amber-500" />}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{member.phone}</div>
                  </div>
                </div>

                <div className="text-right">
                  {member.hasWon ? (
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/50 uppercase tracking-wide">
                        Won {member.wonMonth?.split(' ')[0]}
                      </span>
                      <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                        BDT {member.wonAmount.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Eligible</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Winners History Archive */}
      {state.winnersHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Cycle Draw Archive
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {state.winnersHistory.length} draws completed
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {state.winnersHistory.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.userName}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{item.month}</div>
                </div>
                <div className="text-right font-extrabold text-emerald-700">
                  + BDT {item.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
