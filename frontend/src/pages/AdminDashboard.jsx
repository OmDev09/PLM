import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList';
import ECOList from '../components/ECOList';
import AuditReport from '../components/AuditReport';
import { LogOut, Grid } from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div className="min-h-screen bg-[#F0F0F4] font-sans text-slate-800">
            {/* Odoo Navbar */}
            <header className="bg-[#714B67] text-white flex items-center justify-between px-4 h-12 shadow z-10 relative">
                <div className="flex items-center gap-6 h-full">
                    <div className="flex items-center gap-2 cursor-pointer font-bold text-lg mr-4">
                        <Grid size={18} /> <span className="tracking-tight text-base">Nexus PLM</span>
                    </div>
                    <nav className="flex h-full space-x-1 items-end pt-2">
                        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-t-sm text-[13px] font-medium transition-colors ${activeTab === 'products' ? 'bg-[#5e3e56] text-white' : 'text-white/80 hover:bg-[#5e3e56]/50'}`}>Master Data</button>
                        <button onClick={() => setActiveTab('ecos')} className={`px-4 py-2 rounded-t-sm text-[13px] font-medium transition-colors ${activeTab === 'ecos' ? 'bg-[#5e3e56] text-white' : 'text-white/80 hover:bg-[#5e3e56]/50'}`}>Engineering Changes</button>
                        <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 rounded-t-sm text-[13px] font-medium transition-colors ${activeTab === 'audit' ? 'bg-[#5e3e56] text-white' : 'text-white/80 hover:bg-[#5e3e56]/50'}`}>Reporting</button>
                    </nav>
                </div>
                <div className="flex items-center gap-4 text-[13px] font-medium">
                    <span className="hidden md:flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">R</div>
                        <span>{user?.email} <span className="opacity-70 ml-1">({user?.role})</span></span>
                    </span>
                    <button onClick={logout} className="hover:text-red-300 transition-colors ml-2"><LogOut size={16} /></button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="w-full h-[calc(100vh-48px)] overflow-y-auto">
                {activeTab === 'products' ? <ProductList /> : activeTab === 'ecos' ? <ECOList /> : <AuditReport />}
            </main>
        </div>
    );
};
export default AdminDashboard;
