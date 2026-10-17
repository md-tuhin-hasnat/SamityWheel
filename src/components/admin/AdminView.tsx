'use client';

import React, { useState } from 'react';
import { useSamity } from '@/context/SamityContext';
import {
  Check,
  Eye,
  Disc,
  ArrowRight,
  UserPlus,
  ShieldAlert,
  Settings,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

type AdminTab = 'verify' | 'members' | 'transfer' | 'settings' | 'draw';

export function AdminView() {
  const {
    currentSamity,
    currentMonth,
    isAdmin,
    verifiedPot,
    pendingPaymentsCount,
    verifyPayment,
    openReceiptModal,
    addMember,
    transferAdmin,
    updateSettings,
    advanceMonth,
    showToast,
    setActiveView,
  } = useSamity();

  const [activeTab, setActiveTab] = useState<AdminTab>('verify');

  // Add Member state
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Transfer Admin state
  const [targetMemberId, setTargetMemberId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Settings state
  const [depositAmount, setDepositAmount] = useState(
    currentSamity?.fixedDepositAmount.toString() || '5000'
  );
  const [bKashNum, setBKashNum] = useState(currentSamity?.bKashNumber || '');
  const [nagadNum, setNagadNum] = useState(currentSamity?.nagadNumber || '');
  const [bankDetails, setBankDetails] = useState(currentSamity?.bankDetails || '');
  const [cashNote, setCashNote] = useState(currentSamity?.cashInstructions || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Payment filter
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');

  if (!currentSamity) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-indigo-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">No Active Samity</h3>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Admin Privileges Required</h3>
        <p className="text-xs text-slate-500">
          You are currently a regular Member in this Samity. Only the assigned Samity Admin can access this panel.
        </p>
      </div>
    );
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberPhone.trim()) {
      showToast('Please enter member mobile number', 'REQUIRED');
      return;
    }
    setIsAddingMember(true);
    const res = await addMember(newMemberPhone.trim(), newMemberName.trim() || undefined);
    setIsAddingMember(false);
    if (res.success) {
      setNewMemberPhone('');
      setNewMemberName('');
    } else {
      showToast(res.error || 'Failed to add member', 'ERROR');
    }
  };

  const handleTransferAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberId) {
      showToast('Please choose a member to transfer Admin role', 'SELECT MEMBER');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmTransfer = async () => {
    setIsTransferring(true);
    const res = await transferAdmin(targetMemberId);
    setIsTransferring(false);
    setShowConfirmModal(false);
    if (res.success) {
      setActiveView('dashboard');
    } else {
      showToast(res.error || 'Transfer failed', 'ERROR');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const res = await updateSettings({
      fixedDepositAmount: Number(depositAmount) || 5000,
      bKashNumber: bKashNum.trim() || undefined,
      nagadNumber: nagadNum.trim() || undefined,
      bankDetails: bankDetails.trim() || undefined,
      cashInstructions: cashNote.trim() || undefined,
    });
    setIsSavingSettings(false);
    if (!res.success) {
      showToast(res.error || 'Failed to update settings', 'ERROR');
    }
  };

  const filteredPayments = currentSamity.payments.filter((p) => {
    if (filter === 'pending') return p.status === 'PENDING';
    if (filter === 'verified') return p.status === 'VERIFIED';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Samity Administration</span>
            </div>
            <h2 className="text-base font-extrabold tracking-tight mt-0.5">
              {currentSamity.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={advanceMonth}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition active:scale-95 flex items-center gap-1 shadow-xs"
          >
            <span>Next Month</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Current Month:</span>{' '}
            <span className="font-bold text-indigo-200">{currentMonth}</span>
          </div>
          <div>
            <span className="text-slate-400">Verified Pot:</span>{' '}
            <span className="font-extrabold text-amber-300 font-mono">
              BDT {verifiedPot.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="grid grid-cols-4 bg-slate-200/90 p-1 rounded-xl text-[11px] font-bold gap-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('verify')}
          className={`py-2 rounded-lg transition active:scale-98 ${
            activeTab === 'verify'
              ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Verify ({pendingPaymentsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`py-2 rounded-lg transition active:scale-98 ${
            activeTab === 'members'
              ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Members
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transfer')}
          className={`py-2 rounded-lg transition active:scale-98 ${
            activeTab === 'transfer'
              ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Transfer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`py-2 rounded-lg transition active:scale-98 ${
            activeTab === 'settings'
              ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Settings
        </button>
      </div>

      {/* TAB 1: VERIFICATION QUEUE */}
      {activeTab === 'verify' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Deposit Proofs</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              {(['pending', 'verified', 'all'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-2 py-1 rounded capitalize transition ${
                    filter === f
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
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
                No deposit records in this category.
              </div>
            ) : (
              filteredPayments.map((p) => {
                const isPending = p.status === 'PENDING';
                return (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{p.user.name}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
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
                      <div className="text-xs font-extrabold text-slate-900 font-mono">
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
                              `${p.method} Receipt Proof`,
                              `${p.user.name} • ${p.month}`
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

      {/* TAB 2: MEMBERS & ADD MEMBER */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Add Member Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Add Member to Samity</span>
            </h3>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="017XX-XXXXXX"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Full Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Asif Karim"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAddingMember}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition active:scale-98 disabled:opacity-50"
              >
                {isAddingMember ? 'Adding Member...' : 'Add Member to Samity'}
              </button>
            </form>
          </div>

          {/* Members List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Current Samity Members ({currentSamity.members.length})
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {currentSamity.members.map((m) => (
                <div key={m.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{m.user.name}</span>
                      {m.role === 'ADMIN' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{m.user.phone}</div>
                  </div>
                  <div className="text-right">
                    {m.hasWonInCurrentCycle ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Won {m.wonMonth}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Eligible
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFER ADMIN ACCESS */}
      {activeTab === 'transfer' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Transfer Admin Access</h3>
              <p className="text-xs text-slate-500 font-medium">
                Pass administrative control of this Samity to another member.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold">Important Notice:</div>
            <p>
              When you transfer admin access, you will transition to a regular <strong>Member</strong>.
              All your deposit history, savings balance, and wheel draw eligibility are permanently preserved.
            </p>
          </div>

          <form onSubmit={handleTransferAdmin} className="space-y-4 text-xs">
            <div>
              <label htmlFor="targetMemberSelect" className="block font-bold text-slate-700 mb-1.5">
                Select Successor Admin:
              </label>
              <select
                id="targetMemberSelect"
                value={targetMemberId}
                onChange={(e) => setTargetMemberId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- Choose Member --</option>
                {currentSamity.members
                  .filter((m) => m.role !== 'ADMIN')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user.name} ({m.user.phone})
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isTransferring}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition active:scale-98 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isTransferring ? 'Transferring Role...' : 'Transfer Admin Access Now'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: SAMITY SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-4">
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>Samity Rules &amp; Payment Details</span>
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Monthly Fixed Deposit (BDT)
              </label>
              <input
                type="number"
                min={500}
                step={500}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin bKash Number</label>
                <input
                  type="text"
                  placeholder="017XX-XXXXXX"
                  value={bKashNum}
                  onChange={(e) => setBKashNum(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Nagad Number</label>
                <input
                  type="text"
                  placeholder="018XX-XXXXXX"
                  value={nagadNum}
                  onChange={(e) => setNagadNum(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bank Account Information</label>
              <input
                type="text"
                placeholder="Bank Name, Account Number, Branch"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cash Handover Instructions</label>
              <input
                type="text"
                placeholder="e.g. Handover cash directly to Admin in person"
                value={cashNote}
                onChange={(e) => setCashNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition active:scale-98 disabled:opacity-50"
              >
                {isSavingSettings ? 'Saving...' : 'Save Samity Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer Admin In-App Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-slate-900">
                Confirm Admin Transfer
              </h4>
              <p className="text-xs text-slate-500">
                You are about to transfer complete administrative privileges of this Samity to:
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-sm font-extrabold text-slate-900">
                {currentSamity.members.find((m) => m.id === targetMemberId)?.user.name}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {currentSamity.members.find((m) => m.id === targetMemberId)?.user.phone}
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-amber-50/80 p-3 rounded-xl border border-amber-200/70 space-y-1">
              <p className="font-bold text-amber-900">Your Member Status Retained:</p>
              <p>
                You will atomically become a regular Member. All your verified deposits, saved total, and monthly wheel lottery eligibility remain 100% active.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isTransferring}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={isTransferring}
                className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition active:scale-98 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isTransferring ? 'Transferring...' : 'Yes, Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
