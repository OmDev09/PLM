import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileSearch, CheckCircle, ArrowRight, X, Activity, Cpu, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ECOList = () => {
    const { user } = useAuth();
    const [ecos, setEcos] = useState([]);
    const [selectedEco, setSelectedEco] = useState(null);
    const [diff, setDiff] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchEcos = async () => {
        try {
            const res = await api.get('/eco'); setEcos(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchEcos(); }, []);

    const openComparison = async (eco) => {
        setSelectedEco(eco);
        try {
            const res = await api.get(`/eco/${eco._id}/comparison`);
            setDiff(res.data); setIsModalOpen(true);
        } catch (err) { alert('Error fetching comparison details'); }
    };

    const handleApprove = async () => {
        try {
            await api.post(`/eco/${selectedEco._id}/approve`);
            setIsModalOpen(false); fetchEcos();
        } catch (err) { alert(err.response?.data?.msg || 'Error approving ECO'); }
    };

    const handleApply = async () => {
        try {
            await api.post(`/eco/${selectedEco._id}/apply`);
            setIsModalOpen(false); fetchEcos();
        } catch (err) { alert(err.response?.data?.msg || 'Error applying ECO'); }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            new: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]',
            approval: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
            done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
        };
        return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colors[status]}`}>{status}</span>;
    };

    // Helper to render complex BoM Array diffs
    const renderBoMArrayDiff = (title, oldArray = [], newArray = [], isQuantities = false) => {
        // Find all unique names
        const allNames = [...new Set([...oldArray.map(i => i.name), ...newArray.map(i => i.name)])];

        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
                <div className="bg-slate-800/50 px-4 py-2 text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700/50 flex items-center gap-2">
                    {isQuantities ? <Cpu size={14} className="text-emerald-500" /> : <Wrench size={14} className="text-teal-500" />} {title}
                </div>
                <div className="divide-y divide-slate-800/50">
                    {allNames.map(name => {
                        const oldItem = oldArray.find(i => i.name === name);
                        const newItem = newArray.find(i => i.name === name);

                        if (!oldItem && newItem) {
                            return <div key={name} className="px-5 py-3 flex justify-between items-center bg-emerald-900/10"><span className="text-emerald-400 font-mono text-sm">+ {name}</span> <span className="text-emerald-400 text-xs font-bold">{isQuantities ? `Qty: ${newItem.quantity}` : `${newItem.timeMinutes} mins`}</span></div>;
                        }
                        if (oldItem && !newItem) {
                            return <div key={name} className="px-5 py-3 flex justify-between items-center bg-red-900/10"><span className="text-red-400/80 font-mono text-sm line-through">- {name}</span> <span className="text-red-400/80 text-xs font-bold line-through">{isQuantities ? `Qty: ${oldItem.quantity}` : `${oldItem.timeMinutes} mins`}</span></div>;
                        }
                        if (oldItem && newItem) {
                            const oldVal = isQuantities ? oldItem.quantity : oldItem.timeMinutes;
                            const newVal = isQuantities ? newItem.quantity : newItem.timeMinutes;
                            if (oldVal === newVal) {
                                return <div key={name} className="px-5 py-3 flex justify-between items-center opacity-50"><span className="text-slate-400 font-mono text-sm">{name}</span> <span className="text-slate-500 text-xs">{isQuantities ? `Qty: ${oldVal}` : `${oldVal} mins`}</span></div>;
                            } else {
                                const isIncrease = newVal > oldVal;
                                const color = isIncrease ? 'text-emerald-400' : 'text-red-400';
                                return <div key={name} className="px-5 py-3 flex justify-between items-center bg-blue-900/5">
                                    <span className="text-blue-300 font-mono text-sm">~ {name}</span>
                                    <span className={`text-xs font-bold flex items-center gap-2`}><span className="text-slate-500 line-through">{oldVal}</span> <ArrowRight size={12} className="text-slate-600" /> <span className={color}>{newVal} {isQuantities ? 'units' : 'mins'}</span></span>
                                </div>;
                            }
                        }
                        return null;
                    })}
                    {allNames.length === 0 && <div className="px-5 py-3 text-slate-500 text-xs font-mono">No nodes deployed.</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-3 tracking-tight">
                    <Activity className="text-purple-500" /> ECO Pipeline
                </h2>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800/50">
                        <thead className="bg-slate-900/80">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">ECO Title</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Author</th>
                                <th className="px-6 py-5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            <AnimatePresence>
                                {ecos.map((eco, idx) => (
                                    <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={eco._id} className="hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-200">{eco.title}</td>
                                        <td className="px-6 py-5 whitespace-nowrap flex items-center gap-2">
                                            {eco.type === 'bom' ? <span className="bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-800">BoM Node</span> : <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-800">Product</span>}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap"><StatusBadge status={eco.status} /></td>
                                        <td className="px-6 py-5 whitespace-nowrap text-xs text-slate-500 font-mono">{eco.createdBy?.email}</td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => openComparison(eco)}
                                                className="text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                            >
                                                <FileSearch size={14} className="text-blue-400" /> Diff Matrix
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {ecos.length === 0 && <div className="text-center py-20 text-slate-600 text-sm tracking-widest uppercase font-bold">Pipeline Empty.</div>}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {isModalOpen && selectedEco && diff && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-panel p-0 w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-700 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-slate-800 bg-slate-900/80 flex justify-between items-start shrink-0">
                                <div>
                                    <h3 className="text-3xl font-extrabold text-white tracking-tight">{selectedEco.title}</h3>
                                    <div className="flex gap-4 items-center">
                                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                            Diff against <span className="text-purple-400 font-mono">{selectedEco.type === 'bom' ? 'BoM' : 'Product Master'} v{diff.targetCurrent?.version || 1}</span>
                                        </p>
                                        <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${diff.versionUpdate ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-orange-900/30 text-orange-400 border-orange-800'}`}>
                                            {diff.versionUpdate ? 'Version Bump Enabled' : 'IN-PLACE EDIT (DANGER)'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <StatusBadge status={selectedEco.status} />
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-950/50 relative overflow-y-auto w-full">
                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none"></div>
                                <div className="relative z-10">

                                    {diff.type === 'product' ? (
                                        <div>
                                            {Object.keys(diff.proposedChanges).map(key => {
                                                const currentVal = diff.targetCurrent[key];
                                                const proposedVal = diff.proposedChanges[key];
                                                if (currentVal === proposedVal) return null;
                                                return (
                                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={key} className="grid grid-cols-3 gap-6 bg-slate-900/60 p-5 rounded-xl border border-slate-800 mb-3 items-center backdrop-blur-sm shadow-inner overflow-hidden relative">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50"></div>
                                                        <div className="font-bold text-slate-300 capitalize text-sm pl-2">{key}</div>
                                                        <div className="text-slate-400 bg-slate-950/50 p-3 rounded-lg text-sm line-through decoration-red-500/50 font-mono shadow-inner border border-slate-800/50">{currentVal}</div>
                                                        <div className="text-emerald-400 bg-emerald-950/20 p-3 rounded-lg text-sm font-mono font-bold flex items-center gap-3 border border-emerald-900/30 text-right"><ArrowRight size={16} className="text-emerald-500 opacity-50 shrink-0" /> {proposedVal}</div>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            {renderBoMArrayDiff('Material Components', diff.targetCurrent.components, diff.proposedChanges.components, true)}
                                            {renderBoMArrayDiff('Workflow Operations', diff.targetCurrent.operations, diff.proposedChanges.operations, false)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-8 py-6 border-t border-slate-800 flex justify-between items-center bg-slate-900/80 shrink-0">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 border border-slate-700 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    Close View
                                </button>

                                <div className="flex gap-4">
                                    {selectedEco.status === 'new' && (user?.role === 'Approver' || user?.role === 'Admin') && (
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApprove} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                            <CheckCircle size={16} /> Authorize Proposal
                                        </motion.button>
                                    )}
                                    {selectedEco.status === 'approval' && (user?.role === 'Engineer' || user?.role === 'Approver' || user?.role === 'Admin') && (
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApply} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] flex outline-none border-none">
                                            <div className="flex flex-col items-center">
                                                <span className="flex items-center gap-2 text-xs uppercase tracking-widest"><CheckCircle size={16} /> Push To Environment</span>
                                                {diff.versionUpdate ? (
                                                    <span className="text-[9px] text-emerald-100/70 font-mono mt-0.5 tracking-wider">(Generates v{(diff.targetCurrent?.version || 1) + 1})</span>
                                                ) : (
                                                    <span className="text-[9px] text-orange-200/90 font-mono mt-0.5 tracking-wider">Warning: Modifying v{diff.targetCurrent?.version || 1} in-place</span>
                                                )}
                                            </div>
                                        </motion.button>
                                    )}
                                    {selectedEco.status === 'done' && (
                                        <div className="px-6 py-3 bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-xl border border-emerald-500/20 flex items-center gap-2">
                                            <CheckCircle size={16} /> Mutated & Deployed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ECOList;
