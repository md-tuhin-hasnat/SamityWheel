'use client';

import React, { useState } from 'react';
import { SamityProvider, useSamity } from '@/context/SamityContext';
import { Header } from '@/components/common/Header';
import { BottomNav } from '@/components/common/BottomNav';
import { Toast } from '@/components/common/Toast';
import { ReceiptModal } from '@/components/common/ReceiptModal';
import { PWAInstallBanner } from '@/components/common/PWAInstallBanner';
import { CreateSamityModal } from '@/components/common/CreateSamityModal';

import { DashboardView } from '@/components/dashboard/DashboardView';
import { PayDepositView } from '@/components/deposit/PayDepositView';
import { WheelDrawView } from '@/components/wheel/WheelDrawView';
import { WinnersView } from '@/components/winners/WinnersView';
import { AdminView } from '@/components/admin/AdminView';
import { AuthView } from '@/components/auth/AuthView';
import { Plus, Disc } from 'lucide-react';

function MainAppShell() {
  const { currentUser, isLoadingAuth, currentSamity, activeView } = useSamity();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Loading spinner during session hydration
  if (isLoadingAuth) {
    return (
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <Disc className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Connecting to SamityWheel...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Authentication View
  if (!currentUser) {
    return (
      <div className="w-full max-w-md min-h-screen bg-slate-50 shadow-2xl border-x border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
        <PWAInstallBanner />
        <AuthView />
        <Toast />
      </div>
    );
  }

  // User logged in but has no samity yet
  const hasNoSamity = !currentSamity && currentUser.memberships.length === 0;

  return (
    <div className="w-full max-w-md min-h-screen bg-slate-50 shadow-2xl border-x border-slate-200/80 flex flex-col justify-between relative pb-20">
      <div>
        <PWAInstallBanner />
        <Header onOpenCreateSamity={() => setIsCreateModalOpen(true)} />
        <Toast />
        <ReceiptModal />
        <CreateSamityModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        <main className="p-4">
          {hasNoSamity ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 my-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Welcome to SamityWheel, {currentUser.name}!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  You are not a member of any Samity yet. Start a new savings group or ask an existing Samity Admin to add your mobile number ({currentUser.phone}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition active:scale-98 shadow-xs"
              >
                Create Your First Samity
              </button>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && <DashboardView />}
              {activeView === 'pay' && <PayDepositView />}
              {activeView === 'wheel' && <WheelDrawView />}
              {activeView === 'winners' && <WinnersView />}
              {activeView === 'admin' && <AdminView />}
              {activeView === 'auth' && <AuthView />}
            </>
          )}
        </main>
      </div>

      {!hasNoSamity && <BottomNav />}
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
