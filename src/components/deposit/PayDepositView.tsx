'use client';

import React, { useState } from 'react';
import { useSamity } from '@/context/SamityContext';
import { PaymentMethod } from '@/types/samity';
import { createSampleReceiptDataUri } from '@/lib/receiptSvg';
import { Upload, Wand2, Check, Trash2 } from 'lucide-react';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: 'bKash', label: 'bKash', sub: 'TrxID + Screenshot' },
  { id: 'Nagad', label: 'Nagad', sub: 'TrxID + Screenshot' },
  { id: 'Bank Transfer', label: 'Bank Transfer', sub: 'Ref + Screenshot' },
  { id: 'Cash on Hand', label: 'Cash on Hand', sub: 'Direct Handover' },
];

const METHOD_INSTRUCTIONS: Record<PaymentMethod, { title: string; detail: string }> = {
  bKash: { title: 'Send to Admin bKash:', detail: '01700-998877 (Personal)' },
  Nagad: { title: 'Send to Admin Nagad:', detail: '01800-112233 (Personal)' },
  'Bank Transfer': { title: 'Admin City Bank A/C:', detail: '1502-8899-001 (Gulshan)' },
  'Cash on Hand': { title: 'Handover in Person:', detail: 'Deliver cash to Admin Karim' },
};

export function PayDepositView() {
  const { state, currentMonth, currentUser, submitPayment, showToast } = useSamity();

  const [method, setMethod] = useState<PaymentMethod>('bKash');
  const [trxId, setTrxId] = useState('');
  const [cashNote, setCashNote] = useState('');
  const [screenshotDataUri, setScreenshotDataUri] = useState('');
  const [screenshotFileName, setScreenshotFileName] = useState('');

  const isCash = method === 'Cash on Hand';

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
    showToast(`Generated TrxID: ${generated}`, 'AUTO');
  };

  const handleUseSampleReceipt = () => {
    const activeTrx = trxId.trim() || 'TRX' + Math.random().toString(36).substring(2, 8).toUpperCase();
    if (!trxId.trim()) setTrxId(activeTrx);

    const uri = createSampleReceiptDataUri(
      method,
      activeTrx,
      state.fixedDepositAmount,
      currentUser.name,
      currentMonth
    );
    setScreenshotDataUri(uri);
    setScreenshotFileName(`${method}_sample_receipt.svg`);
    showToast('Sample digital receipt proof generated!', 'RECEIPT');
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
        showToast('Receipt image attached', 'UPLOAD');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearScreenshot = () => {
    setScreenshotDataUri('');
    setScreenshotFileName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCash) {
      if (!cashNote.trim()) {
        showToast('Please specify the receiver note for cash payment', 'REQUIRED');
        return;
      }
      const cashTrx = 'CASH-' + Date.now().toString().slice(-6);
      const defaultCashReceipt =
        screenshotDataUri ||
        createSampleReceiptDataUri(
          'Cash on Hand',
          cashTrx,
          state.fixedDepositAmount,
          currentUser.name,
          currentMonth
        );

      submitPayment({
        userId: currentUser.id,
        month: currentMonth,
        amount: state.fixedDepositAmount,
        method: 'Cash on Hand',
        trxId: cashNote.trim(),
        screenshot: defaultCashReceipt,
      });
      return;
    }

    if (!trxId.trim()) {
      showToast('Please enter the Transaction ID / Reference', 'REQUIRED');
      return;
    }

    if (!screenshotDataUri) {
      showToast('Please attach or generate a transaction screenshot proof', 'REQUIRED');
      return;
    }

    submitPayment({
      userId: currentUser.id,
      month: currentMonth,
      amount: state.fixedDepositAmount,
      method,
      trxId: trxId.trim().toUpperCase(),
      screenshot: screenshotDataUri,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Add Monthly Deposit</h2>
          <p className="text-xs text-slate-500 font-medium">{currentMonth}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100/60">
          BDT {state.fixedDepositAmount.toLocaleString()}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Step 1: Select Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            1. Select Payment Method
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

        {/* Send-To Instructions Box */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-500 font-medium">{METHOD_INSTRUCTIONS[method].title}</div>
            <div className="font-bold text-slate-900 mt-0.5 font-mono">
              {METHOD_INSTRUCTIONS[method].detail}
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 font-medium">Fixed Amount</div>
            <div className="font-extrabold text-indigo-600">
              BDT {state.fixedDepositAmount.toLocaleString()}
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
                3. Transaction Screenshot Proof
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
                  Sample Receipt
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
                        {screenshotFileName || 'receipt.png'}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Attached</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearScreenshot}
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
          /* Cash Handover Fields */
          <div>
            <label htmlFor="cashNoteInput" className="block text-xs font-semibold text-slate-700 mb-1">
              2. Receiver Name / Handover Note
            </label>
            <input
              id="cashNoteInput"
              type="text"
              value={cashNote}
              onChange={(e) => setCashNote(e.target.value)}
              placeholder="e.g. Paid cash directly to Admin Karim"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm active:scale-98"
        >
          Submit Deposit for Verification
        </button>
      </form>
    </div>
  );
}
