'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  SamityState,
  User,
  Payment,
  PaymentMethod,
  AppView,
  AdminSubTab,
  AdminFilter,
  WinnerHistory,
} from '@/types/samity';
import { AVAILABLE_MONTHS, getDefaultSamityState } from '@/lib/mockData';

const STORAGE_KEY = 'samity_wheel_mobile_v2';

interface ToastState {
  show: boolean;
  message: string;
  label: string;
}

interface ModalState {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  subtitle: string;
}

interface SamityContextType {
  state: SamityState;
  currentMonth: string;
  currentUser: User;
  memberUsers: User[];
  eligibleWheelUsers: User[];
  verifiedPot: number;
  pendingPaymentsCount: number;
  toast: ToastState;
  modal: ModalState;
  // Actions
  setActiveView: (view: AppView) => void;
  setCurrentUserId: (userId: string) => void;
  setAdminSubTab: (tab: AdminSubTab) => void;
  setAdminFilter: (filter: AdminFilter) => void;
  setSelectedMethod: (method: PaymentMethod) => void;
  toggleSound: () => void;
  submitPayment: (data: {
    userId: string;
    month: string;
    amount: number;
    method: PaymentMethod;
    trxId: string;
    screenshot: string;
  }) => void;
  verifyPayment: (paymentId: string) => void;
  advanceNextMonth: () => void;
  saveFixedDepositAmount: (amount: number) => void;
  recordWinner: (winner: { userId: string; userName: string; amount: number; month: string }) => void;
  resetDemoData: () => void;
  showToast: (message: string, label?: string) => void;
  closeToast: () => void;
  openReceiptModal: (imageUrl: string, title: string, subtitle: string) => void;
  closeReceiptModal: () => void;
}

const SamityContext = createContext<SamityContextType | null>(null);

export function SamityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SamityState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to load state from localStorage', e);
      }
    }
    return getDefaultSamityState();
  });

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    label: 'INFO',
  });

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    imageUrl: '',
    title: '',
    subtitle: '',
  });

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [state]);

  const showToast = useCallback((message: string, label = 'OK') => {
    setToast({ show: true, message, label });
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const openReceiptModal = useCallback((imageUrl: string, title: string, subtitle: string) => {
    setModal({
      isOpen: true,
      imageUrl,
      title,
      subtitle,
    });
  }, []);

  const closeReceiptModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Derived Values
  const currentMonth = useMemo(() => {
    return AVAILABLE_MONTHS[state.currentMonthIndex] || 'October 2026';
  }, [state.currentMonthIndex]);

  const currentUser = useMemo(() => {
    return state.users.find((u) => u.id === state.currentUserId) || state.users[1];
  }, [state.users, state.currentUserId]);

  const memberUsers = useMemo(() => {
    return state.users.filter((u) => u.role === 'member');
  }, [state.users]);

  const eligibleWheelUsers = useMemo(() => {
    return memberUsers.filter((u) => !u.hasWon);
  }, [memberUsers]);

  const verifiedPot = useMemo(() => {
    return state.payments
      .filter((p) => p.month === currentMonth && p.status === 'verified')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }, [state.payments, currentMonth]);

  const pendingPaymentsCount = useMemo(() => {
    return state.payments.filter((p) => p.status === 'pending').length;
  }, [state.payments]);

  // Actions
  const setActiveView = useCallback((view: AppView) => {
    setState((prev) => ({ ...prev, activeView: view }));
  }, []);

  const setCurrentUserId = useCallback((userId: string) => {
    setState((prev) => ({ ...prev, currentUserId: userId }));
  }, []);

  const setAdminSubTab = useCallback((tab: AdminSubTab) => {
    setState((prev) => ({ ...prev, adminSubTab: tab }));
  }, []);

  const setAdminFilter = useCallback((filter: AdminFilter) => {
    setState((prev) => ({ ...prev, adminFilter: filter }));
  }, []);

  const setSelectedMethod = useCallback((method: PaymentMethod) => {
    setState((prev) => ({ ...prev, selectedMethod: method }));
  }, []);

  const toggleSound = useCallback(() => {
    setState((prev) => {
      const nextVal = !prev.soundEnabled;
      showToast(nextVal ? 'Sound enabled' : 'Sound muted', 'SOUND');
      return { ...prev, soundEnabled: nextVal };
    });
  }, [showToast]);

  const submitPayment = useCallback(
    (data: {
      userId: string;
      month: string;
      amount: number;
      method: PaymentMethod;
      trxId: string;
      screenshot: string;
    }) => {
      const newPayment: Payment = {
        id: 'p' + Date.now(),
        userId: data.userId,
        month: data.month,
        amount: data.amount,
        method: data.method,
        trxId: data.trxId,
        screenshot: data.screenshot,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        payments: [newPayment, ...prev.payments],
        activeView: 'dashboard',
      }));

      showToast(`Deposit submitted for ${data.month}. Awaiting admin verification.`, 'SUCCESS');
    },
    [showToast]
  );

  const verifyPayment = useCallback(
    (paymentId: string) => {
      setState((prev) => ({
        ...prev,
        payments: prev.payments.map((p) => (p.id === paymentId ? { ...p, status: 'verified' } : p)),
      }));
      showToast('Deposit successfully verified!', 'VERIFIED');
    },
    [showToast]
  );

  const advanceNextMonth = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentMonthIndex + 1;
      if (nextIndex >= AVAILABLE_MONTHS.length) {
        showToast('All configured months reached in this cycle.', 'ALERT');
        return prev;
      }
      const nextMonthName = AVAILABLE_MONTHS[nextIndex];
      showToast(`Cycle advanced to ${nextMonthName}`, 'ADVANCED');
      return { ...prev, currentMonthIndex: nextIndex };
    });
  }, [showToast]);

  const saveFixedDepositAmount = useCallback(
    (amount: number) => {
      setState((prev) => ({ ...prev, fixedDepositAmount: amount }));
      showToast(`Fixed deposit updated to BDT ${amount.toLocaleString()}`, 'SAVED');
    },
    [showToast]
  );

  const recordWinner = useCallback(
    (winner: { userId: string; userName: string; amount: number; month: string }) => {
      setState((prev) => {
        const updatedUsers = prev.users.map((u) =>
          u.id === winner.userId
            ? { ...u, hasWon: true, wonMonth: winner.month, wonAmount: winner.amount }
            : u
        );

        const newWinnerHistory: WinnerHistory = {
          month: winner.month,
          userId: winner.userId,
          userName: winner.userName,
          amount: winner.amount,
          wonDate: new Date().toLocaleDateString(),
        };

        return {
          ...prev,
          users: updatedUsers,
          winnersHistory: [...prev.winnersHistory, newWinnerHistory],
        };
      });
    },
    []
  );

  const resetDemoData = useCallback(() => {
    const defaultData = getDefaultSamityState();
    setState(defaultData);
    showToast('App demo data has been reset to defaults.', 'RESET');
  }, [showToast]);

  const value = useMemo(
    () => ({
      state,
      currentMonth,
      currentUser,
      memberUsers,
      eligibleWheelUsers,
      verifiedPot,
      pendingPaymentsCount,
      toast,
      modal,
      setActiveView,
      setCurrentUserId,
      setAdminSubTab,
      setAdminFilter,
      setSelectedMethod,
      toggleSound,
      submitPayment,
      verifyPayment,
      advanceNextMonth,
      saveFixedDepositAmount,
      recordWinner,
      resetDemoData,
      showToast,
      closeToast,
      openReceiptModal,
      closeReceiptModal,
    }),
    [
      state,
      currentMonth,
      currentUser,
      memberUsers,
      eligibleWheelUsers,
      verifiedPot,
      pendingPaymentsCount,
      toast,
      modal,
      setActiveView,
      setCurrentUserId,
      setAdminSubTab,
      setAdminFilter,
      setSelectedMethod,
      toggleSound,
      submitPayment,
      verifyPayment,
      advanceNextMonth,
      saveFixedDepositAmount,
      recordWinner,
      resetDemoData,
      showToast,
      closeToast,
      openReceiptModal,
      closeReceiptModal,
    ]
  );

  return <SamityContext.Provider value={value}>{children}</SamityContext.Provider>;
}

export function useSamity() {
  const context = useContext(SamityContext);
  if (!context) {
    throw new Error('useSamity must be used within a SamityProvider');
  }
  return context;
}
