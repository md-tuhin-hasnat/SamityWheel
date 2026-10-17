'use client';

import React from 'react';
import { SamityProvider, useSamity } from '@/context/SamityContext';
import { QuickSwitcher } from '@/components/common/QuickSwitcher';
import { Header } from '@/components/common/Header';
import { BottomNav } from '@/components/common/BottomNav';
import { Toast } from '@/components/common/Toast';
import { ReceiptModal } from '@/components/common/ReceiptModal';
import { PWAInstallBanner } from '@/components/common/PWAInstallBanner';

import { DashboardView } from '@/components/dashboard/DashboardView';
import { PayDepositView } from '@/components/deposit/PayDepositView';
import { WheelDrawView } from '@/components/wheel/WheelDrawView';
import { WinnersView } from '@/components/winners/WinnersView';
import { AdminView } from '@/components/admin/AdminView';
import { AuthView } from '@/components/auth/AuthView';

function MainAppShell() {
  const { state } = useSamity();

  return (
    <div className="w-full max-w-md min-h-screen bg-slate-50 shadow-2xl border-x border-slate-200/80 flex flex-col justify-between relative pb-20">
      <div>
        <PWAInstallBanner />
        <QuickSwitcher />
        <Header />
        <Toast />
        <ReceiptModal />

        <main className="p-4">
          {state.activeView === 'dashboard' && <DashboardView />}
          {state.activeView === 'pay' && <PayDepositView />}
          {state.activeView === 'wheel' && <WheelDrawView />}
          {state.activeView === 'winners' && <WinnersView />}
          {state.activeView === 'admin' && <AdminView />}
          {state.activeView === 'auth' && <AuthView />}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

export default function Page() {
  return (
    <SamityProvider>
      <MainAppShell />
    </SamityProvider>
  );
}
