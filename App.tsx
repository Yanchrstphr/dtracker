
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import CalendarView from './components/CalendarView.tsx';
import DebtForm from './components/DebtForm.tsx';
import { Debt, User, PaymentStatus, AppNotification, UserSettings } from './types.ts';
import { storage } from './services/storage.ts';
import { MOCK_USERS, DEFAULT_SETTINGS, CURRENCIES } from './constants.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-email' | 'forgot-code' | 'forgot-reset'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [resetUser, setResetUser] = useState<User | null>(null);

  // Settings: Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (currentUser) {
      const allDebts = storage.getDebts(currentUser.id);
      setDebts(allDebts);
      setNotifications(storage.getNotifications(currentUser.id));
      setSettings(storage.getSettings(currentUser.id));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      storage.saveDebts(currentUser.id, debts);
    }
  }, [debts, currentUser]);

  const filteredDebts = useMemo(() => {
    if (!searchQuery.trim()) return debts;
    const query = searchQuery.toLowerCase();
    const users = storage.getUsers();
    return debts.filter(d => {
      const party = users.find(u => u.id === d.counterPartyId)?.name || 'Private';
      return d.title.toLowerCase().includes(query) || 
             party.toLowerCase().includes(query) ||
             d.totalAmount.toString().includes(query);
    });
  }, [debts, searchQuery]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const users = storage.getUsers();
    const user = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
    
    if (user && user.password === passwordInput) {
      setCurrentUser(user);
    } else if (user && user.password !== passwordInput) {
      setAuthError('Incorrect password. Try again.');
    } else {
      setAuthError('User not found. Try Adams or Admin Root mock emails.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!nameInput || !emailInput || !passwordInput) return;

    const users = storage.getUsers();
    if (users.find(u => u.email.toLowerCase() === emailInput.toLowerCase())) {
      setAuthError('Email already registered.');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: nameInput,
      email: emailInput,
      password: passwordInput,
      avatar: `https://picsum.photos/seed/${nameInput}/100`,
    };

    storage.saveUser(newUser);
    setCurrentUser(newUser);
  };

  const handleForgotEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const users = storage.getUsers();
    const user = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase());

    if (user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setResetCode(code);
      setResetUser(user);
      setAuthMode('forgot-code');
      // Simulate sending email
      alert(`SIMULATION: Reset code sent to ${emailInput}: ${code}`);
    } else {
      setAuthError('No account associated with this email.');
    }
  };

  const handleForgotCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput === resetCode) {
      setAuthMode('forgot-reset');
    } else {
      setAuthError('Invalid verification code.');
    }
  };

  const handleForgotReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetUser) {
      const updatedUser = { ...resetUser, password: passwordInput };
      storage.saveUser(updatedUser);
      setAuthError('');
      alert('Password updated successfully! You can now log in.');
      setAuthMode('login');
      setEmailInput(resetUser.email);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus(null);

    if (!currentUser) return;
    if (oldPassword !== currentUser.password) {
      setPasswordChangeStatus({ message: 'Current password is incorrect.', type: 'error' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeStatus({ message: 'New passwords do not match.', type: 'error' });
      return;
    }

    const updatedUser = { ...currentUser, password: newPassword };
    storage.saveUser(updatedUser);
    setCurrentUser(updatedUser);
    setPasswordChangeStatus({ message: 'Password updated successfully!', type: 'success' });
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleUpdatePayment = (debtId: string, paymentId: string, status: PaymentStatus) => {
    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        return {
          ...d,
          payments: d.payments.map(p => {
            if (p.id === paymentId) {
              return { 
                ...p, 
                status, 
                paidDate: status === PaymentStatus.PAID ? new Date().toISOString() : undefined 
              };
            }
            return p;
          })
        };
      }
      return d;
    }));
  };

  const handleAddDebt = (data: any) => {
    const newDebt: Debt = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setDebts([newDebt, ...debts]);
    setShowForm(false);
    
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser!.id,
      title: 'New Debt Tracked',
      message: `Agreement "${data.title}" has been successfully configured.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    storage.saveNotifications(currentUser!.id, updatedNotifs);
  };

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    if (currentUser) {
      storage.saveSettings(currentUser.id, newSettings);
    }
  };

  const markNotifRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    if (currentUser) storage.saveNotifications(currentUser.id, updated);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 md:p-14 rounded-[56px] shadow-2xl w-full max-w-md border border-white">
          <div className="w-20 h-20 bg-indigo-600 rounded-[32px] mx-auto mb-10 flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 text-center mb-2">DTracker</h1>
          <p className="text-slate-400 font-bold uppercase text-center text-[10px] tracking-[0.2em] mb-10">
            {authMode === 'login' ? 'Sign in to your ledger' : 
             authMode === 'signup' ? 'Create new account' :
             authMode === 'forgot-email' ? 'Reset your password' :
             authMode === 'forgot-code' ? 'Enter verification code' : 'Set new password'}
          </p>

          <form onSubmit={
            authMode === 'login' ? handleLogin : 
            authMode === 'signup' ? handleSignUp :
            authMode === 'forgot-email' ? handleForgotEmail :
            authMode === 'forgot-code' ? handleForgotCode : handleForgotReset
          } className="space-y-4">
            {authError && (
              <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl border border-rose-100">
                {authError}
              </div>
            )}
            
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={nameInput} 
                  onChange={(e) => setNameInput(e.target.value)} 
                  placeholder="e.g. John Doe"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-black font-bold transition-all"
                />
              </div>
            )}

            {(authMode === 'login' || authMode === 'signup' || authMode === 'forgot-email') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={emailInput} 
                  onChange={(e) => setEmailInput(e.target.value)} 
                  placeholder="your@email.com"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-black font-bold transition-all"
                />
              </div>
            )}

            {authMode === 'forgot-code' && (
              <div className="space-y-2 text-center">
                <p className="text-xs text-slate-500 mb-4">We sent a 6-digit code to your email.</p>
                <input 
                  required
                  type="text" 
                  maxLength={6}
                  value={codeInput} 
                  onChange={(e) => setCodeInput(e.target.value)} 
                  placeholder="000000"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-center text-2xl tracking-[0.5em] font-black transition-all"
                />
              </div>
            )}

            {(authMode === 'login' || authMode === 'signup' || authMode === 'forgot-reset') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                  {authMode === 'forgot-reset' ? 'New Password' : 'Password'}
                </label>
                <input 
                  required
                  type="password" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-black font-bold transition-all"
                />
              </div>
            )}

            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-indigo-100 mt-6">
              {authMode === 'login' ? 'Continue Access' : 
               authMode === 'signup' ? 'Create Account' : 
               authMode === 'forgot-email' ? 'Send Reset Code' :
               authMode === 'forgot-code' ? 'Verify Code' : 'Update Password'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center space-y-4">
            {authMode === 'login' && (
              <button 
                onClick={() => setAuthMode('forgot-email')}
                className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors block w-full"
              >
                Forgot Password?
              </button>
            )}
            <button 
              onClick={() => {
                if (authMode === 'signup') setAuthMode('login');
                else if (authMode === 'login') setAuthMode('signup');
                else setAuthMode('login');
                setAuthError('');
              }}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              {authMode === 'signup' ? 'Already have an account? Sign in' : 'No account? Sign up instead'}
            </button>
          </div>

          {(authMode === 'login') && (
            <div className="mt-10">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Quick Access Profiles</p>
              <div className="flex justify-center space-x-3">
                {MOCK_USERS.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => {
                      setEmailInput(u.email);
                      setPasswordInput(u.password || '');
                      setAuthMode('login');
                    }}
                    className="flex flex-col items-center group"
                  >
                    <img src={u.avatar} className="w-10 h-10 rounded-xl border-2 border-transparent group-hover:border-indigo-500 transition-all shadow-sm" alt={u.name} />
                    <span className="text-[8px] font-black text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{u.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Layout 
      currentUser={currentUser} 
      onLogout={() => {
        setCurrentUser(null);
        setEmailInput('');
        setPasswordInput('');
        setNameInput('');
      }} 
      notifications={notifications} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="max-w-6xl mx-auto relative">
        {/* Floating Action Button */}
        {['dashboard', 'calendar', 'debts'].includes(activeTab) && (
          <div className="fixed bottom-8 right-8 z-[50]">
            <button 
              onClick={() => setShowForm(true)} 
              className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all active:scale-90 shadow-indigo-200 group"
            >
              <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard debts={filteredDebts} currentUser={currentUser} currency={settings.currency} />}
        {activeTab === 'calendar' && <CalendarView debts={filteredDebts} currentUser={currentUser} onUpdatePayment={handleUpdatePayment} selectedDebtIds={new Set()} onBulkMarkAsPaid={() => {}} />}
        {activeTab === 'debts' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h2 className="text-4xl font-black text-slate-900">Active Agreements</h2>
                  <p className="text-slate-500 font-medium">Manage and track your private contracts</p>
               </div>
               {searchQuery && (
                 <div className="bg-indigo-50 px-6 py-2 rounded-2xl border border-indigo-100 flex items-center space-x-3">
                   <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Searching: {searchQuery}</p>
                   <button onClick={() => setSearchQuery('')} className="text-indigo-400 hover:text-indigo-600 font-black">&times;</button>
                 </div>
               )}
            </header>
            
            {filteredDebts.length === 0 ? (
              <div className="py-40 text-center bg-white rounded-[56px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl mb-6 flex items-center justify-center text-slate-300">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">
                  {searchQuery ? 'No agreements match your search' : 'No active tracking data'}
                </p>
                {searchQuery ? (
                  <button onClick={() => setSearchQuery('')} className="mt-8 text-indigo-600 font-black hover:underline uppercase text-[10px] tracking-widest">Clear Search Filter</button>
                ) : (
                  <button onClick={() => setShowForm(true)} className="mt-8 text-indigo-600 font-black hover:underline uppercase text-[10px] tracking-widest">Start First Agreement →</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                {filteredDebts.map(d => {
                  const users = storage.getUsers();
                  const otherParty = users.find(u => u.id === d.counterPartyId);
                  return (
                    <div key={d.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="flex justify-between items-start mb-8">
                         <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${d.direction === 'LENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{d.direction}</span>
                         <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 mb-2">{d.title}</h4>
                      <div className="flex items-center space-x-2 mb-8">
                        {otherParty && <img src={otherParty.avatar} className="w-6 h-6 rounded-full border border-slate-100" />}
                        <p className="text-slate-400 font-medium text-sm">
                          {otherParty ? `With ${otherParty.name}` : 'Private Agreement'} • {d.installments} Months
                        </p>
                      </div>
                      <div className="flex justify-between items-end border-t border-slate-50 pt-8">
                         <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Contract Total</p>
                            <p className="text-2xl font-black text-indigo-600">{d.currency} {d.totalAmount.toLocaleString()}</p>
                         </div>
                         <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-indigo-600 transition-all shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <header>
               <h2 className="text-4xl font-black text-slate-900">Reminders</h2>
               <p className="text-slate-500 font-medium">Automatic system alerts and notifications</p>
            </header>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-[56px] border border-slate-100">
                  <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">Inbox is empty</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={() => markNotifRead(n.id)} className={`p-8 bg-white rounded-[32px] border transition-all cursor-pointer ${n.read ? 'border-slate-100 opacity-60' : 'border-indigo-100 shadow-lg shadow-indigo-50 border-l-4 border-l-indigo-600'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black text-slate-900">{n.title}</h4>
                       <span className="text-[10px] text-slate-400 font-black uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <header>
               <h2 className="text-4xl font-black text-slate-900">Workspace Settings</h2>
               <p className="text-slate-500 font-medium">Configure preferences and notification system</p>
            </header>
            
            <div className="space-y-10">
              <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 space-y-10">
                 <section className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">General Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-900">Global Currency Preference</label>
                          <select 
                            value={settings.currency} 
                            onChange={(e) => updateSettings({...settings, currency: e.target.value})}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"
                          >
                            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-900">Reminder Frequency (Days before)</label>
                          <select 
                            value={settings.reminderFrequency} 
                            onChange={(e) => updateSettings({...settings, reminderFrequency: parseInt(e.target.value)})}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"
                          >
                            <option value="1">1 Day Before</option>
                            <option value="3">3 Days Before</option>
                            <option value="7">1 Week Before</option>
                            <option value="0">On Due Date Only</option>
                          </select>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Automated Alert System</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px]">
                          <div>
                             <p className="font-black text-slate-900">In-App Notifications</p>
                             <p className="text-xs text-slate-500 font-medium">Real-time alerts inside the DTracker environment</p>
                          </div>
                          <button 
                            onClick={() => updateSettings({...settings, inAppNotifications: !settings.inAppNotifications})}
                            className={`w-14 h-8 rounded-full transition-all relative ${settings.inAppNotifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.inAppNotifications ? 'left-7' : 'left-1'}`}></div>
                          </button>
                       </div>

                       <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px]">
                          <div>
                             <p className="font-black text-slate-900">Email Reminders</p>
                             <p className="text-xs text-slate-500 font-medium">Direct notification to {currentUser.email}</p>
                          </div>
                          <button 
                            onClick={() => updateSettings({...settings, emailNotifications: !settings.emailNotifications})}
                            className={`w-14 h-8 rounded-full transition-all relative ${settings.emailNotifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.emailNotifications ? 'left-7' : 'left-1'}`}></div>
                          </button>
                       </div>

                       <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px]">
                          <div>
                             <p className="font-black text-slate-900">Overdue Alerts</p>
                             <p className="text-xs text-slate-500 font-medium">Critical priority alerts for delayed settlements</p>
                          </div>
                          <button 
                            onClick={() => updateSettings({...settings, overdueAlerts: !settings.overdueAlerts})}
                            className={`w-14 h-8 rounded-full transition-all relative ${settings.overdueAlerts ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.overdueAlerts ? 'left-7' : 'left-1'}`}></div>
                          </button>
                       </div>
                    </div>
                 </section>
              </div>

              {/* Password Management Section */}
              <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10">
                 <section className="space-y-6">
                    <div className="flex items-center space-x-3 border-b border-slate-50 pb-4">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Security & Password</h3>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                      {passwordChangeStatus && (
                        <div className={`p-4 rounded-2xl text-xs font-bold border ${passwordChangeStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {passwordChangeStatus.message}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Current Password</label>
                        <input 
                          required
                          type="password" 
                          value={oldPassword} 
                          onChange={(e) => setOldPassword(e.target.value)} 
                          placeholder="••••••••"
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-black font-bold transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Password</label>
                          <input 
                            required
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            placeholder="••••••••"
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-black font-bold transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm New Password</label>
                          <input 
                            required
                            type="password" 
                            value={confirmNewPassword} 
                            onChange={(e) => setConfirmNewPassword(e.target.value)} 
                            placeholder="••••••••"
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-black font-bold transition-all"
                          />
                        </div>
                      </div>

                      <button type="submit" className="px-10 py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                        Update Password
                      </button>
                    </form>
                 </section>
              </div>
            </div>
          </div>
        )}
      </div>
      {showForm && <DebtForm currentUser={currentUser} onClose={() => setShowForm(false)} onSubmit={handleAddDebt} />}
    </Layout>
  );
};

export default App;
