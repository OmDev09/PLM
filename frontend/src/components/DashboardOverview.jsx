import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardOverview = ({ setActiveMenu }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ draft: 0, pending: 0, completed: 0 });
    const [recentEcos, setRecentEcos] = useState([]);
    const [loading, setLoading] = useState(true);

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/eco');

                // Calculate stats
                let drafts = 0, pending = 0, completed = 0;

                data.forEach(eco => {
                    if (eco.status === 'Draft' || eco.stage?.isDraft) drafts++;
                    else if (eco.stage?.isFinal) completed++;
                    else pending++; // Approval or New stages
                });

                setStats({ draft: drafts, pending: pending, completed: completed });

                // Get most recent 5
                // Assuming data is sorted by creation or just taking last 5 for mockup
                setRecentEcos(data.slice(-5).reverse());

            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user?.token]);

    const staggerCards = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1, y: 0,
            transition: { staggerChildren: 0.1, duration: 0.4, ease: "easeOut" }
        }
    };
    const cardItem = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-full transition-colors duration-300">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Welcome back, {user?.email?.split('@')[0]}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Here is the current state of your Engineering Change Order pipeline.</p>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">Loading metrics...</div>
            ) : (
                <motion.div variants={staggerCards} initial="hidden" animate="show" className="space-y-8">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div variants={cardItem} className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Draft ECOs</p>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 transition-colors">{stats.draft}</h3>
                                </div>
                                <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg text-slate-500 dark:text-slate-400"><FileText size={24} /></div>
                            </div>
                            <button onClick={() => setActiveMenu('ecos')} className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">View drafts <ArrowRight size={14} /></button>
                        </motion.div>

                        <motion.div variants={cardItem} className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl shadow-sm border border-blue-200 dark:border-indigo-500/30 p-6 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Pending Approval</p>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 transition-colors">{stats.pending}</h3>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-lg text-amber-600 dark:text-amber-400"><Clock size={24} /></div>
                            </div>
                            <button onClick={() => setActiveMenu('ecos')} className="text-sm font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-1 relative z-10 transition-colors">Review requests <ArrowRight size={14} /></button>
                        </motion.div>

                        <motion.div variants={cardItem} className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</p>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 transition-colors">{stats.completed}</h3>
                                </div>
                                <div className="bg-green-50 dark:bg-emerald-500/10 border border-green-200 dark:border-emerald-500/20 p-3 rounded-lg text-green-600 dark:text-emerald-400"><CheckCircle2 size={24} /></div>
                            </div>
                            <button onClick={() => setActiveMenu('reporting')} className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">View history <ArrowRight size={14} /></button>
                        </motion.div>
                    </div>

                    {/* Recent ECOs Preview */}
                    <motion.div variants={cardItem} className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 dark:text-white">Recent Pipeline Activity</h2>
                            <button onClick={() => setActiveMenu('ecos')} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-white/5 text-slate-500 dark:text-slate-400 font-semibold uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">ECO Title</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {recentEcos.length > 0 ? recentEcos.map(eco => (
                                        <tr key={eco._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{eco.title}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400 uppercase font-mono border border-slate-200 dark:border-white/5">{eco.type}</span></td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${eco.stage?.isFinal ? 'bg-green-50 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-500/20' : (eco.status === 'Draft' || eco.stage?.isDraft) ? 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-white/10' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'}`}>
                                                    {eco.stage?.isFinal ? 'DONE' : (eco.status === 'Draft' ? 'DRAFT' : (eco.stage?.name || 'NEW'))}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <AlertCircle size={32} className="mb-2 opacity-50" />
                                                    <p>No recent activity found. Start your first ECO.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardOverview;
