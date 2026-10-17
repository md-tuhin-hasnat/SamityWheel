import { PaymentMethod } from '@/types/samity';

interface ReceiptColorConfig {
  bg: string;
  header: string;
}

const RECEIPT_COLORS: Record<PaymentMethod, ReceiptColorConfig> = {
  bKash: { bg: '#fdf2f8', header: '#db2777' },
  Nagad: { bg: '#fff7ed', header: '#ea580c' },
  'Bank Transfer': { bg: '#eff6ff', header: '#1d4ed8' },
  'Cash on Hand': { bg: '#ecfdf5', header: '#059669' },
};

export function createSampleReceiptDataUri(
  method: PaymentMethod,
  trxId: string,
  amount: number,
  senderName: string,
  month: string
): string {
  const c = RECEIPT_COLORS[method] || RECEIPT_COLORS.bKash;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="380" viewBox="0 0 340 380">
    <rect width="340" height="380" rx="16" fill="${c.bg}" stroke="${c.header}" stroke-width="2"/>
    <rect width="340" height="72" rx="14" fill="${c.header}"/>
    <text x="20" y="36" fill="#ffffff" font-family="Inter, sans-serif" font-size="18" font-weight="bold">${method} Receipt</text>
    <text x="20" y="56" fill="#ffffff" opacity="0.9" font-family="Inter, sans-serif" font-size="11">Monthly Fixed Deposit</text>
    <rect x="16" y="88" width="308" height="270" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
    <text x="32" y="120" fill="#16a34a" font-family="Inter, sans-serif" font-size="14" font-weight="bold">PAYMENT COMPLETED</text>
    <line x1="32" y1="136" x2="308" y2="136" stroke="#f1f5f9" stroke-width="2"/>
    <text x="32" y="164" fill="#64748b" font-family="Inter, sans-serif" font-size="11">Transaction ID</text>
    <text x="32" y="184" fill="#0f172a" font-family="monospace" font-size="15" font-weight="bold">${trxId}</text>
    <text x="32" y="220" fill="#64748b" font-family="Inter, sans-serif" font-size="11">Member</text>
    <text x="32" y="240" fill="#0f172a" font-family="Inter, sans-serif" font-size="14" font-weight="bold">${senderName}</text>
    <text x="32" y="276" fill="#64748b" font-family="Inter, sans-serif" font-size="11">Month</text>
    <text x="32" y="296" fill="#0f172a" font-family="Inter, sans-serif" font-size="13" font-weight="bold">${month}</text>
    <text x="190" y="276" fill="#64748b" font-family="Inter, sans-serif" font-size="11">Amount</text>
    <text x="190" y="298" fill="${c.header}" font-family="Inter, sans-serif" font-size="18" font-weight="bold">BDT ${amount.toLocaleString()}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
