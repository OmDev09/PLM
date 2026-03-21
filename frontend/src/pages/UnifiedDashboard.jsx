import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, UserCircle, FileText, Database, Settings as SettingsIcon, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ECOList from '../components/ECOList';
import ProductList from '../components/ProductList';
import ECOResport from '../components/ECOResport';
import DashboardOverview from '../components/DashboardOverview';

import BoMList from '../components/BoMList';

import Settings from './Settings';

const UnifiedDashboard = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState(() => localStorage.getItem('activeMenu') || 'dashboard');

    useEffect(() => {
        localStorage.setItem('activeMenu', activeMenu);
    }, [activeMenu]);
    const [masterExpanded, setMasterExpanded] = useState(true);
    const [settingsExpanded, setSettingsExpanded] = useState(false);

    const renderSectionLabel = (label) => (
        <div className="px-5 pt-5 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            {label}
        </div>
    );

    const renderNavLink = (id, icon, label) => {
        const isActive = activeMenu === id;
        return (
            <div className="px-2" key={id}>
                <button onClick={() => setActiveMenu(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all duration-200 relative group ${isActive ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'}`}>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-blue-600 rounded-r-md"></div>}
                    <div className="w-5 flex justify-center shrink-0">
                        {React.cloneElement(icon, { size: 18, className: isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 transition-colors' })}
                    </div>
                    <span className="truncate">{label}</span>
                </button>
            </div>
        );
    };

    const renderParentLink = (id, icon, label, isExpanded, toggleExpanded) => (
        <div className="px-2" key={id}>
            <button onClick={toggleExpanded} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-gray-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium group">
                <div className="flex items-center gap-3">
                    <div className="w-5 flex justify-center shrink-0">
                        {React.cloneElement(icon, { size: 18, className: 'text-slate-400 dark:text-slate-500 transition-colors' })}
                    </div>
                    <span className="truncate">{label}</span>
                </div>
                {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            </button>
        </div>
    );

    const renderSubNavLink = (id, label) => {
        const isActive = activeMenu === id;
        return (
            <div className="px-2" key={id}>
                <button onClick={() => setActiveMenu(id)} className={`w-full text-left pl-[44px] pr-3 py-2 rounded-lg text-[13px] transition-all duration-200 relative ${isActive ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200/30 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200 font-medium'}`}>
                    {isActive && <div className="absolute left-[22px] top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-600"></div>}
                    {label}
                </button>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeMenu) {
            case 'dashboard': return <DashboardOverview setActiveMenu={setActiveMenu} />;
            case 'ecos': return <ECOList />;
            case 'products': return <ProductList />;
            case 'boms': return <BoMList />;
            case 'reporting': return <ECOResport />;
            case 'settings': return <Settings />;
            default: return <DashboardOverview setActiveMenu={setActiveMenu} />;
        }
    };

    const menuTitle = {
        'dashboard': 'System Overview',
        'ecos': 'Engineering Change Orders (ECOs)',
        'products': 'Master Data / Products',
        'boms': 'Master Data / Bills of Materials',
        'reporting': 'System Reporting',
        'settings': 'Workflow Graph & Pipeline Configuration'
    }[activeMenu] || 'System Overview';

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0a0a0b] text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-150">
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
                className="bg-[#f8fafc] dark:bg-slate-900/40 dark:backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 flex flex-col overflow-hidden shrink-0 z-50 shadow-sm"
            >
                <div className="h-16 flex items-center px-6 border-b border-transparent dark:border-white/10 shrink-0 w-[260px]">
                    <span className="font-extrabold text-[15px] text-slate-800 dark:text-white tracking-tight">NEXUS PLM</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 w-[260px] custom-scrollbar">
                    <nav className="space-y-1">
                        {renderSectionLabel('Main')}
                        {renderNavLink('dashboard', <Activity />, 'System Overview')}
                        {renderNavLink('ecos', <FileText />, 'Engineering Change Orders')}
                        {renderNavLink('reporting', <Activity />, 'Reporting')}

                        {renderSectionLabel('Data')}
                        <div>
                            {renderParentLink('master', <Database />, 'Master Data', masterExpanded, () => setMasterExpanded(!masterExpanded))}
                            <AnimatePresence>
                                {masterExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 mt-0.5 overflow-hidden">
                                        {renderSubNavLink('boms', 'Bills of Materials')}
                                        {renderSubNavLink('products', 'Products')}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {renderSectionLabel('Settings')}
                        <div>
                            {renderParentLink('settings_expand', <SettingsIcon />, 'Settings', settingsExpanded, () => setSettingsExpanded(!settingsExpanded))}
                            <AnimatePresence>
                                {settingsExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 mt-0.5 overflow-hidden">
                                        {renderSubNavLink('settings', 'ECO Stages')}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </nav>
                </div>
            </motion.aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent">

                {/* Top Navigation Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-blue-50 transition-colors">
                            <Menu size={22} />
                        </button>
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block border-l border-slate-200 pl-4">{menuTitle}</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex relative max-w-sm w-80 group">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input type="text" placeholder="Search architecture..." className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder-slate-400" />
                        </div>

                        <div className="relative group cursor-pointer z-50">
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-bold text-slate-800 leading-tight">{user?.email || 'admin@plm.com'}</span>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest leading-tight">{user?.role || 'Admin'}</span>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm">
                                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                                </div>
                            </div>

                            {/* Profile Dropdown */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden origin-top-right transform scale-95 group-hover:scale-100 duration-200">
                                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex flex-col items-center text-center">
                                    <UserCircle size={32} className="text-slate-400 mb-2" />
                                    <p className="text-sm font-bold truncate text-slate-800 w-full">{user?.email}</p>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">{user?.role}</p>
                                </div>
                                <button onClick={logout} className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors">Log out</button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative custom-scrollbar">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default UnifiedDashboard;
