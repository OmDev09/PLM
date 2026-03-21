import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList';
import ECOList from '../components/ECOList';
import AuditReport from '../components/AuditReport';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('products');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute top-[0%] left-[-5%] w-[30vw] h-[30vw] bg-red-600/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-20 shadow-sm relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-rose-500"></div>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white tracking-widest uppercase">System Admin</h1>
                        <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">Root Access</span>
                    </div>
                    <div className="flex flex-row items-center gap-6">
                        <div className="text-xs font-mono text-slate-400">{user?.email}</div>
                        <button onClick={logout} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors bg-slate-900 px-4 py-2 border border-slate-800 rounded-lg hover:border-slate-700 hover:border-red-500/50">Disconnect</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                <div className="flex border-b border-slate-800/80 mb-8 mt-2 scrollbar-hide overflow-x-auto">
                    <button onClick={() => setActiveTab('products')} className={`pb-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'products' ? 'border-red-500 text-red-400 opacity-100 shadow-[0_4px_15px_-3px_rgba(239,68,68,0.3)]' : 'border-transparent text-slate-500 opacity-70 hover:opacity-100 hover:border-slate-700'}`}>
                        Master Database
                    </button>
                    <button onClick={() => setActiveTab('ecos')} className={`pb-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'ecos' ? 'border-red-500 text-red-400 opacity-100 shadow-[0_4px_15px_-3px_rgba(239,68,68,0.3)]' : 'border-transparent text-slate-500 opacity-70 hover:opacity-100 hover:border-slate-700'}`}>
                        Global Pipeline
                    </button>
                    <button onClick={() => setActiveTab('audit')} className={`pb-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'audit' ? 'border-red-500 text-red-400 opacity-100 shadow-[0_4px_15px_-3px_rgba(239,68,68,0.3)]' : 'border-transparent text-slate-500 opacity-70 hover:opacity-100 hover:border-slate-700'}`}>
                        System Memory
                    </button>
                </div>
                <motion.div key={activeTab} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-[500px]">
                    {activeTab === 'products' ? <ProductList /> : activeTab === 'ecos' ? <ECOList /> : <AuditReport />}
                </motion.div>
            </main>
        </motion.div>
    );
};
export default AdminDashboard;
