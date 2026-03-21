import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Clock, User, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuditReport = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/audit', { headers: { Authorization: `Bearer ${user?.token}` } });
                setLogs(res.data);
            } catch (err) { console.error('Error fetching logs', err); }
        };
        fetchLogs();
    }, [user]);

    const getActionColor = (action) => {
        if (action.includes('CREATED') || action.includes('VERSIONED')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
        if (action.includes('APPROVED')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
        if (action.includes('INPLACE')) return 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]';
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]';
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3 tracking-tight">
                    <ShieldAlert className="text-red-500" /> Immutable Audit Trail
                </h2>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800/50">
                        <thead className="bg-slate-900/80">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest"><span className="flex items-center gap-2"><Clock size={12} /> Timestamp</span></th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event Trigger</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest"><span className="flex items-center gap-2"><User size={12} /> Actor</span></th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest"><span className="flex items-center gap-2"><Fingerprint size={12} /> Entity Hash</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            <AnimatePresence>
                                {logs.map((log, idx) => (
                                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }} key={log._id} className="hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getActionColor(log.action)}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300 font-bold">{log.user?.email || 'SYSTEM'} <span className="text-[10px] text-slate-500 ml-2 uppercase font-mono tracking-widest">({log.user?.role})</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono text-slate-600">{log.entityId}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {logs.length === 0 && <div className="text-center py-20 text-slate-600 text-sm tracking-widest uppercase font-bold">No events recorded in system memory.</div>}
            </div>
        </div>
    );
};
export default AuditReport;
