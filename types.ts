
export type InstallmentCount = 1 | 3 | 6 | 9 | 12;

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
}

export enum DebtDirection {
  LENT = 'LENT',
  BORROWED = 'BORROWED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export interface PaymentSchedule {
  id: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  paidDate?: string;
  installmentIndex: number;
}

export interface Debt {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  counterPartyId?: string;
  direction: DebtDirection;
  totalAmount: number;
  amountPerMonth: number;
  installments: InstallmentCount;
  startDate: string;
  firstPaymentDate: string;
  currency: string;
  payments: PaymentSchedule[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface UserSettings {
  currency: string;
  reminderFrequency: number;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  overdueAlerts: boolean;
}
