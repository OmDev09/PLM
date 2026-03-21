import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList';
import { motion } from 'framer-motion';

const OperationsDashboard = () => {
    const { user, logout } = useAuth();
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-emerald-600/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Operations View</h1>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Read Only</span>
                    </div>
                    <div className="flex flex-row items-center gap-6">
                        <div className="text-xs font-mono text-slate-400">{user?.email}</div>
                        <button onClick={logout} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors bg-slate-900 px-4 py-2 border border-slate-800 rounded-lg hover:border-slate-700">Disconnect</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="mb-10 pl-8">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Active Production Master</h2>
                    <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mt-2">Verified catalog artifacts ready for assembly pipeline.</p>
                </div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <ProductList />
                </motion.div>
            </main>
        </motion.div>
    );
};
export default OperationsDashboard;
