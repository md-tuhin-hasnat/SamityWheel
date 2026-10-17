export type PaymentMethod = 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cash on Hand';

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export type UserRole = 'admin' | 'member';

export type AppView = 'dashboard' | 'pay' | 'wheel' | 'winners' | 'admin' | 'auth';

export type AdminSubTab = 'verify' | 'spin';

export type AdminFilter = 'all' | 'pending' | 'verified';

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  hasWon: boolean;
  wonMonth: string | null;
  wonAmount: number;
}

export interface Payment {
  id: string;
  userId: string;
  month: string;
  amount: number;
  method: PaymentMethod;
  trxId: string;
  screenshot: string; // Data URI (SVG or Image)
  status: PaymentStatus;
  createdAt?: string;
}

export interface WinnerHistory {
  month: string;
  userId: string;
  userName: string;
  amount: number;
  wonDate?: string;
}

export interface SamityState {
  fixedDepositAmount: number;
  currentMonthIndex: number;
  currentUserId: string;
  activeView: AppView;
  adminSubTab: AdminSubTab;
  adminFilter: AdminFilter;
  selectedMethod: PaymentMethod;
  soundEnabled: boolean;
  users: User[];
  payments: Payment[];
  winnersHistory: WinnerHistory[];
}
