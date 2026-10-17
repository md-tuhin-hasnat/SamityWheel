'use client';

import React, { useState } from 'react';
import { useSamity } from '@/context/SamityContext';
import { PaymentMethod } from '@/types/samity';
import { createSampleReceiptDataUri } from '@/lib/receiptSvg';
import { Upload, Wand2, Check, Trash2, AlertCircle } from 'lucide-react';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: 'bKash', label: 'bKash', sub: 'TrxID + Screenshot' },
  { id: 'Nagad', label: 'Nagad', sub: 'TrxID + Screenshot' },
  { id: 'Bank Transfer', label: 'Bank Transfer', sub: 'Ref + Screenshot' },
  { id: 'Cash on Hand', label: 'Cash on Hand', sub: 'Direct Handover' },
];

export function PayDepositView() {
  const { currentSamity, currentMonth, currentUser, submitPayment, showToast } = useSamity();

  const [method, setMethod] = useState<PaymentMethod>('bKash');
  const [targetRotation, setTargetRotation] = useState<number>(
    currentSamity?.currentRotationIndex || 1
  );
  const [trxId, setTrxId] = useState('');
  const [cashNote, setCashNote] = useState('');
  const [screenshotDataUri, setScreenshotDataUri] = useState('');
  const [screenshotFileName, setScreenshotFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentSamity || !currentUser) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-indigo-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">No Active Samity</h3>
        <p className="text-xs text-slate-500">Please select or join a Samity first.</p>
      </div>
    );
  }

  const isCash = method === 'Cash on Hand';

  // Dynamically resolve the active Samity Admin from members list
  const adminMember = currentSamity.members.find((m) => m.role === 'ADMIN');
  const adminUser = adminMember?.user;
  const adminName = adminUser?.name || 'Samity Admin';
  const adminPhone = adminUser?.phone || '';

  const getInstructions = () => {
    switch (method) {
      case 'bKash':
        return {
          title: `Send to Admin (${adminName}) bKash:`,
          detail: currentSamity.bKashNumber || (adminPhone ? `${adminPhone} (Personal)` : '01700-998877 (Personal)'),
        };
      case 'Nagad':
        return {
          title: `Send to Admin (${adminName}) Nagad:`,
          detail: currentSamity.nagadNumber || (adminPhone ? `${adminPhone} (Personal)` : '01800-112233 (Personal)'),
        };
      case 'Bank Transfer':
        return {
          title: `Admin (${adminName}) Bank Account:`,
          detail: currentSamity.bankDetails || 'City Bank, A/C: 1502-8899-001',
        };
      case 'Cash on Hand':
        return {
          title: 'Cash Handover Instructions:',
          detail: `Handover cash directly to Samity Admin (${adminName}${adminPhone ? ` • ${adminPhone}` : ''})`,
        };
    }
  };

  const handleGenerateSampleTrx = () => {
    const prefixes: Record<PaymentMethod, string> = {
      bKash: 'BKA',
      Nagad: 'NGD',
      'Bank Transfer': 'CITY',
      'Cash on Hand': 'CASH',
    };
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const initials = currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 3).toUpperCase();
    const generated = `${prefixes[method]}${randomHex}${initials}`;
    setTrxId(generated);
    showToast(`Generated Reference: ${generated}`, 'AUTO');
  };

  const handleUseSampleReceipt = () => {
    const activeTrx = trxId.trim() || 'TRX' + Math.random().toString(36).substring(2, 8).toUpperCase();
    if (!trxId.trim()) setTrxId(activeTrx);

    const uri = createSampleReceiptDataUri(
      method,
      activeTrx,
      currentSamity.fixedDepositAmount,
      currentUser.name,
      currentMonth
    );
    setScreenshotDataUri(uri);
    setScreenshotFileName(`${method}_digital_voucher.svg`);
    showToast('Digital payment voucher generated!', 'RECEIPT');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG/JPEG/WebP)', 'ERROR');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshotDataUri(reader.result);
        setScreenshotFileName(file.name);
        showToast('Receipt voucher attached', 'UPLOAD');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isCash) {
      if (!cashNote.trim()) {
        showToast('Please specify the receiver note for cash payment', 'REQUIRED');
        setIsSubmitting(false);
        return;
      }
      const cashTrx = 'CASH-' + Date.now().toString().slice(-6);
      const rotationLabel = `Rotation ${targetRotation}`;
      const defaultCashReceipt =
        screenshotDataUri ||
        createSampleReceiptDataUri(
          'Cash on Hand',
          cashTrx,
          currentSamity.fixedDepositAmount,
          currentUser.name,
          rotationLabel
        );

      const res = await submitPayment({
        month: rotationLabel,
        amount: currentSamity.fixedDepositAmount,
        method: 'Cash on Hand',
        trxId: cashNote.trim(),
        screenshot: defaultCashReceipt,
      });
      setIsSubmitting(false);
      if (!res.success) {
        showToast(res.error || 'Failed to submit payment', 'ERROR');
      }
      return;
    }

    if (!trxId.trim()) {
      showToast('Please enter the Transaction ID / Reference', 'REQUIRED');
      setIsSubmitting(false);
      return;
    }

    if (!screenshotDataUri) {
      showToast('Please attach a screenshot or generate a sample voucher', 'REQUIRED');
      setIsSubmitting(false);
      return;
    }

    const rotationLabel = `Rotation ${targetRotation}`;
    const res = await submitPayment({
      month: rotationLabel,
      amount: currentSamity.fixedDepositAmount,
      method,
      trxId: trxId.trim().toUpperCase(),
      screenshot: screenshotDataUri,
    });
    setIsSubmitting(false);
    if (!res.success) {
      showToast(res.error || 'Failed to submit payment', 'ERROR');
    }
  };

  const instructions = getInstructions();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Add Deposit Contribution</h2>
          <p className="text-xs text-slate-500 font-medium">
            {currentSamity.name} • Rotation {targetRotation}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100/60">
          BDT {currentSamity.fixedDepositAmount.toLocaleString()}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Step 0: Cycle Rotation Target */}
        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-indigo-950">Target Rotation Period:</div>
            <div className="text-[11px] text-indigo-600 font-medium">
              Active cycle currently on Rotation {currentSamity.currentRotationIndex || 1}
            </div>
          </div>
          <select
            value={targetRotation}
            onChange={(e) => setTargetRotation(Number(e.target.value) || 1)}
            className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-white font-bold text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: currentSamity.totalRotations || 6 }).map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                Rotation {idx + 1} {((idx + 1) === (currentSamity.currentRotationIndex || 1)) ? '⭐ (Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Step 1: Select Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            1. Select Payment Channel
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const isSelected = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethod(m.id);
                    setScreenshotDataUri('');
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all active:scale-98 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{m.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">{m.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions Box */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-500 font-medium">{instructions.title}</div>
            <div className="font-bold text-slate-900 mt-0.5 font-mono">{instructions.detail}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 font-medium">Fixed Amount</div>
            <div className="font-extrabold text-indigo-600">
              BDT {currentSamity.fixedDepositAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Digital Payment Fields */}
        {!isCash ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="trxIdInput" className="block text-xs font-semibold text-slate-700 mb-1">
                2. Transaction ID (TrxID)
              </label>
              <div className="flex gap-2">
                <input
                  id="trxIdInput"
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. BKA8011RAH"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 text-sm uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateSampleTrx}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Auto-Fill</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                3. Transaction Screenshot / Proof
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="cursor-pointer py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 text-center transition flex items-center justify-center gap-1.5 active:scale-98">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleUseSampleReceipt}
                  className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition active:scale-98"
                >
                  Sample Voucher
                </button>
              </div>

              {/* Preview Box */}
              {screenshotDataUri && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotDataUri}
                      alt="Receipt Preview"
                      className="w-11 h-11 object-cover rounded-lg border border-slate-300 shadow-2xs"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-800 truncate max-w-[160px]">
                        {screenshotFileName || 'voucher.svg'}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Attached</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotDataUri('');
                      setScreenshotFileName('');
                    }}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition active:scale-95"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="cashNoteInput" className="block text-xs font-semibold text-slate-700">
                2. Receiver Name / Handover Note
              </label>
              <button
                type="button"
                onClick={() => setCashNote(`Handed cash directly to Admin (${adminName})`)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
              >
                + Fill: Handed to {adminName.split(' ')[0]}
              </button>
            </div>
            <input
              id="cashNoteInput"
              type="text"
              value={cashNote}
              onChange={(e) => setCashNote(e.target.value)}
              placeholder={`e.g. Paid cash directly to Samity Admin (${adminName})`}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting Deposit...' : 'Submit Deposit for Verification'}
        </button>
      </form>
    </div>
  );
}
