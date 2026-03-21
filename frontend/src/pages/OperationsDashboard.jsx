import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, UserCircle, Database, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import ProductList from '../components/ProductList';
import DashboardOverview from '../components/DashboardOverview';
import BoMList from '../components/BoMList';
import ECOResport from '../components/ECOResport';

const OperationsDashboard = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [masterExpanded, setMasterExpanded] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);

    const renderContent = () => {
        switch (activeMenu) {
            case 'dashboard': return <DashboardOverview setActiveMenu={setActiveMenu} />;
            case 'products': return <ProductList />;
            case 'boms': return <BoMList />;
            case 'reporting': return <ECOResport />;
            default: return <DashboardOverview setActiveMenu={setActiveMenu} />;
        }
    };

    const menuTitle = {
        'dashboard': 'System Overview',
        'products': 'Master Data / Products',
        'boms': 'Master Data / Bills of Materials',
        'reporting': 'System Reporting'
    }[activeMenu] || 'System Overview';

    const renderNavLink = (id, icon, label) => {
        const isActive = activeMenu === id;
        return (
            <button key={id} onClick={() => setActiveMenu(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold shadow-sm border border-blue-100 dark:border-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium border border-transparent'}`}>
                {React.cloneElement(icon, { size: 18, className: isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500' })} {label}
            </button>
        );
    };

    const renderSubNavLink = (id, label) => {
        const isActive = activeMenu === id;
        return (
            <button key={id} onClick={() => setActiveMenu(id)} className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'}`}>{label}</button>
        );
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 256 : 0, opacity: sidebarOpen ? 1 : 0 }}
                className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 flex flex-col overflow-hidden shrink-0 z-50 shadow-sm"
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/10 shrink-0 w-64">
                    <span className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">NEXUS PLM</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 w-64 custom-scrollbar">
                    <nav className="space-y-1.5 px-3">
                        {renderNavLink('dashboard', <Activity />, 'System Overview')}
                        <div>
                            <button onClick={() => setMasterExpanded(!masterExpanded)} className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium`}>
                                <div className="flex items-center gap-3"><Database size={16} /> Master Data</div>
                                {masterExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <AnimatePresence>
                                {masterExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pl-9 pr-3 mt-1 space-y-1 overflow-hidden">
                                        {renderSubNavLink('boms', 'Bills of Materials')}
                                        {renderSubNavLink('products', 'Products')}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {renderNavLink('reporting', <Activity />, 'Reporting')}
                    </nav>
                </div>
            </motion.aside>

            <div className="flex-1 flex flex-col min-w-0 bg-transparent">
                <header className="h-16 bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 z-40 transition-colors shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                            <Menu size={22} />
                        </button>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight hidden sm:block border-l border-slate-200 dark:border-white/10 pl-4">{menuTitle}</h1>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="hidden lg:flex relative max-w-sm w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" />
                            <input type="text" placeholder="Search architecture..." className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent dark:border-white/5 rounded-lg text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-400 dark:focus:border-blue-500/50 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" />
                        </div>

                        <ThemeToggle />

                        <div className="relative cursor-pointer" onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{user?.email || 'ops@plm.com'}</span>
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">Operations Dashboard</span>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold shadow-sm">
                                    {user?.email?.charAt(0).toUpperCase() || 'O'}
                                </div>
                            </div>
                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden origin-top-right z-50 dropdown-menu"
                                    >
                                        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center text-center">
                                            <UserCircle size={32} className="text-slate-400 dark:text-slate-500 mb-2" />
                                            <p className="text-sm font-bold truncate text-slate-800 dark:text-white w-full">{user?.email}</p>
                                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mt-0.5">{user?.role}</p>
                                        </div>
                                        <button onClick={logout} className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-red-600 dark:hover:text-red-400 transition-colors">Log out</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative custom-scrollbar p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default OperationsDashboard;
