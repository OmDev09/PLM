import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, UserCircle, FileText, Database, Settings as SettingsIcon, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import ECOList from '../components/ECOList';
import ProductList from '../components/ProductList';
import AuditReport from '../components/AuditReport';

import BoMList from '../components/BoMList';

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
            default: return <ECOList />;
        }
    };

    const menuTitle = {
        'ecos': 'Engineering Change Orders (ECOs)',
        'products': 'Master Data / Products',
        'boms': 'Master Data / Bills of Materials',
        'reporting': 'System Reporting'
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
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${activeMenu === 'ecos' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900 font-medium'}`}
                        >
                            <FileText size={16} /> Engineering Change Orders (ECOs)
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
                                    <button className="w-full text-left px-3 py-1.5 rounded-md text-sm text-slate-500 hover:bg-gray-50 transition-colors">ECO Stages</button>
                                    <button className="w-full text-left px-3 py-1.5 rounded-md text-sm text-slate-500 hover:bg-gray-50 transition-colors">Approvals</button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Navigation Bar */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-800 focus:outline-none p-1 rounded-md hover:bg-gray-100 transition-colors">
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 w-full max-w-sm ml-4 relative">
                            <Search size={16} className="absolute left-3 text-slate-400" />
                            <input type="text" placeholder={`Search ${menuTitle}...`} className="w-full pl-9 pr-4 py-1.5 bg-gray-100 border-transparent rounded-md text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="flex items-center justify-center flex-1 absolute left-1/2 -translate-x-1/2 pointer-events-none">
                        <h1 className="text-base font-semibold text-slate-800">{menuTitle}</h1>
                    </div>

                    <div className="flex items-center justify-end gap-3 flex-1 relative group cursor-pointer">
                        <div className="text-sm font-medium text-slate-700 hidden sm:block">{user?.email}</div>
                        <UserCircle size={28} className="text-slate-400" />

                        {/* Profile Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-bold truncate">{user?.email}</p>
                                <p className="text-xs text-gray-500 uppercase">{user?.role}</p>
                            </div>
                            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors">Log out</button>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default UnifiedDashboard;
