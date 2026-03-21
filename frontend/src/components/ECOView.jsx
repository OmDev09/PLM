import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, CheckSquare, FastForward, ExternalLink, Activity, Save, Play, Plus, Trash2 } from 'lucide-react';

const ECOView = ({ ecoId, onClose, refreshList, readOnlyReport = false }) => {
    const { user } = useAuth();
    const [ecoData, setEcoData] = useState(null);
    const [viewMode, setViewMode] = useState('details'); // details, changes, edit
    const [loading, setLoading] = useState(true);
    const [editForm, setEditForm] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchData = async () => {
        try {
            const res = await api.get(`/eco/${ecoId}/comparison`);
            setEcoData(res.data);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [ecoId]);

    const handleSign = async () => {
        try { await api.post(`/eco/${ecoId}/sign`); fetchData(); refreshList(); } catch (err) { alert(err.response?.data?.msg); }
    };

    const handleStart = async () => {
        try { await api.post(`/eco/${ecoId}/start`); fetchData(); refreshList(); } catch (err) { alert(err.response?.data?.msg); }
    };
    const handleSendApproval = async () => {
        if (!title || !type || !targetCurrent) return alert("Only ECOs with active target identifiers can be sent for approval.");
        setIsSending(true);
        try {
            await api.post(`/eco/${ecoId}/send-approval`);
            alert('ECO sent for approval successfully!');
            fetchData();
            refreshList();
            setIsSending(false);
            setShowConfirm(false);
        } catch (err) { alert(err.response?.data?.msg || 'Error! If you see a 400 Bad Request, your backend server has not refreshed to the new code. You MUST restart your node terminal!'); setIsSending(false); setShowConfirm(false); }
    };
    const handleApprove = async () => {
        try { await api.post(`/eco/${ecoId}/approve`); fetchData(); refreshList(); } catch (err) { alert(err.response?.data?.msg); }
    };

    if (loading) return <div className="p-10 text-center text-slate-600 dark:text-slate-400">Loading ECO payload...</div>;
    if (!ecoData) return <div className="p-10 text-center text-red-500">Failed to load ECO data.</div>;

    const { targetCurrent, proposedChanges, stage, signatures, title, type, versionUpdate, status } = ecoData;

    const DiffRow = ({ label, oldVal, newVal, isCurrency }) => {
        const oV = oldVal || 0; const nV = newVal !== undefined ? newVal : oV;
        if (oV === nV) return <div className="flex justify-between py-2 border-b dark:border-white/5 text-sm text-slate-800 dark:text-slate-300"><span>{label}</span><span className="font-mono">{isCurrency ? '$' : ''}{oV}</span></div>;
        return (
            <div className="flex justify-between py-2 border-b dark:border-white/5 text-sm text-slate-800 dark:text-white">
                <span>{label}</span>
                <div className="font-mono flex items-center gap-2">
                    <span className="text-slate-400 dark:text-slate-500 line-through">{isCurrency ? '$' : ''}{oV}</span>
                    <span className={nV > oV ? 'text-green-600 dark:text-emerald-400 font-bold' : 'text-red-500 dark:text-red-400 font-bold'}>{isCurrency ? '$' : ''}{nV}</span>
                </div>
            </div>
        );
    };

    const renderComparison = () => {
        if (type?.toLowerCase() === 'product') {
            const oldPrice = targetCurrent?.price || 0;
            const newPrice = proposedChanges?.price !== undefined ? proposedChanges.price : oldPrice;
            const oldCost = targetCurrent?.costPrice || 0;
            const newCost = proposedChanges?.costPrice !== undefined ? proposedChanges.costPrice : oldCost;

            const oldAttach = targetCurrent?.attachments || [];
            const newAttach = proposedChanges?.attachments || [...oldAttach];

            const getColor = (o, n) => {
                if (n > o) return 'text-green-600 dark:text-emerald-400 font-bold';
                if (n < o) return 'text-red-500 dark:text-red-400 font-bold';
                return 'text-slate-800 dark:text-slate-200 font-bold';
            };

            return (
                <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
                    <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Product Changes</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Comparing updates for: <span className="font-semibold text-slate-700 dark:text-slate-300">{targetCurrent?.name || 'Unknown Product'}</span></p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-white/5">
                        {/* LEFT: Version 2 Proposed */}
                        <div className="p-6 space-y-6 bg-blue-50/30 dark:bg-blue-900/10 transition-colors">
                            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Version 2 (Proposed)</h4>

                            <div className="group rounded-xl p-4 hover:bg-white dark:hover:bg-slate-800/50 transition-colors shadow-sm dark:shadow-none border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20">
                                <label className="text-xs text-slate-500 dark:text-slate-400 tracking-wide uppercase font-semibold block mb-1">Sales Price</label>
                                <span className={`text-xl transition-colors ${getColor(oldPrice, newPrice)}`}>${newPrice}</span>
                            </div>

                            <div className="group rounded-xl p-4 hover:bg-white dark:hover:bg-slate-800/50 transition-colors shadow-sm dark:shadow-none border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20">
                                <label className="text-xs text-slate-500 dark:text-slate-400 tracking-wide uppercase font-semibold block mb-1">Cost Price</label>
                                <span className={`text-xl transition-colors ${getColor(oldCost, newCost)}`}>${newCost}</span>
                            </div>

                            <div className="group rounded-xl p-4 hover:bg-white dark:hover:bg-slate-800/50 transition-colors shadow-sm dark:shadow-none border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20">
                                <label className="text-xs text-slate-500 dark:text-slate-400 tracking-wide uppercase font-semibold block mb-3">Attachments</label>
                                {newAttach.length > 0 ? (
                                    <ul className="space-y-2">
                                        {newAttach.map((a, i) => {
                                            const isAdded = !oldAttach.includes(a);
                                            return (
                                                <li key={i} className={`text-sm flex items-center gap-2 ${isAdded ? 'text-green-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {a} {isAdded && <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 tracking-wider">NEW</span>}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : <span className="text-sm text-slate-400 italic">No attachments</span>}
                            </div>
                        </div>

                        {/* RIGHT: Version 1 Current */}
                        <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/20 transition-colors">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Version 1 (Current)</h4>

                            <div className="group rounded-xl p-4 hover:bg-white dark:hover:bg-slate-800/50 transition-colors border border-transparent dark:hover:border-white/5 shadow-sm dark:shadow-none">
                                <label className="text-xs text-slate-500 dark:text-slate-400 tracking-wide uppercase font-semibold block mb-1">Sales Price</label>
                                <span className="text-xl text-slate-700 dark:text-slate-300 font-mono">${oldPrice}</span>
                            </div>

                            <div className="group rounded-xl p-4 hover:bg-white dark:hover:bg-slate-800/50 transition-colors border border-transparent dark:hover:border-white/5 shadow-sm dark:shadow-none">
                                <label className="text-xs text-slate-500 dark:text-slate-400 tracking-wide uppercase font-semibold block mb-1">Cost Price</label>
                                <span className="text-xl text-slate-700 dark:text-slate-300 font-mono">${oldCost}</span>
                            </div>

                            <div className="group rounded-xl p-4 hover:bg-white dark:hover:bg-slate-800/50 transition-colors border border-transparent dark:hover:border-white/5 shadow-sm dark:shadow-none">
                                <label className="text-xs text-slate-500 dark:text-slate-400 tracking-wide uppercase font-semibold block mb-3">Attachments</label>
                                {oldAttach.length > 0 ? (
                                    <ul className="space-y-2">
                                        {oldAttach.map((a, i) => {
                                            const isRemoved = !newAttach.includes(a);
                                            return (
                                                <li key={i} className={`text-sm flex items-center gap-2 ${isRemoved ? 'text-red-500 dark:text-red-400 line-through opacity-70' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {a} {isRemoved && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 font-bold no-underline tracking-wider">REMOVED</span>}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : <span className="text-sm text-slate-400 italic">No attachments</span>}
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            // BoM diffs
            const currComps = targetCurrent.components || [];
            const propComps = proposedChanges?.components || currComps;

            const allCompNames = Array.from(new Set([...currComps.map(c => c.name), ...propComps.map(c => c.name)]));
            const compDiffs = allCompNames.map(name => {
                const c = currComps.find(x => x.name === name);
                const p = propComps.find(x => x.name === name);
                return { name, currQty: c ? c.quantity : '-', propQty: p ? p.quantity : '-', status: !c ? 'added' : !p ? 'removed' : (c.quantity !== p.quantity ? 'changed' : 'unchanged') };
            });

            const currOps = targetCurrent.operations || [];
            const propOps = proposedChanges?.operations || currOps;
            const allOpNames = Array.from(new Set([...currOps.map(o => o.name), ...propOps.map(o => o.name)]));
            const opDiffs = allOpNames.map(name => {
                const c = currOps.find(x => x.name === name);
                const p = propOps.find(x => x.name === name);
                return { name, currTime: c ? c.timeMinutes : '-', propTime: p ? p.timeMinutes : '-', status: !c ? 'added' : !p ? 'removed' : (c.timeMinutes !== p.timeMinutes ? 'changed' : 'unchanged') };
            });

            return (
                <div className="bg-white dark:bg-slate-800/40 border dark:border-white/10 rounded-lg p-5 space-y-6 transition-colors">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b dark:border-white/5 pb-2">Components Alignment</h3>
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50"><tr><th className="px-2 py-1">Component</th><th className="px-2 py-1">Current Qty</th><th className="px-2 py-1">Proposed Qty</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {compDiffs.map((d, idx) => {
                                    let rowClass = "hover:bg-slate-50 dark:hover:bg-slate-800/50";
                                    let textColor = "text-slate-800 dark:text-slate-200";
                                    let strike = "";
                                    let bgHighlight = "";
                                    if (d.status === 'added') { bgHighlight = "bg-green-50 dark:bg-emerald-900/10"; textColor = "text-green-600 dark:text-emerald-400 font-bold"; }
                                    else if (d.status === 'removed') { bgHighlight = "bg-red-50 dark:bg-red-900/10"; textColor = "text-red-500 dark:text-red-400 font-bold opacity-70"; strike = "line-through"; }
                                    else if (d.status === 'changed') { bgHighlight = "bg-amber-50 dark:bg-amber-900/10"; textColor = "text-amber-600 dark:text-amber-400 font-bold"; }

                                    return (
                                        <tr key={idx} className={`transition-colors ${rowClass} ${bgHighlight}`}>
                                            <td className={`px-2 py-2 ${textColor} ${strike}`}>
                                                {d.name} {d.status === 'added' && <span className="text-[10px] ml-2 px-1 rounded-sm bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 font-bold">ADDED</span>}
                                                {d.status === 'removed' && <span className="text-[10px] ml-2 px-1 rounded-sm bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 font-bold">REMOVED</span>}
                                            </td>
                                            <td className={`px-2 py-2 text-slate-400 dark:text-slate-500 ${strike}`}>{d.currQty}</td>
                                            <td className={`px-2 py-2 ${textColor}`}>{d.propQty}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b dark:border-white/5 pb-2">Operations Alignment</h3>
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50"><tr><th className="px-2 py-1">Operation</th><th className="px-2 py-1">Old Time (mins)</th><th className="px-2 py-1">New Time (mins)</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {opDiffs.map((d, idx) => {
                                    let rowClass = "hover:bg-slate-50 dark:hover:bg-slate-800/50";
                                    let textColor = "text-slate-800 dark:text-slate-200";
                                    let strike = "";
                                    let bgHighlight = "";
                                    if (d.status === 'added') { bgHighlight = "bg-green-50 dark:bg-emerald-900/10"; textColor = "text-green-600 dark:text-emerald-400 font-bold"; }
                                    else if (d.status === 'removed') { bgHighlight = "bg-red-50 dark:bg-red-900/10"; textColor = "text-red-500 dark:text-red-400 font-bold opacity-70"; strike = "line-through"; }
                                    else if (d.status === 'changed') { bgHighlight = "bg-amber-50 dark:bg-amber-900/10"; textColor = "text-amber-600 dark:text-amber-400 font-bold"; }

                                    return (
                                        <tr key={idx} className={`transition-colors ${rowClass} ${bgHighlight}`}>
                                            <td className={`px-2 py-2 ${textColor} ${strike}`}>
                                                {d.name} {d.status === 'added' && <span className="text-[10px] ml-2 px-1 rounded-sm bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 font-bold">ADDED</span>}
                                                {d.status === 'removed' && <span className="text-[10px] ml-2 px-1 rounded-sm bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 font-bold">REMOVED</span>}
                                            </td>
                                            <td className={`px-2 py-2 text-slate-400 dark:text-slate-500 ${strike}`}>{d.currTime}</td>
                                            <td className={`px-2 py-2 ${textColor}`}>{d.propTime}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    };

    const isDraft = status === 'Draft' || stage?.isDraft;
    const isFinal = status === 'Completed' || stage?.isFinal;
    const iAssigned = signatures?.find(s => s.user._id === user.id && s.stage === stage?._id);

    let approvalStatus = 'N/A';
    if (stage && !isDraft && !isFinal) {
        const requiredIds = (stage.approvals || []).filter(a => a.type === 'required').map(a => a.user?.toString());
        const signedIds = (signatures || []).filter(s => s.stage === stage._id).map(s => s.user?._id?.toString());
        const missing = requiredIds.filter(id => !signedIds.includes(id));
        approvalStatus = missing.length > 0 ? 'Pending' : 'Approved';
        if (requiredIds.length === 0) approvalStatus = 'Approved';
    }

    const steps = ['Draft', 'New', 'Approval', 'Done'];
    const currentStepIndex = isDraft ? 0 : isFinal ? 3 : (stage?.name?.toLowerCase().includes('approv') ? 2 : 1);

    const renderImpactSummary = () => {
        if (type?.toLowerCase() === 'product') {
            const oldPrice = targetCurrent?.price || 0;
            const newPrice = proposedChanges?.price !== undefined ? proposedChanges.price : oldPrice;
            const impact = newPrice - oldPrice;
            if (impact === 0) return null;
            return (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-lg mt-6 shadow-sm transition-colors">
                    <h4 className="text-amber-800 dark:text-amber-400 font-bold text-sm mb-1 flex items-center gap-2"><Activity size={16} /> Impact Summary</h4>
                    <p className="text-amber-700 dark:text-amber-500 text-sm">
                        This specification change will <strong>{impact > 0 ? 'increase' : 'decrease'}</strong> the base Sales Price by <strong>${Math.abs(impact)}</strong>.
                    </p>
                </div>
            );
        } else if (type?.toLowerCase() === 'bom') {
            const oldTime = (targetCurrent?.operations || []).reduce((acc, o) => acc + (o.timeMinutes || 0), 0);
            const newTime = (proposedChanges?.operations || targetCurrent?.operations || []).reduce((acc, o) => acc + (o.timeMinutes || 0), 0);
            const timeImpact = newTime - oldTime;

            const oldQty = (targetCurrent?.components || []).reduce((acc, c) => acc + (c.quantity || 0), 0);
            const newQty = (proposedChanges?.components || targetCurrent?.components || []).reduce((acc, c) => acc + (c.quantity || 0), 0);
            const qtyImpact = newQty - oldQty;

            if (timeImpact === 0 && qtyImpact === 0) return null;

            return (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-lg mt-6 shadow-sm transition-colors">
                    <h4 className="text-amber-800 dark:text-amber-400 font-bold text-sm mb-2 flex items-center gap-2"><Activity size={16} /> Impact Summary</h4>
                    <div className="text-amber-700 dark:text-amber-500 text-sm space-y-1">
                        {timeImpact !== 0 && (
                            <p>Routing Time: This change will <strong>{timeImpact > 0 ? 'increase' : 'decrease'}</strong> total manufacturing time by <strong>{Math.abs(timeImpact)} minutes</strong>.</p>
                        )}
                        {qtyImpact !== 0 && (
                            <p>Component Load: This change will <strong>{qtyImpact > 0 ? 'increase' : 'decrease'}</strong> the total number of physical parts by <strong>{Math.abs(qtyImpact)} unit(s)</strong>.</p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    const handleSaveContextualEdits = async () => {
        try {
            await api.put(`/eco/${ecoId}/changes`, { changes: editForm });
            setEcoData({ ...ecoData, proposedChanges: editForm });
            setViewMode('changes');
        } catch (err) {
            alert(`API Error: ${err.message}. If this is a 404, your backend server has not detected the newly deployed PUT route. Please restart your Node backend.`);
        }
    };

    const addBoMComponent = () => setEditForm(prev => ({ ...prev, components: [...(prev.components || []), { name: '', quantity: 1 }] }));
    const updateBoMComponent = (idx, field, val) => {
        const newC = (editForm.components || []).map(c => ({ ...c }));
        newC[idx][field] = val;
        setEditForm({ ...editForm, components: newC });
    };
    const removeBoMComponent = (idx) => setEditForm(prev => ({ ...prev, components: prev.components.filter((_, i) => i !== idx) }));

    const addBoMOperation = () => setEditForm(prev => ({ ...prev, operations: [...(prev.operations || []), { name: '', workCenter: '', timeMinutes: 0 }] }));
    const updateBoMOperation = (idx, field, val) => {
        const newO = (editForm.operations || []).map(o => ({ ...o }));
        newO[idx][field] = val;
        setEditForm({ ...editForm, operations: newO });
    };
    const removeBoMOperation = (idx) => setEditForm(prev => ({ ...prev, operations: prev.operations.filter((_, i) => i !== idx) }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm transition-colors" onClick={onClose}></div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">

                {showConfirm && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Confirm Submission</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to send this ECO for approval? You will lose edit access once sent.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowConfirm(false)} disabled={isSending} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50">Cancel</button>
                                <button onClick={handleSendApproval} disabled={isSending} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md flex items-center gap-2 transition-colors disabled:opacity-75 disabled:cursor-not-allowed">
                                    {isSending ? <><Activity size={16} className="animate-spin" /> Sending...</> : 'Confirm & Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900/60 border-b dark:border-white/10 px-6 py-4 flex items-center justify-between shrink-0 transition-colors">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">{title}</h2>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Target Type: <span className="uppercase font-semibold text-slate-700 dark:text-slate-300">{type}</span></p>
                    </div>

                    {/* Visual Stepper */}
                    <div className="hidden md:flex items-center space-x-2">
                        {steps.map((s, idx) => (
                            <React.Fragment key={s}>
                                <div className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border transition-colors ${idx === currentStepIndex ? 'bg-blue-600 dark:bg-blue-600 text-white border-blue-700 dark:border-blue-500 shadow-sm' : idx < currentStepIndex ? 'bg-green-100 dark:bg-emerald-500/20 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                    {s}
                                </div>
                                {idx < steps.length - 1 && <div className={`w-6 h-0.5 transition-colors ${idx < currentStepIndex ? 'bg-green-200 dark:bg-emerald-500/40' : 'bg-slate-200 dark:bg-slate-700'}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Top Action Bar */}
                <div className="px-6 py-3 bg-white dark:bg-slate-900/60 border-b dark:border-white/10 flex items-center gap-3 shrink-0 transition-colors">
                    <button onClick={() => setViewMode('details')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'details' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Form Details</button>
                    <button onClick={() => setViewMode('changes')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'changes' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400'}`}><Activity size={16} /> Changes Detail</button>

                    <div className="flex-1"></div>

                    {(isDraft || currentStepIndex === 1) && ['Engineer', 'Admin'].includes(user?.role) && (
                        <button onClick={() => {
                            setEditForm({
                                ...targetCurrent,
                                ...proposedChanges,
                                components: JSON.parse(JSON.stringify(proposedChanges?.components || targetCurrent?.components || [])),
                                operations: JSON.parse(JSON.stringify(proposedChanges?.operations || targetCurrent?.operations || []))
                            });
                            setViewMode('edit');
                        }} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors border ${viewMode === 'edit' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <ExternalLink size={14} /> Edit Proposed {type?.toLowerCase() === 'product' ? 'Product' : 'BoM'}
                        </button>
                    )}

                    {!readOnlyReport && currentStepIndex === 2 && ['Approver', 'Admin'].includes(user?.role) && (
                        <button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                            <CheckSquare size={14} /> APPROVE
                        </button>
                    )}

                    {!readOnlyReport && currentStepIndex === 1 && ['Engineer', 'Admin'].includes(user?.role) && (
                        <div className="group relative">
                            <button onClick={() => setShowConfirm(true)} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all shadow-sm focus:ring-4 focus:ring-blue-500/30 outline-none">
                                <FastForward size={14} /> SEND FOR APPROVAL
                            </button>
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                Submit this change request for approval
                            </div>
                        </div>
                    )}

                    {!readOnlyReport && isDraft && ['Engineer', 'Admin'].includes(user?.role) && (
                        <button onClick={handleStart} className="bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                            <Play size={14} /> START
                        </button>
                    )}
                </div>

                {/* View Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50 custom-scrollbar transition-colors">
                    {viewMode === 'details' ? (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-white dark:bg-slate-800/40 border dark:border-white/10 rounded-xl p-6 shadow-sm transition-colors">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b dark:border-white/5 pb-2 uppercase text-xs tracking-wider transition-colors">ECO Form Data</h3>
                                <div className="space-y-4">
                                    <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">ECO Title</label><input type="text" value={title} readOnly={!isDraft} className="w-full mt-1 border-b dark:border-white/10 py-1 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 bg-transparent text-slate-900 dark:text-white transition-colors" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Type</label><input type="text" value={type.toUpperCase()} readOnly className="w-full mt-1 border-b dark:border-white/10 py-1 bg-transparent text-slate-500 dark:text-slate-400 transition-colors" /></div>
                                        <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Target Identifier (v{targetCurrent?.version})</label><input type="text" value={targetCurrent?.name || targetCurrent?.reference || ''} readOnly className="w-full mt-1 border-b dark:border-white/10 py-1 bg-transparent text-slate-500 dark:text-slate-400 transition-colors" /></div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 text-slate-800 dark:text-white transition-colors"><input type="checkbox" checked={versionUpdate} readOnly className="default:ring-2" /> <span className="text-sm font-semibold">Require Version Update upon Final Approval</span></div>
                                </div>
                            </div>
                            {isDraft || currentStepIndex === 1 ? <div className="text-sm text-slate-500 dark:text-slate-500 text-center italic transition-colors">Fields remain mutable until submission for formal pipeline approval.</div> : null}
                        </div>
                    ) : viewMode === 'edit' ? (
                        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800/40 border border-blue-100 dark:border-blue-500/20 rounded-xl p-6 shadow-md shadow-blue-50 dark:shadow-none transition-colors">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b dark:border-white/5 pb-2 flex items-center gap-2 transition-colors">
                                <Activity size={18} className="text-blue-600 dark:text-blue-400" /> Contextual Edit: Proposed Changes
                            </h3>
                            {type?.toLowerCase() === 'product' && editForm ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Sales Price</label><input type="number" value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })} className="w-full mt-1 border border-gray-300 dark:border-white/10 bg-transparent dark:bg-slate-900 text-slate-800 dark:text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors" /></div>
                                        <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Cost Price</label><input type="number" value={editForm.costPrice || ''} onChange={e => setEditForm({ ...editForm, costPrice: parseFloat(e.target.value) })} className="w-full mt-1 border border-gray-300 dark:border-white/10 bg-transparent dark:bg-slate-900 text-slate-800 dark:text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors" /></div>
                                    </div>
                                    <button onClick={handleSaveContextualEdits} className="mt-6 bg-blue-600 dark:bg-indigo-600 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-blue-700 dark:hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2">
                                        <Save size={16} /> Save Proposed Payload
                                    </button>
                                </div>
                            ) : type?.toLowerCase() === 'bom' && editForm ? (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-300 mb-4 transition-colors">
                                        <strong>Notice:</strong> You are editing this BoM in ECO mode. Changes are saved as a proposal and will <em>not</em> modify live master data until Final Approval.
                                    </div>

                                    {/* Components Table */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Components</h4>
                                        <table className="w-full text-left text-sm border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase">
                                                <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2 w-24">Qty</th><th className="px-2 py-2 w-10"></th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                {(editForm.components || []).map((c, idx) => (
                                                    <tr key={idx} className="bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="px-3 py-1.5"><input className="w-full bg-transparent outline-none dark:text-white" placeholder="Component Name" value={c.name} onChange={e => updateBoMComponent(idx, 'name', e.target.value)} /></td>
                                                        <td className="px-3 py-1.5"><input type="number" className="w-full bg-transparent outline-none dark:text-white font-mono" value={c.quantity} onChange={e => updateBoMComponent(idx, 'quantity', Number(e.target.value))} /></td>
                                                        <td className="px-2 py-1.5 text-center"><button onClick={() => removeBoMComponent(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button></td>
                                                    </tr>
                                                ))}
                                                {(editForm.components || []).length === 0 && <tr><td colSpan="3" className="p-3 text-center text-slate-500 text-xs">No components defined.</td></tr>}
                                            </tbody>
                                        </table>
                                        <button onClick={addBoMComponent} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-xs font-bold mt-2 flex items-center gap-1"><Plus size={14} /> Add Component</button>
                                    </div>

                                    {/* Operations Table */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Routing Operations</h4>
                                        <table className="w-full text-left text-sm border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase">
                                                <tr><th className="px-3 py-2">Operation</th><th className="px-3 py-2 w-32">Work Center</th><th className="px-3 py-2 w-24">Mins</th><th className="px-2 py-2 w-10"></th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                {(editForm.operations || []).map((o, idx) => (
                                                    <tr key={idx} className="bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="px-3 py-1.5"><input className="w-full bg-transparent outline-none dark:text-white" placeholder="Operation" value={o.name} onChange={e => updateBoMOperation(idx, 'name', e.target.value)} /></td>
                                                        <td className="px-3 py-1.5"><input className="w-full bg-transparent outline-none dark:text-white" placeholder="WC" value={o.workCenter} onChange={e => updateBoMOperation(idx, 'workCenter', e.target.value)} /></td>
                                                        <td className="px-3 py-1.5"><input type="number" className="w-full bg-transparent outline-none dark:text-white font-mono" value={o.timeMinutes} onChange={e => updateBoMOperation(idx, 'timeMinutes', Number(e.target.value))} /></td>
                                                        <td className="px-2 py-1.5 text-center"><button onClick={() => removeBoMOperation(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button></td>
                                                    </tr>
                                                ))}
                                                {(editForm.operations || []).length === 0 && <tr><td colSpan="4" className="p-3 text-center text-slate-500 text-xs">No operations defined.</td></tr>}
                                            </tbody>
                                        </table>
                                        <button onClick={addBoMOperation} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-xs font-bold mt-2 flex items-center gap-1"><Plus size={14} /> Add Operation</button>
                                    </div>

                                    <button onClick={handleSaveContextualEdits} className="mt-6 w-full bg-blue-600 dark:bg-indigo-600 text-white px-4 py-2.5 rounded-md font-bold text-sm hover:bg-blue-700 dark:hover:bg-indigo-700 shadow-sm transition-colors flex items-center justify-center gap-2">
                                        <Save size={16} /> Save Proposed Payload to ECO
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            {renderComparison()}
                            {renderImpactSummary()}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ECOView;
