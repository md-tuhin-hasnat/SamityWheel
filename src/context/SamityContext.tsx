'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, PaymentMethod } from '@/types/samity';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  memberships: {
    id: string;
    samityId: string;
    samityName: string;
    role: string;
  }[];
}

export interface DBUser {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string | null;
}

export interface DBGuess {
  id: string;
  samityId: string;
  userId: string;
  targetMonth: string;
  guessedMemberId: string;
  createdAt: string;
  user?: DBUser;
  guessedMember?: {
    id: string;
    user: {
      id: string;
      name: string;
    };
  };
}

export interface DBSamityMember {
  id: string;
  samityId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  inActiveCycle: boolean;
  hasWonInCurrentCycle: boolean;
  wonMonth: string | null;
  wonAmount: number | null;
  joinedAt: string;
  user: DBUser;
}

export interface DBPayment {
  id: string;
  samityId: string;
  memberId: string;
  userId: string;
  month: string;
  amount: number;
  method: PaymentMethod;
  trxId: string;
  screenshot: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt: string | null;
  createdAt: string;
  user: DBUser;
}

export interface DBWinner {
  id: string;
  samityId: string;
  memberId: string;
  month: string;
  amount: number;
  wonAt: string;
  member: {
    user: {
      id: string;
      name: string;
    };
  };
}

export interface DBSamity {
  id: string;
  name: string;
  description: string | null;
  fixedDepositAmount: number;
  currentMonthIndex: number;
  monthsList: string[];
  drawDayOfMonth: number;
  drawSchedule: {
    round: number;
    rotationIndex?: number;
    month?: string;
    drawDate: string;
    isDrawRotation?: boolean;
    drawRoundNumber?: number | null;
    drawn?: boolean;
    label?: string;
  }[];
  cycleActive: boolean;
  totalRotations: number;
  rotationsPerDraw: number;
  currentRotationIndex: number;
  rotationIntervalType: string;
  rotationIntervalDays: number;
  cycleStartDate: string;
  nextRotationDeadline: string | null;
  bKashNumber: string | null;
  nagadNumber: string | null;
  bankDetails: string | null;
  cashInstructions: string | null;
  creatorId: string;
  members: DBSamityMember[];
  payments: DBPayment[];
  winners: DBWinner[];
  guesses: DBGuess[];
}

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
  // Auth state
  currentUser: AuthUser | null;
  isLoadingAuth: boolean;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Samity State
  currentSamity: DBSamity | null;
  isLoadingSamity: boolean;
  currentMember: DBSamityMember | null;
  isAdmin: boolean;
  currentMonth: string;
  verifiedPot: number;
  pendingPaymentsCount: number;
  eligibleWheelMembers: DBSamityMember[];

  // Toast & Modal
  toast: ToastState;
  modal: ModalState;
  showToast: (message: string, label?: string) => void;
  closeToast: () => void;
  openReceiptModal: (imageUrl: string, title: string, subtitle: string) => void;
  closeReceiptModal: () => void;

  // Real Database Actions
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  selectSamity: (samityId: string) => Promise<void>;
  refreshSamity: () => Promise<void>;
  createSamity: (data: {
    name: string;
    description?: string;
    fixedDepositAmount: number;
    bKashNumber?: string;
    nagadNumber?: string;
    bankDetails?: string;
    cashInstructions?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  addMember: (phone: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  transferAdmin: (targetMemberId: string) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (data: {
    fixedDepositAmount?: number;
    bKashNumber?: string;
    nagadNumber?: string;
    bankDetails?: string;
    cashInstructions?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  submitPayment: (data: {
    month: string;
    amount: number;
    method: PaymentMethod;
    trxId: string;
    screenshot: string;
  }) => Promise<{ success: boolean; error?: string }>;
  verifyPayment: (paymentId: string) => Promise<{ success: boolean; error?: string }>;
  drawWinner: (memberId: string, month: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  advanceMonth: () => Promise<{ success: boolean; error?: string }>;
  configureCycle: (data: {
    participatingMemberIds?: string[];
    drawDayOfMonth?: number;
    totalRotations?: number;
    rotationIntervalType?: string;
    rotationIntervalDays?: number;
    cycleStartDate?: string;
    currentRotationIndex?: number;
    drawSchedule?: any[];
    resetCycle?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  submitGuess: (targetMonth: string, guessedMemberId: string) => Promise<{ success: boolean; error?: string }>;
}

const SamityContext = createContext<SamityContextType | null>(null);

export function SamityProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [currentSamity, setCurrentSamity] = useState<DBSamity | null>(null);
  const [isLoadingSamity, setIsLoadingSamity] = useState(false);

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

  const showToast = useCallback((message: string, label = 'OK') => {
    setToast({ show: true, message, label });
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
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

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      showToast(next ? 'Sound effects enabled' : 'Sound muted', 'SOUND');
      return next;
    });
  }, [showToast]);

  // Load Samity Details by ID
  const loadSamity = useCallback(async (samityId: string) => {
    setIsLoadingSamity(true);
    try {
      const res = await fetch(`/api/samity/${samityId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentSamity(data.samity);
      }
    } catch (e) {
      console.error('Failed to load samity:', e);
    } finally {
      setIsLoadingSamity(false);
    }
  }, []);

  // Fetch initial session
  const checkSession = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          // If user belongs to a samity, load the first one
          if (data.user.memberships.length > 0) {
            await loadSamity(data.user.memberships[0].samityId);
          }
        } else {
          setCurrentUser(null);
        }
      }
    } catch (e) {
      console.error('Session check failed:', e);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [loadSamity]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Current membership inside the loaded samity
  const currentMember = useMemo(() => {
    if (!currentSamity || !currentUser) return null;
    return currentSamity.members.find((m) => m.userId === currentUser.id) || null;
  }, [currentSamity, currentUser]);

  const isAdmin = useMemo(() => {
    return currentMember?.role === 'ADMIN';
  }, [currentMember]);

  // Current Month name from array
  const currentMonth = useMemo(() => {
    if (!currentSamity || !currentSamity.monthsList) return 'Current Month';
    return currentSamity.monthsList[currentSamity.currentMonthIndex] || 'Current Month';
  }, [currentSamity]);

  // Verified pot for the current month
  const verifiedPot = useMemo(() => {
    if (!currentSamity) return 0;
    return currentSamity.payments
      .filter((p) => p.month === currentMonth && p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [currentSamity, currentMonth]);

  const pendingPaymentsCount = useMemo(() => {
    if (!currentSamity) return 0;
    return currentSamity.payments.filter((p) => p.status === 'PENDING').length;
  }, [currentSamity]);

  // Members eligible for wheel draw (only participating members in this cycle who have not won yet)
  const eligibleWheelMembers = useMemo(() => {
    if (!currentSamity) return [];
    return currentSamity.members.filter(
      (m) => m.inActiveCycle !== false && !m.hasWonInCurrentCycle
    );
  }, [currentSamity]);

  // Actions
  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setCurrentUser(data.user);
      if (data.user.memberships.length > 0) {
        await loadSamity(data.user.memberships[0].samityId);
      }
      setActiveView('dashboard');
      showToast(`Welcome, ${data.user.name}!`, 'LOGGED IN');
      return { success: true };
    } catch {
      return { success: false, error: 'Connection error during login' };
    }
  };

  const signup = async (name: string, phone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }
      setCurrentUser(data.user);
      setActiveView('dashboard');
      showToast(`Account created for ${data.user.name}!`, 'WELCOME');
      return { success: true };
    } catch {
      return { success: false, error: 'Connection error during signup' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setCurrentSamity(null);
    setActiveView('auth');
    showToast('You have been logged out', 'LOGOUT');
  };

  const selectSamity = async (samityId: string) => {
    await loadSamity(samityId);
    showToast('Switched Samity', 'SWITCHED');
  };

  const refreshSamity = async () => {
    if (currentSamity) {
      await loadSamity(currentSamity.id);
    }
  };

  const createSamity = async (data: {
    name: string;
    description?: string;
    fixedDepositAmount: number;
    bKashNumber?: string;
    nagadNumber?: string;
    bankDetails?: string;
    cashInstructions?: string;
  }) => {
    try {
      const res = await fetch('/api/samity/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to create Samity' };
      }
      // Re-fetch me to get updated memberships
      await checkSession();
      await loadSamity(resData.samity.id);
      setActiveView('dashboard');
      showToast(`"${resData.samity.name}" created! You are the Admin and Member #1.`, 'CREATED');
      return { success: true };
    } catch {
      return { success: false, error: 'Network error creating Samity' };
    }
  };

  const addMember = async (phone: string, name?: string) => {
    if (!currentSamity) return { success: false, error: 'No active Samity' };
    try {
      const res = await fetch(`/api/samity/${currentSamity.id}/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to add member' };
      }
      await refreshSamity();
      showToast(`${resData.member.user.name} added to the Samity!`, 'MEMBER ADDED');
      return { success: true };
    } catch {
      return { success: false, error: 'Error adding member' };
    }
  };

  const transferAdmin = async (targetMemberId: string) => {
    if (!currentSamity) return { success: false, error: 'No active Samity' };
    try {
      const res = await fetch(`/api/samity/${currentSamity.id}/transfer-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMemberId }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to transfer admin' };
      }
      await checkSession();
      await refreshSamity();
      showToast(resData.message, 'ADMIN TRANSFERRED');
      return { success: true };
    } catch {
      return { success: false, error: 'Error transferring admin' };
    }
  };

  const updateSettings = async (data: {
    fixedDepositAmount?: number;
    bKashNumber?: string;
    nagadNumber?: string;
    bankDetails?: string;
    cashInstructions?: string;
  }) => {
    if (!currentSamity) return { success: false, error: 'No active Samity' };
    try {
      const res = await fetch(`/api/samity/${currentSamity.id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to update settings' };
      }
      await refreshSamity();
      showToast('Samity settings updated successfully', 'SAVED');
      return { success: true };
    } catch {
      return { success: false, error: 'Error updating settings' };
    }
  };

  const submitPayment = async (data: {
    month: string;
    amount: number;
    method: PaymentMethod;
    trxId: string;
    screenshot: string;
  }) => {
    if (!currentSamity) return { success: false, error: 'No active Samity' };
    try {
      const res = await fetch(`/api/samity/${currentSamity.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Payment submission failed' };
      }
      await refreshSamity();
      setActiveView('dashboard');
      showToast('Deposit submitted! Pending Admin verification.', 'SUBMITTED');
      return { success: true };
    } catch {
      return { success: false, error: 'Error submitting deposit' };
    }
  };

  const verifyPayment = async (paymentId: string) => {
    if (!currentSamity) return { success: false, error: 'No active Samity' };
    try {
      const res = await fetch(`/api/samity/${currentSamity.id}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to verify payment' };
      }
      await refreshSamity();
      showToast('Deposit verified successfully!', 'VERIFIED');
      return { success: true };
    } catch {
      return { success: false, error: 'Error verifying payment' };
    }
  };

  const drawWinner = async (memberId: string, month: string, amount: number) => {
    if (!currentSamity) return { success: false, error: 'No active Samity' };
    try {
      const res = await fetch(`/api/samity/${currentSamity.id}/draw-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, month, amount }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to record winner' };
      }
      await refreshSamity();
      return { success: true };
    } catch {
      return { success: false, error: 'Error recording winner' };
    }
  };

  const advanceMonth = async () => {
    if (!currentSamity) return { success: false, error: 'No active Samity' };
    try {
      const res = await fetch(`/api/samity/${currentSamity.id}/advance-month`, {
        method: 'POST',
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to advance month' };
      }
      await refreshSamity();
      showToast(
        resData.cycleReset
          ? `Cycle advanced to ${resData.currentMonth}. All members eligible again!`
          : `Cycle advanced to ${resData.currentMonth}`,
        'ADVANCED'
      );
      return { success: true };
    } catch {
      return { success: false, error: 'Error advancing month' };
    }
  };

  const configureCycle = async (data: {
    participatingMemberIds?: string[];
    drawDayOfMonth?: number;
    totalRotations?: number;
    rotationIntervalType?: string;
    rotationIntervalDays?: number;
    cycleStartDate?: string;
    currentRotationIndex?: number;
    drawSchedule?: any[];
    resetCycle?: boolean;
  }) => {
    if (!currentSamity) return { success: false, error: 'No active Samity' };
    try {
      const res = await fetch(`/api/samity/${currentSamity.id}/cycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to update cycle' };
      }
      await refreshSamity();
      showToast(resData.message || 'Cycle schedule updated', 'CYCLE SAVED');
      return { success: true };
    } catch {
      return { success: false, error: 'Network error updating cycle' };
    }
  };

  const submitGuess = async (targetMonth: string, guessedMemberId: string) => {
    if (!currentSamity) return { success: false, error: 'No active Samity' };
    try {
      const res = await fetch(`/api/samity/${currentSamity.id}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMonth, guessedMemberId }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to place guess' };
      }
      await refreshSamity();
      showToast(resData.message || 'Your prediction has been recorded!', 'GUESS SAVED');
      return { success: true };
    } catch {
      return { success: false, error: 'Network error placing guess' };
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      isLoadingAuth,
      activeView,
      setActiveView,
      soundEnabled,
      toggleSound,
      currentSamity,
      isLoadingSamity,
      currentMember,
      isAdmin,
      currentMonth,
      verifiedPot,
      pendingPaymentsCount,
      eligibleWheelMembers,
      toast,
      modal,
      showToast,
      closeToast,
      openReceiptModal,
      closeReceiptModal,
      login,
      signup,
      logout,
      selectSamity,
      refreshSamity,
      createSamity,
      addMember,
      transferAdmin,
      updateSettings,
      submitPayment,
      verifyPayment,
      drawWinner,
      advanceMonth,
      configureCycle,
      submitGuess,
    }),
    [
      currentUser,
      isLoadingAuth,
      activeView,
      soundEnabled,
      toggleSound,
      currentSamity,
      isLoadingSamity,
      currentMember,
      isAdmin,
      currentMonth,
      verifiedPot,
      pendingPaymentsCount,
      eligibleWheelMembers,
      toast,
      modal,
      showToast,
      closeToast,
      openReceiptModal,
      closeReceiptModal,
      login,
      signup,
      logout,
      selectSamity,
      refreshSamity,
      createSamity,
      addMember,
      transferAdmin,
      updateSettings,
      submitPayment,
      verifyPayment,
      drawWinner,
      advanceMonth,
      configureCycle,
      submitGuess,
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
