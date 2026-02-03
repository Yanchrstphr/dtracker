
import React, { useState } from 'react';
import { Debt, User, PaymentStatus, DebtDirection } from '../types.ts';
import { isSameDay, formatCurrencyInput } from '../utils.ts';
import { MOCK_USERS } from '../constants.ts';

interface CalendarViewProps {
  debts: Debt[];
  currentUser: User;
  onUpdatePayment: (debtId: string, paymentId: string, status: PaymentStatus) => void;
  selectedDebtIds: Set<string>;
  onBulkMarkAsPaid: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  debts, 
  currentUser, 
  onUpdatePayment,
  selectedDebtIds,
  onBulkMarkAsPaid
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState<{debtId: string, paymentId: string, title: string} | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const numDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const monthName = currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  const myDebts = debts.filter(d => d.creatorId === currentUser.id || d.counterPartyId === currentUser.id);
  const allPayments = myDebts.flatMap(d => d.payments.map(p => ({ ...p, debt: d })));
  const selectedDayPayments = selectedDay ? allPayments.filter(p => isSameDay(new Date(p.dueDate), selectedDay)) : [];

  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= numDays; i++) days.push(new Date(year, month, i));

  const handleConfirmAction = (bulk: boolean) => {
    if (!confirmingPayment) return;
    if (bulk) onBulkMarkAsPaid();
    else onUpdatePayment(confirmingPayment.debtId, confirmingPayment.paymentId, PaymentStatus.PAID);
    setConfirmingPayment(null);
  };

  const checkIsOverdue = (dueDate: string, status: PaymentStatus) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
    due.setHours(0,0,0,0);
    return status === PaymentStatus.PENDING && due < today;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      <div className="lg:col-span-2 bg-white rounded-[48px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col h-fit">
        <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div>
             <h3 className="text-2xl font-black text-slate-900">{monthName}</h3>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cashflow Schedule</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={prevMonth} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-slate-200 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={nextMonth} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-slate-200 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </header>

        <div className="p-8 grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</div>
          ))}
          {days.map((date, idx) => {
            if (!date) return <div key={idx} className="h-16 sm:h-24 opacity-0 pointer-events-none"></div>;
            const isToday = isSameDay(date, new Date());
            const isSelected = selectedDay && isSameDay(date, selectedDay);
            const dayPayments = allPayments.filter(p => isSameDay(new Date(p.dueDate), date));
            const hasLent = dayPayments.some(p => (p.debt.creatorId === currentUser.id && p.debt.direction === DebtDirection.LENT) || (p.debt.counterPartyId === currentUser.id && p.debt.direction === DebtDirection.BORROWED));
            const hasBorrowed = dayPayments.some(p => (p.debt.creatorId === currentUser.id && p.debt.direction === DebtDirection.BORROWED) || (p.debt.counterPartyId === currentUser.id && p.debt.direction === DebtDirection.LENT));
            const hasOverdue = dayPayments.some(p => checkIsOverdue(p.dueDate, p.status));

            return (
              <button key={idx} onClick={() => { setSelectedDay(date); setExpandedPaymentId(null); }} className={`h-16 sm:h-24 p-3 relative rounded-3xl transition-all border flex flex-col items-center justify-between group ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl scale-[1.05] z-10' : isToday ? 'bg-indigo-50 text-indigo-700 border-indigo-100 font-black' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{date.getDate()}</span>
                <div className="flex space-x-1">
                   {hasLent && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></div>}
                   {hasBorrowed && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`}></div>}
                   {hasOverdue && !isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6 animate-in slide-in-from-right-8 duration-700 delay-100">
        <div className="bg-white rounded-[48px] border border-slate-200 p-8 shadow-sm flex flex-col h-full min-h-[500px]">
           <header className="mb-8">
              <h4 className="text-2xl font-black text-slate-900 leading-tight">{selectedDay?.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'short' })}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Detailed Obligations</p>
           </header>

           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
             {selectedDayPayments.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6 border border-slate-100 shadow-inner">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 </div>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Clear Schedule</p>
               </div>
             ) : (
               selectedDayPayments.map((p) => {
                 const isLent = (p.debt.creatorId === currentUser.id && p.debt.direction === DebtDirection.LENT) || (p.debt.counterPartyId === currentUser.id && p.debt.direction === DebtDirection.BORROWED);
                 const otherParty = MOCK_USERS.find(u => u.id === (p.debt.creatorId === currentUser.id ? p.debt.counterPartyId : p.debt.creatorId));
                 const isExpanded = expandedPaymentId === p.id;
                 const progress = (p.debt.payments.filter(pay => pay.status === PaymentStatus.PAID).length / p.debt.installments) * 100;
                 const isOverdue = checkIsOverdue(p.dueDate, p.status);

                 return (
                   <div key={p.id} className={`rounded-[32px] border transition-all duration-500 overflow-hidden ${
                     isExpanded 
                       ? isOverdue ? 'bg-rose-50 border-rose-200 shadow-xl' : 'bg-slate-50 border-indigo-200 shadow-xl' 
                       : isOverdue ? 'bg-rose-50/50 border-rose-100 hover:border-rose-300' : 'bg-white border-slate-100 hover:border-slate-300'
                   }`}>
                     <div className="p-6 cursor-pointer" onClick={() => setExpandedPaymentId(isExpanded ? null : p.id)}>
                       <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center space-x-2">
                           <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${isLent ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                             {isLent ? 'Receivable' : 'Payable'}
                           </span>
                           {isOverdue && (
                             <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-rose-600 text-white animate-pulse">
                               Overdue
                             </span>
                           )}
                         </div>
                         <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">#{p.installmentIndex} of {p.debt.installments}</span>
                       </div>
                       <div className="flex items-center space-x-4">
                          <img src={otherParty?.avatar} className="w-12 h-12 rounded-2xl shadow-sm border-2 border-white" />
                          <div className="flex-1 truncate">
                            <p className="text-sm font-black text-slate-900 truncate">{p.debt.title}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{otherParty?.name || 'Private'}</p>
                          </div>
                          <div className="text-right">
                             <p className={`text-xl font-black ${isLent ? 'text-emerald-600' : isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>{formatCurrencyInput(p.amount, p.debt.currency)}</p>
                          </div>
                       </div>
                     </div>
                     <div className={`transition-all duration-500 ${isExpanded ? 'max-h-[400px] border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-6 space-y-5">
                           <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Plan</p>
                                 <p className="text-sm font-black text-slate-900">{formatCurrencyInput(p.debt.totalAmount, p.debt.currency)}</p>
                              </div>
                              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Payback Ends</p>
                                 <p className="text-sm font-black text-slate-900">{new Date(p.debt.payments[p.debt.payments.length - 1].dueDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                              </div>
                           </div>
                           <div className="px-1">
                              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-2"><span>Agreement Progress</span><span>{Math.round(progress)}%</span></div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                           </div>
                           <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (p.status !== PaymentStatus.PAID) setConfirmingPayment({ debtId: p.debt.id, paymentId: p.id, title: p.debt.title }); 
                            }} 
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                              p.status === PaymentStatus.PAID 
                                ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                                : isOverdue ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' : 'bg-slate-900 text-white hover:bg-black active:scale-95 shadow-xl shadow-slate-200'
                            }`}
                           >
                              {p.status === PaymentStatus.PAID ? 'Settled Successfully' : isOverdue ? 'Settle Overdue Payment' : 'Execute Payment'}
                           </button>
                        </div>
                     </div>
                   </div>
                 );
               })
             )}
           </div>
        </div>
      </div>

      {confirmingPayment && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in-95 duration-500">
             <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
             <div className="text-center mb-10">
                <h4 className="text-2xl font-black text-slate-900">Authorize Payment</h4>
                <p className="text-sm text-slate-500 mt-3 font-medium">Verify settlement for: <br/><span className="text-indigo-600 font-bold">"{confirmingPayment.title}"</span></p>
                {selectedDebtIds.size > 0 && <p className="mt-4 p-4 bg-amber-50 rounded-2xl text-[10px] text-amber-700 font-bold uppercase border border-amber-100">Apply to all {selectedDebtIds.size} active selections?</p>}
             </div>
             <div className="space-y-3">
                <button onClick={() => handleConfirmAction(false)} className="w-full py-4.5 bg-indigo-600 text-white rounded-[22px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700">Confirm Just This</button>
                {selectedDebtIds.size > 0 && <button onClick={() => handleConfirmAction(true)} className="w-full py-4.5 bg-emerald-600 text-white rounded-[22px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-100 hover:bg-emerald-700">Confirm All</button>}
                <button onClick={() => setConfirmingPayment(null)} className="w-full py-4.5 bg-slate-100 text-slate-500 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200">Dismiss</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
