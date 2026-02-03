
import React, { useState, useMemo } from 'react';
import { Debt, User, DebtDirection, InstallmentCount } from '../types.ts';
import { MOCK_USERS, INSTALLMENT_OPTIONS, CURRENCIES } from '../constants.ts';
import { generatePaymentSchedule, addMonths, formatCurrencyInput, getCurrencySymbol } from '../utils.ts';

interface DebtFormProps {
  onClose: () => void;
  onSubmit: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  currentUser: User;
}

const DebtForm: React.FC<DebtFormProps> = ({ onClose, onSubmit, currentUser }) => {
  const [title, setTitle] = useState('');
  const [direction, setDirection] = useState<DebtDirection>(DebtDirection.LENT);
  const [counterPartyId, setCounterPartyId] = useState('');
  const [amountPerMonth, setAmountPerMonth] = useState<number>(0);
  const [installments, setInstallments] = useState<InstallmentCount>(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('PHP');

  const selectedCurrencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const totalAmount = amountPerMonth * installments;
  const firstPaymentDate = addMonths(new Date(startDate), 1).toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amountPerMonth) return;

    const payments = generatePaymentSchedule(firstPaymentDate, amountPerMonth, installments);

    onSubmit({
      title,
      creatorId: currentUser.id,
      counterPartyId: counterPartyId || undefined,
      direction,
      totalAmount,
      amountPerMonth,
      installments,
      startDate,
      firstPaymentDate,
      currency,
      payments,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex justify-center items-start overflow-y-auto p-4 z-[100]" onClick={onClose}>
      <div className="bg-white rounded-[48px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-12" onClick={(e) => e.stopPropagation()}>
        <header className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Configure Agreement</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Automatic schedule generation</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all border border-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
             <button type="button" onClick={() => setDirection(DebtDirection.LENT)} className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${direction === DebtDirection.LENT ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-500'}`}>I am Lender</button>
             <button type="button" onClick={() => setDirection(DebtDirection.BORROWED)} className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${direction === DebtDirection.BORROWED ? 'bg-white text-rose-600 shadow-lg' : 'text-slate-500'}`}>I am Borrower</button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Project Installment #2" className="w-full px-6 py-4.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-black font-bold transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Counterparty</label>
                  <select value={counterPartyId} onChange={(e) => setCounterPartyId(e.target.value)} className="w-full px-6 py-4.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-black font-bold">
                    <option value="">Private Individual</option>
                    {MOCK_USERS.filter(u => u.id !== currentUser.id).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-6 py-4.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-black font-bold" />
               </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-6 py-4.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-black font-bold">
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Payment</label>
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">{selectedCurrencySymbol}</div>
                   <input required type="number" value={amountPerMonth || ''} onChange={(e) => setAmountPerMonth(parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-full pl-12 pr-6 py-4.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-black font-black text-xl transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Installment Count (Months)</label>
                <div className="grid grid-cols-5 gap-3">
                   {INSTALLMENT_OPTIONS.map(opt => (
                     <button key={opt} type="button" onClick={() => setInstallments(opt)} className={`py-3.5 rounded-xl text-xs font-black border transition-all ${installments === opt ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-500'}`}>{opt}</button>
                   ))}
                </div>
             </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[32px] text-white">
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Total Obligation</p>
                   <p className="text-4xl font-black">{formatCurrencyInput(totalAmount, currency)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">First Payment</p>
                   <p className="font-bold">{new Date(firstPaymentDate).toLocaleDateString()}</p>
                </div>
             </div>
          </div>

          <button type="submit" className="w-full py-5 bg-black text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] transition-transform active:scale-95 shadow-2xl">Finalize Tracker</button>
        </form>
      </div>
    </div>
  );
};

export default DebtForm;
