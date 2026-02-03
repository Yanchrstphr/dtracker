
import { CURRENCIES } from './constants.ts';
import { PaymentSchedule, PaymentStatus, InstallmentCount } from './types.ts';

export const formatCurrencyInput = (amount: number, currencyCode: string) => {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getCurrencySymbol = (code: string) => {
  return CURRENCIES.find(c => c.code === code)?.symbol || '$';
};

export const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const generatePaymentSchedule = (
  firstPaymentDate: string,
  amountPerMonth: number,
  installments: InstallmentCount
): PaymentSchedule[] => {
  const schedules: PaymentSchedule[] = [];
  const start = new Date(firstPaymentDate);

  for (let i = 0; i < installments; i++) {
    const dueDate = addMonths(start, i);
    schedules.push({
      id: Math.random().toString(36).substr(2, 9),
      dueDate: dueDate.toISOString(),
      amount: amountPerMonth,
      status: PaymentStatus.PENDING,
      installmentIndex: i + 1,
    });
  }
  return schedules;
};

export const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};
