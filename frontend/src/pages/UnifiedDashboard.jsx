import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, UserCircle, FileText, Database, Settings as SettingsIcon, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import ECOList from '../components/ECOList';
import ProductList from '../components/ProductList';
import AuditReport from '../components/AuditReport';

import BoMList from '../components/BoMList';

import Settings from './Settings';

const UnifiedDashboard = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState('ecos');
    const [masterExpanded, setMasterExpanded] = useState(true);
    const [settingsExpanded, setSettingsExpanded] = useState(false);

    const renderContent = () => {
        switch (activeMenu) {
            case 'ecos': return <ECOList />;
            case 'products': return <ProductList />;
            case 'boms': return <BoMList />;
            case 'reporting': return <AuditReport />;
            case 'settings': return <Settings />;
            default: return <ECOList />;
        }
    };

    const menuTitle = {
        'ecos': 'Engineering Change Orders (ECOs)',
        'products': 'Master Data / Products',
        'boms': 'Master Data / Bills of Materials',
        'reporting': 'System Reporting',
        'settings': 'Workflow Graph & Pipeline Configuration'
    }[activeMenu];

    return (
        <div className="flex h-screen bg-gray-50 text-slate-900 font-sans overflow-hidden">

            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 hidden'}`}>
                <div className="h-14 flex items-center px-6 border-b border-gray-200 shrink-0">
                    <span className="font-extrabold text-lg text-slate-800 tracking-tight">NEXUS PLM</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1.5 px-3 shadow-sm-light">
                        <button
                            onClick={() => setActiveMenu('ecos')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${activeMenu === 'ecos' ? 'bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent'}`}
                        >
                            <FileText size={18} className={activeMenu === 'ecos' ? 'text-blue-600' : 'text-slate-400'} /> Engineering Change Orders (ECOs)
                        </button>

                        <div>
                            <button
                                onClick={() => setMasterExpanded(!masterExpanded)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors text-slate-600 hover:bg-gray-50 hover:text-slate-900 font-medium`}
                            >
                                <div className="flex items-center gap-3"><Database size={16} /> Master Data</div>
                                {masterExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            {masterExpanded && (
                                <div className="pl-9 pr-3 mt-1 space-y-1">
                                    <button onClick={() => setActiveMenu('boms')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${activeMenu === 'boms' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-800'}`}>Bills of Materials</button>
                                    <button onClick={() => setActiveMenu('products')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${activeMenu === 'products' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-800'}`}>Products</button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setActiveMenu('reporting')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${activeMenu === 'reporting' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900 font-medium'}`}
                        >
                            <Activity size={16} /> Reporting
                        </button>

                        <div>
                            <button
                                onClick={() => setSettingsExpanded(!settingsExpanded)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors text-slate-600 hover:bg-gray-50 hover:text-slate-900 font-medium`}
                            >
                                <div className="flex items-center gap-3"><SettingsIcon size={16} /> Settings</div>
                                {settingsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            {settingsExpanded && (
                                <div className="pl-9 pr-3 mt-1 space-y-1">
                                    <button onClick={() => setActiveMenu('settings')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${activeMenu === 'settings' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-800'}`}>ECO's Stages Approval</button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">

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
