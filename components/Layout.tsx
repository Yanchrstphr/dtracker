
import React, { useState } from 'react';
import { User, AppNotification } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  notifications: AppNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  onLogout, 
  notifications,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'debts', label: 'Debts', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2' },
    { id: 'notifications', label: 'Reminders', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5', count: unreadCount },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-x-hidden">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col sticky top-0 z-[60] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h1 className="text-lg font-black text-slate-900">DTracker</h1>
          </div>
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)} 
            className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        
        {/* Mobile Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search debts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] transition-opacity duration-300 md:hidden ${showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowMobileMenu(false)} />
      <nav className={`fixed top-[125px] left-0 bottom-0 w-[280px] bg-white z-[56] border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:hidden ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 space-y-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => handleTabChange(item.id)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
              <div className="flex items-center space-x-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              {item.count ? <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{item.count}</span> : null}
            </button>
          ))}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <div className="flex items-center space-x-3 mb-6 px-4">
              <img src={currentUser.avatar} className="w-10 h-10 rounded-xl border border-slate-200" alt={currentUser.name} />
              <div>
                <p className="text-sm font-black text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{currentUser.email}</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full p-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors">Log Out</button>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 h-screen sticky top-0 shadow-sm z-10">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
          <h1 className="text-xl font-black text-slate-900">DTracker</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-black' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
                <span className="text-sm">{item.label}</span>
              </div>
              {item.count ? <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{item.count}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-100">
           <div className="flex items-center space-x-3 mb-6 px-2">
             <img src={currentUser.avatar} className="w-8 h-8 rounded-lg shadow-sm" alt={currentUser.name} />
             <div className="truncate">
               <p className="text-xs font-black text-slate-900 truncate">{currentUser.name}</p>
               <p className="text-[9px] text-slate-400 font-bold truncate">{currentUser.isAdmin ? 'Administrator' : 'User'}</p>
             </div>
           </div>
           <button onClick={onLogout} className="w-full p-3.5 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-colors">Log Out</button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto">
        {/* Desktop Header Top-bar */}
        <header className="hidden md:flex items-center justify-between px-10 py-6 bg-white border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md bg-white/80">
          <div className="relative w-96">
            <input 
              type="text" 
              placeholder="Search by title, party, or amount..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900">{currentUser.name}</p>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Active Workspace</p>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 pb-28 md:pb-10">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
