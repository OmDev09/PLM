import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList';
import ECOList from '../components/ECOList';
import { motion } from 'framer-motion';

const EngineerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('products');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-600/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Engineering Portal</h1>
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">Active</span>
                    </div>
                    <div className="flex flex-row items-center gap-6">
                        <div className="text-xs font-mono text-slate-400">{user?.email}</div>
                        <button onClick={logout} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors bg-slate-900 px-4 py-2 border border-slate-800 rounded-lg hover:border-slate-700">Disconnect</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                <div className="flex border-b border-slate-800/80 mb-8 mt-2">
                    <button onClick={() => setActiveTab('products')} className={`pb-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'products' ? 'border-blue-500 text-blue-400 opacity-100 shadow-[0_4px_15px_-3px_rgba(59,130,246,0.3)]' : 'border-transparent text-slate-500 opacity-70 hover:opacity-100 hover:border-slate-700'}`}>
                        Master Catalog
                    </button>
                    <button onClick={() => setActiveTab('ecos')} className={`pb-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'ecos' ? 'border-blue-500 text-blue-400 opacity-100 shadow-[0_4px_15px_-3px_rgba(59,130,246,0.3)]' : 'border-transparent text-slate-500 opacity-70 hover:opacity-100 hover:border-slate-700'}`}>
                        My Proposals
                    </button>
                </div>
                <motion.div key={activeTab} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-[500px]">
                    {activeTab === 'products' ? <ProductList /> : <ECOList />}
                </motion.div>
            </main>
        </motion.div>
    );
};
export default EngineerDashboard;
