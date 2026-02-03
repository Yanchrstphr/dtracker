
import { Debt, AppNotification, UserSettings, User } from '../types.ts';
import { DEFAULT_SETTINGS, MOCK_USERS } from '../constants.ts';

const USERS_KEY = 'dtracker_users';
const getDebtsKey = (userId: string) => `dtracker_${userId}_debts`;
const getNotifsKey = (userId: string) => `dtracker_${userId}_notifs`;
const getSettingsKey = (userId: string) => `dtracker_${userId}_settings`;

const safeJsonParse = <T>(data: string | null, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

export const storage = {
  // User Management
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    const users = safeJsonParse<User[]>(data, []);
    // Always ensure mock users exist for testing
    const combined = [...MOCK_USERS];
    users.forEach((u: User) => {
      if (!combined.find(cu => cu.id === u.id)) {
        combined.push(u);
      }
    });
    return combined;
  },
  saveUser: (user: User) => {
    const users = storage.getUsers();
    const existing = users.findIndex(u => u.id === user.id);
    if (existing > -1) {
      users[existing] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users.filter(u => !MOCK_USERS.find(m => m.id === u.id))));
  },

  // Debt Management
  getDebts: (userId: string): Debt[] => {
    const data = localStorage.getItem(getDebtsKey(userId));
    return safeJsonParse<Debt[]>(data, []);
  },
  saveDebts: (userId: string, debts: Debt[]) => {
    localStorage.setItem(getDebtsKey(userId), JSON.stringify(debts));
  },

  // Notifications
  getNotifications: (userId: string): AppNotification[] => {
    const data = localStorage.getItem(getNotifsKey(userId));
    return safeJsonParse<AppNotification[]>(data, []);
  },
  saveNotifications: (userId: string, notifs: AppNotification[]) => {
    localStorage.setItem(getNotifsKey(userId), JSON.stringify(notifs.slice(0, 50)));
  },

  // Settings
  getSettings: (userId: string): UserSettings => {
    const data = localStorage.getItem(getSettingsKey(userId));
    return safeJsonParse<UserSettings>(data, DEFAULT_SETTINGS);
  },
  saveSettings: (userId: string, settings: UserSettings) => {
    localStorage.setItem(getSettingsKey(userId), JSON.stringify(settings));
  }
};
