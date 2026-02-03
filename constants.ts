
import { User, UserSettings, InstallmentCount } from './types.ts';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const MOCK_USERS: User[] = [
  { id: 'u0', name: 'Admin Root', avatar: 'https://picsum.photos/seed/admin/100', email: 'villapana3008@gmail.com', isAdmin: true, password: 'password123' },
  { id: 'u1', name: 'Adams', avatar: 'https://picsum.photos/seed/adams/100', email: 'adams@example.com', password: 'password123' },
  { id: 'u2', name: 'Ponse', avatar: 'https://picsum.photos/seed/ponse/100', email: 'ponse@example.com', password: 'password123' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'PHP',
  reminderFrequency: 3,
  emailNotifications: true,
  inAppNotifications: true,
  overdueAlerts: true,
};

export const INSTALLMENT_OPTIONS: InstallmentCount[] = [1, 3, 6, 9, 12];
