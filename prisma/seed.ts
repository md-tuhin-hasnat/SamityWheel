import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function createSampleReceiptDataUri(
  method: string,
  trxId: string,
  amount: number,
  senderName: string,
  month: string
): string {
  const colors: Record<string, { bg: string; header: string }> = {
    bKash: { bg: '#fdf2f8', header: '#db2777' },
    Nagad: { bg: '#fff7ed', header: '#ea580c' },
    'Bank Transfer': { bg: '#eff6ff', header: '#1d4ed8' },
    'Cash on Hand': { bg: '#ecfdf5', header: '#059669' },
  };
  const c = colors[method] || colors.bKash;
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

async function main() {
  console.log('Seeding initial Samity database...');

  // Clean existing tables
  await prisma.winner.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.samityMember.deleteMany({});
  await prisma.samity.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create real users
  const rahim = await prisma.user.create({
    data: {
      name: 'Rahim Ahmed',
      phone: '01711-000001',
      password: defaultPasswordHash,
    },
  });

  const nusrat = await prisma.user.create({
    data: {
      name: 'Nusrat Jahan',
      phone: '01812-000002',
      password: defaultPasswordHash,
    },
  });

  const tanvir = await prisma.user.create({
    data: {
      name: 'Tanvir Hasan',
      phone: '01913-000003',
      password: defaultPasswordHash,
    },
  });

  const sadia = await prisma.user.create({
    data: {
      name: 'Sadia Islam',
      phone: '01614-000004',
      password: defaultPasswordHash,
    },
  });

  const mehedi = await prisma.user.create({
    data: {
      name: 'Mehedi Hasan',
      phone: '01515-000005',
      password: defaultPasswordHash,
    },
  });

  const farhana = await prisma.user.create({
    data: {
      name: 'Farhana Akter',
      phone: '01716-000006',
      password: defaultPasswordHash,
    },
  });

  // 2. Create the Samity
  // Creator: Rahim Ahmed (who is also the Admin AND Member #1)
  const samity = await prisma.samity.create({
    data: {
      name: 'Uttara Bondhu Samity',
      description: 'Monthly savings and lucky draw club for Uttara Sector 4 community friends',
      fixedDepositAmount: 5000,
      currentMonthIndex: 2, // October 2026
      monthsList: JSON.stringify([
        'August 2026',
        'September 2026',
        'October 2026',
        'November 2026',
        'December 2026',
        'January 2027',
      ]),
      bKashNumber: '01700-998877',
      nagadNumber: '01800-112233',
      bankDetails: 'City Bank, A/C: 1502-8899-001, Branch: Gulshan',
      cashInstructions: 'Handover cash directly to Samity Admin (Rahim Ahmed)',
      creatorId: rahim.id,
    },
  });

  // 3. Add Members to the Samity
  // Note: Rahim is ADMIN and also a MEMBER!
  const mRahim = await prisma.samityMember.create({
    data: {
      samityId: samity.id,
      userId: rahim.id,
      role: 'ADMIN',
      hasWonInCurrentCycle: false,
    },
  });

  const mNusrat = await prisma.samityMember.create({
    data: {
      samityId: samity.id,
      userId: nusrat.id,
      role: 'MEMBER',
      hasWonInCurrentCycle: false,
    },
  });

  const mTanvir = await prisma.samityMember.create({
    data: {
      samityId: samity.id,
      userId: tanvir.id,
      role: 'MEMBER',
      hasWonInCurrentCycle: false,
    },
  });

  const mSadia = await prisma.samityMember.create({
    data: {
      samityId: samity.id,
      userId: sadia.id,
      role: 'MEMBER',
      hasWonInCurrentCycle: false,
    },
  });

  const mMehedi = await prisma.samityMember.create({
    data: {
      samityId: samity.id,
      userId: mehedi.id,
      role: 'MEMBER',
      hasWonInCurrentCycle: true,
      wonMonth: 'August 2026',
      wonAmount: 30000,
    },
  });

  const mFarhana = await prisma.samityMember.create({
    data: {
      samityId: samity.id,
      userId: farhana.id,
      role: 'MEMBER',
      hasWonInCurrentCycle: true,
      wonMonth: 'September 2026',
      wonAmount: 30000,
    },
  });

  // 4. Record past winners
  await prisma.winner.create({
    data: {
      samityId: samity.id,
      memberId: mMehedi.id,
      month: 'August 2026',
      amount: 30000,
    },
  });

  await prisma.winner.create({
    data: {
      samityId: samity.id,
      memberId: mFarhana.id,
      month: 'September 2026',
      amount: 30000,
    },
  });

  // 5. Seed ledger payments for August, September, October
  const members = [
    { m: mRahim, u: rahim, method: 'bKash' },
    { m: mNusrat, u: nusrat, method: 'Nagad' },
    { m: mTanvir, u: tanvir, method: 'Bank Transfer' },
    { m: mSadia, u: sadia, method: 'Cash on Hand' },
    { m: mMehedi, u: mehedi, method: 'bKash' },
    { m: mFarhana, u: farhana, method: 'Nagad' },
  ];

  // August payments (all verified)
  for (const item of members) {
    const trx = 'BKA801' + item.u.name.slice(0, 3).toUpperCase();
    await prisma.payment.create({
      data: {
        samityId: samity.id,
        memberId: item.m.id,
        userId: item.u.id,
        month: 'August 2026',
        amount: 5000,
        method: item.method,
        trxId: trx,
        screenshot: createSampleReceiptDataUri(item.method, trx, 5000, item.u.name, 'August 2026'),
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });
  }

  // September payments (all verified)
  for (const item of members) {
    const trx = 'SEP902' + item.u.name.slice(0, 3).toUpperCase();
    await prisma.payment.create({
      data: {
        samityId: samity.id,
        memberId: item.m.id,
        userId: item.u.id,
        month: 'September 2026',
        amount: 5000,
        method: item.method,
        trxId: trx,
        screenshot: createSampleReceiptDataUri(item.method, trx, 5000, item.u.name, 'September 2026'),
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });
  }

  // October payments (some verified, some pending)
  await prisma.payment.create({
    data: {
      samityId: samity.id,
      memberId: mRahim.id,
      userId: rahim.id,
      month: 'October 2026',
      amount: 5000,
      method: 'bKash',
      trxId: 'BKA1031RAH',
      screenshot: createSampleReceiptDataUri('bKash', 'BKA1031RAH', 5000, rahim.name, 'October 2026'),
      status: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      samityId: samity.id,
      memberId: mTanvir.id,
      userId: tanvir.id,
      month: 'October 2026',
      amount: 5000,
      method: 'Bank Transfer',
      trxId: 'CITY1033TAN',
      screenshot: createSampleReceiptDataUri('Bank Transfer', 'CITY1033TAN', 5000, tanvir.name, 'October 2026'),
      status: 'PENDING',
    },
  });

  await prisma.payment.create({
    data: {
      samityId: samity.id,
      memberId: mSadia.id,
      userId: sadia.id,
      month: 'October 2026',
      amount: 5000,
      method: 'Nagad',
      trxId: 'NGD1034SAD',
      screenshot: createSampleReceiptDataUri('Nagad', 'NGD1034SAD', 5000, sadia.name, 'October 2026'),
      status: 'PENDING',
    },
  });

  await prisma.payment.create({
    data: {
      samityId: samity.id,
      memberId: mMehedi.id,
      userId: mehedi.id,
      month: 'October 2026',
      amount: 5000,
      method: 'bKash',
      trxId: 'BKA1035MEH',
      screenshot: createSampleReceiptDataUri('bKash', 'BKA1035MEH', 5000, mehedi.name, 'October 2026'),
      status: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      samityId: samity.id,
      memberId: mFarhana.id,
      userId: farhana.id,
      month: 'October 2026',
      amount: 5000,
      method: 'Cash on Hand',
      trxId: 'Paid cash to Rahim',
      screenshot: createSampleReceiptDataUri('Cash on Hand', 'CASH-OCT-FAR', 5000, farhana.name, 'October 2026'),
      status: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
