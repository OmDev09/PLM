import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Trash2, Cpu, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BoMView = ({ product, onClose }) => {
    const { user } = useAuth();
    const [bom, setBom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMinting, setIsMinting] = useState(false);

    // ECO State
    const [isProposing, setIsProposing] = useState(false);
    const [components, setComponents] = useState([]);
    const [operations, setOperations] = useState([]);
    const [ecoTitle, setEcoTitle] = useState('');
    const [versionUpdate, setVersionUpdate] = useState(true);

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchBom = async () => {
        try {
            const res = await api.get(`/bom/${product._id}`);
            if (res.data && !res.data.isNew) {
                setBom(res.data);
                setComponents(res.data.components);
                setOperations(res.data.operations);
            } else {
                setBom(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBom(); }, [product]);

    const handleMintBaseline = async () => {
        try {
            setIsMinting(true);
            const res = await api.post(`/bom/${product._id}`, { components: [], operations: [] });
            setBom(res.data);
            setComponents([]);
            setOperations([]);
            setIsProposing(true); // Automatically open edit mode
        } catch (err) {
            alert(err.response?.data?.msg || 'Error minting baseline BoM');
        } finally {
            setIsMinting(false);
        }
    };

    const handleProposeECO = async (e) => {
        e.preventDefault();
        if (!ecoTitle) return alert('Provide an ECO Title');
        try {
            await api.post('/eco', {
                title: ecoTitle,
                type: 'bom',
                productId: product._id,
                changes: { components, operations },
                versionUpdate
            });
            alert('BoM ECO Proposed successfully. View in Pipeline.');
            onClose();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error proposing ECO');
        }
    };

    const addComponent = () => setComponents([...components, { name: '', quantity: 1 }]);
    const updateComponent = (idx, field, val) => {
        const newC = [...components]; newC[idx][field] = val; setComponents(newC);
    };
    const removeComponent = (idx) => setComponents(components.filter((_, i) => i !== idx));

    const addOperation = () => setOperations([...operations, { name: '', timeMinutes: 0, workCenter: '' }]);
    const updateOperation = (idx, field, val) => {
        const newO = [...operations]; newO[idx][field] = val; setOperations(newO);
    };
    const removeOperation = (idx) => setOperations(operations.filter((_, i) => i !== idx));

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2 tracking-tight">
                            <Cpu className="text-emerald-500" /> Bill of Materials
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Target Framework: <span className="text-white">{product.name}</span> (v{product.version})</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500 uppercase tracking-widest font-bold animate-pulse">Scanning DB...</div>
                    ) : !bom ? (
                        <div className="text-center py-20">
                            <div className="text-slate-400 mb-6 font-mono text-sm">No baseline BoM exists for this asset.</div>
                            {(user?.role === 'Engineer' || user?.role === 'Admin') && (
                                <button onClick={handleMintBaseline} disabled={isMinting} className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                                    Mint V1 Baseline
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* ECO Header Bar (if proposing) */}
                            {isProposing && (
                                <div className="bg-slate-950/80 p-5 rounded-xl border border-blue-500/30 flex flex-col gap-4">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> ECO Draft Mode Active</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="ECO Designation (Title)" className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm focus:border-blue-500 outline-none w-full font-mono" value={ecoTitle} onChange={e => setEcoTitle(e.target.value)} />
                                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-900 border border-slate-800 rounded-lg">
                                            <input type="checkbox" className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 bg-slate-800 border-slate-700" checked={versionUpdate} onChange={e => setVersionUpdate(e.target.checked)} />
                                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Require Version Bump</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Lists Container */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Components */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2"><Cpu size={14} className="text-emerald-500" /> Material Components</h4>
                                        {isProposing && <button onClick={addComponent} className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"><Plus size={12} className="inline" /> Add Item</button>}
                                    </div>
                                    {components.length === 0 ? <p className="text-xs text-slate-600 font-mono">No components defined.</p> : (
                                        <div className="space-y-3">
                                            {components.map((c, idx) => (
                                                <div key={idx} className="flex gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                                    <input readOnly={!isProposing} type="text" placeholder="Component Name" className={`flex-1 bg-transparent text-sm text-slate-200 border-b border-slate-700 focus:border-emerald-500 outline-none pb-1 font-mono placeholder-slate-600 ${!isProposing && 'border-none'}`} value={c.name} onChange={e => updateComponent(idx, 'name', e.target.value)} />
                                                    <div className="flex items-center gap-2 w-24">
                                                        <span className="text-xs text-slate-500">Qty:</span>
                                                        <input readOnly={!isProposing} type="number" className={`flex-1 bg-transparent text-sm text-white border-b border-slate-700 focus:border-emerald-500 outline-none pb-1 text-right font-mono ${!isProposing && 'border-none'}`} value={c.quantity} onChange={e => updateComponent(idx, 'quantity', e.target.value)} />
                                                    </div>
                                                    {isProposing && <button onClick={() => removeComponent(idx)} className="text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Operations */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2"><Wrench size={14} className="text-teal-500" /> Workflow Operations</h4>
                                        {isProposing && <button onClick={addOperation} className="text-teal-400 hover:text-teal-300 bg-teal-500/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"><Plus size={12} className="inline" /> Add Step</button>}
                                    </div>
                                    {operations.length === 0 ? <p className="text-xs text-slate-600 font-mono">No operations pathway defined.</p> : (
                                        <div className="space-y-3">
                                            {operations.map((o, idx) => (
                                                <div key={idx} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 space-y-2 relative">
                                                    {isProposing && <button onClick={() => removeOperation(idx)} className="absolute top-3 right-3 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>}
                                                    <input readOnly={!isProposing} type="text" placeholder="Operation Step Name" className={`w-full bg-transparent text-sm font-bold text-slate-200 border-b border-slate-700 focus:border-teal-500 outline-none pb-1 ${!isProposing && 'border-none'}`} value={o.name} onChange={e => updateOperation(idx, 'name', e.target.value)} />
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Time (mins)</label>
                                                            <input readOnly={!isProposing} type="number" className={`w-full bg-slate-950 text-xs text-white p-2 rounded-md outline-none border border-slate-800 focus:border-teal-500 font-mono ${!isProposing && 'border-transparent bg-slate-900/30'}`} value={o.timeMinutes} onChange={e => updateOperation(idx, 'timeMinutes', e.target.value)} />
                                                        </div>
                                                        <div className="flex-[2]">
                                                            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Work Center</label>
                                                            <input readOnly={!isProposing} type="text" placeholder="e.g. Paint Booth" className={`w-full bg-slate-950 text-xs text-white p-2 rounded-md outline-none border border-slate-800 focus:border-teal-500 font-mono ${!isProposing && 'border-transparent bg-slate-900/30'}`} value={o.workCenter} onChange={e => updateOperation(idx, 'workCenter', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {bom && (
                    <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex justify-end shrink-0 gap-4">
                        {isProposing ? (
                            <>
                                <button onClick={() => { setIsProposing(false); fetchBom(); }} className="px-6 py-2 border border-slate-700 rounded-lg text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors">Abort ECO</button>
                                <button onClick={handleProposeECO} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(79,70,229,0.3)]">Inject BoM Mutation</button>
                            </>
                        ) : (
                            (user?.role === 'Engineer' || user?.role === 'Admin') && (
                                <button onClick={() => setIsProposing(true)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors">Draft BoM ECO</button>
                            )
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
export default BoMView;
