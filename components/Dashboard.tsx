
import React from 'react';
import { Debt, User, PaymentStatus, DebtDirection } from '../types.ts';
import { formatCurrencyInput } from '../utils.ts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  debts: Debt[];
  currentUser: User;
  currency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ debts, currentUser, currency }) => {
  const myDebts = debts.filter(d => d.creatorId === currentUser.id || d.counterPartyId === currentUser.id);
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Global totals - Ensuring we strictly separate Lent and Borrowed for the current user view
  const totalLent = myDebts
    .filter(d => (d.creatorId === currentUser.id && d.direction === DebtDirection.LENT) || 
                (d.counterPartyId === currentUser.id && d.direction === DebtDirection.BORROWED))
    .reduce((acc, d) => acc + d.totalAmount, 0);

  const totalBorrowed = myDebts
    .filter(d => (d.creatorId === currentUser.id && d.direction === DebtDirection.BORROWED) || 
                (d.counterPartyId === currentUser.id && d.direction === DebtDirection.LENT))
    .reduce((acc, d) => acc + d.totalAmount, 0);

  const totalPaid = myDebts.reduce((acc, d) => {
    return acc + d.payments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount, 0);
  }, 0);

  // Generate monthly ledger data
  const monthlyData = months.map((m, i) => {
    let lent = 0, borrowed = 0, settled = 0;
    myDebts.forEach(d => {
      d.payments.forEach(p => {
        const pDate = new Date(p.dueDate);
        if (pDate.getFullYear() === currentYear && pDate.getMonth() === i) {
          const isLent = (d.creatorId === currentUser.id && d.direction === DebtDirection.LENT) || 
                         (d.counterPartyId === currentUser.id && d.direction === DebtDirection.BORROWED);
          if (isLent) lent += p.amount; else borrowed += p.amount;
          if (p.status === PaymentStatus.PAID) settled += p.amount;
        }
      });
    });
    return { name: m, lent, borrowed, settled };
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Main Dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">Hello, {currentUser.name}. Your ledger is up to date.</p>
        </div>
        <div className="flex bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
           <div className="px-6 py-2 text-center border-r border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Target</p>
              <p className="text-sm font-black text-slate-900">2026 Phase</p>
           </div>
           <div className="px-6 py-2 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Plans</p>
              <p className="text-sm font-black text-indigo-600">{myDebts.length}</p>
           </div>
        </div>
      </header>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 group hover:border-emerald-200 transition-all hover:shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Receivable</p>
          <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">{formatCurrencyInput(totalLent, currency)}</h3>
          <div className="mt-6 flex items-center justify-between">
             <span className="text-[11px] font-bold text-slate-400">Portfolio Weight</span>
             <span className="text-[11px] font-black text-emerald-500">{(totalLent / (totalLent + totalBorrowed || 1) * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 group hover:border-rose-200 transition-all hover:shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Payable</p>
          <h3 className="text-4xl font-black text-rose-600 tracking-tighter">{formatCurrencyInput(totalBorrowed, currency)}</h3>
          <div className="mt-6 flex items-center justify-between">
             <span className="text-[11px] font-bold text-slate-400">Total Liability</span>
             <span className="text-[11px] font-black text-rose-500">{(totalBorrowed / (totalLent + totalBorrowed || 1) * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px]"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Settled</p>
          <h3 className="text-4xl font-black text-indigo-400 tracking-tighter">{formatCurrencyInput(totalPaid, currency)}</h3>
          <div className="mt-6">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-indigo-200">Payment Health</span>
                <span className="text-[11px] font-black">{Math.round((totalPaid/(totalLent+totalBorrowed||1))*100)}%</span>
             </div>
             <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{width: `${(totalPaid/(totalLent+totalBorrowed||1))*100}%`}}></div>
             </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Row */}
      <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black text-slate-900">Cashflow Ledger</h3>
              <p className="text-sm text-slate-400 font-medium">Monthly breakdowns for current fiscal year</p>
           </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar p-10">
           <div className="flex space-x-6 min-w-max">
             {monthlyData.map((item, idx) => (
               <div key={idx} className={`w-56 p-8 rounded-[40px] border transition-all ${item.lent === 0 && item.borrowed === 0 ? 'bg-slate-50 border-slate-100 opacity-40' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-200'}`}>
                  <p className="text-lg font-black text-slate-900 mb-6">{item.name}</p>
                  <div className="space-y-5">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Receivable</p>
                        <p className={`text-base font-black ${item.lent > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>{formatCurrencyInput(item.lent, currency)}</p>
                     </div>
                     <div className="pt-2 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payable</p>
                        <p className={`text-base font-black ${item.borrowed > 0 ? 'text-rose-600' : 'text-slate-300'}`}>{formatCurrencyInput(item.borrowed, currency)}</p>
                     </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm">
        <div className="mb-10">
           <h3 className="text-2xl font-black text-slate-900">Portfolio Growth</h3>
           <p className="text-sm text-slate-400 font-medium">Trends based on monthly obligations</p>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorLent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={15} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', backgroundColor: '#fff'}}
                itemStyle={{fontWeight: 900, textTransform: 'uppercase', fontSize: '10px'}}
                formatter={(value: number) => formatCurrencyInput(value, currency)}
              />
              <Area type="monotone" dataKey="lent" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorLent)" />
              <Area type="monotone" dataKey="borrowed" stroke="#f43f5e" strokeWidth={5} fillOpacity={1} fill="url(#colorBorrowed)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
