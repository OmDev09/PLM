import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList';
import ECOList from '../components/ECOList';
import { LogOut, Grid } from 'lucide-react';

const EngineerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div className="min-h-screen bg-[#F0F0F4] font-sans text-slate-800">
            <header className="bg-[#00A09D] text-white flex items-center justify-between px-4 h-12 shadow z-10 relative">
                <div className="flex items-center gap-6 h-full">
                    <div className="flex items-center gap-2 cursor-pointer font-bold text-lg mr-4">
                        <Grid size={18} /> <span className="tracking-tight text-base">Engineering PLM</span>
                    </div>
                    <nav className="flex h-full space-x-1 items-end pt-2">
                        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-t-sm text-[13px] font-medium transition-colors ${activeTab === 'products' ? 'bg-[#008784] text-white' : 'text-white/80 hover:bg-[#008784]/50'}`}>Master Data</button>
                        <button onClick={() => setActiveTab('ecos')} className={`px-4 py-2 rounded-t-sm text-[13px] font-medium transition-colors ${activeTab === 'ecos' ? 'bg-[#008784] text-white' : 'text-white/80 hover:bg-[#008784]/50'}`}>My Proposals</button>
                    </nav>
                </div>
                <div className="flex items-center gap-4 text-[13px] font-medium">
                    <span className="hidden md:flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">E</div>
                        <span>{user?.email}</span>
                    </span>
                    <button onClick={logout} className="hover:text-red-300 transition-colors ml-2"><LogOut size={16} /></button>
                </div>
            </header>

            <main className="w-full h-[calc(100vh-48px)] overflow-y-auto">
                {activeTab === 'products' ? <ProductList /> : <ECOList />}
            </main>
        </div>
    );
};
export default EngineerDashboard;
