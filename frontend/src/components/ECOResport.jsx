import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Activity, FileText } from 'lucide-react';
import ECOView from './ECOView';

const ECOResport = () => {
    const { user } = useAuth();
    const [ecos, setEcos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeEcoId, setActiveEcoId] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/eco');
            // History view sees all ecos, sorted newest first
            setEcos(data.reverse());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user?.token]);

    const filteredEcos = ecos.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)] transition-colors duration-300">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">System Reporting & History</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Audit log of all Engineering Change Orders. Click any row to view full differential payload.</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg flex items-center gap-3 border border-transparent dark:border-white/10 transition-colors">
                    <Activity size={20} className="text-slate-400 dark:text-slate-500" />
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider transition-colors">Total Records</div>
                        <div className="text-xl font-black text-slate-800 dark:text-white leading-none mt-1 transition-colors">{ecos.length}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden transition-colors">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex gap-4 shrink-0 bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <div className="relative max-w-md w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                        <input type="text" placeholder="Search historical logs..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-white/10 rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-500/20 focus:border-slate-400 dark:focus:border-slate-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-auto flex-1 relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">Loading audit history...</div>
                    ) : (
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 transition-colors">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10 transition-colors">
                                <tr>
                                    <th className="px-6 py-4">ECO Title</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Target Product</th>
                                    <th className="px-6 py-4">Workflow Resolution</th>
                                    <th className="px-6 py-4">Author</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 transition-colors">
                                {filteredEcos.map(eco => (
                                    <tr key={eco._id} onClick={() => setActiveEcoId(eco._id)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 flex items-center gap-2 transition-colors">
                                            <FileText size={14} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" /> {eco.title}
                                        </td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] text-slate-600 dark:text-slate-400 uppercase font-mono border border-slate-200 dark:border-slate-700 tracking-wider font-semibold transition-colors">{eco.type}</span></td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium transition-colors">{eco.productId?.name} <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-1">v{eco.productId?.version}</span></td>
                                        <td className="px-6 py-4">
                                            {eco.stage?.isFinal ? (
                                                <span className="px-2.5 py-1 rounded text-xs font-bold border bg-green-50 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-500/20 uppercase tracking-wider transition-colors">APPLIED (DONE)</span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded text-xs font-bold border bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 uppercase tracking-wider transition-colors">{eco.stage?.name || 'IN-FLIGHT'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 transition-colors">{eco.createdBy?.email}</td>
                                    </tr>
                                ))}
                                {filteredEcos.length === 0 && (<tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium transition-colors">No history log matches your search.</td></tr>)}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {activeEcoId && <ECOView ecoId={activeEcoId} onClose={() => setActiveEcoId(null)} refreshList={fetchHistory} readOnlyReport={true} />}
        </div>
    );
};

export default ECOResport;
