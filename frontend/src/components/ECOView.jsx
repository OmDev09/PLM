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

    const { targetCurrent, proposedChanges, stage, signatures, title, type, versionUpdate, status, riskLevel } = ecoData;

    const RiskBadge = ({ level }) => {
        if (level === 'High') return <span className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-2 py-0.5 text-[11px] uppercase tracking-wider font-bold rounded flex items-center gap-1.5 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> High Risk</span>;
        if (level === 'Medium') return <span className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[11px] uppercase tracking-wider font-bold rounded flex items-center gap-1.5 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span> Medium Risk</span>;
        return <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[11px] uppercase tracking-wider font-bold rounded flex items-center gap-1.5 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Low Risk</span>;
    };

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
        const DiffField = ({ label, oldVal, newVal, status, isCurrency = false }) => {
            let bgClass = "bg-white dark:bg-slate-800/20";
            let borderClass = "border-slate-100 dark:border-white/5";

            if (status === 'added') {
                bgClass = "bg-green-50/50 dark:bg-emerald-900/10";
                borderClass = "border-green-200 dark:border-emerald-500/20";
            } else if (status === 'removed') {
                bgClass = "bg-red-50/50 dark:bg-red-900/10";
                borderClass = "border-red-200 dark:border-red-500/20";
            } else if (status === 'changed') {
                bgClass = "bg-amber-50/50 dark:bg-amber-900/10";
                borderClass = "border-amber-200 dark:border-amber-500/20";
            }

            return (
                <div className={`p-4 rounded-xl border ${bgClass} ${borderClass} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors`}>
                    <div className="flex-1 w-full sm:w-1/3">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block mb-1.5">{label}</span>
                        <div className="flex items-center gap-2">
                            {status === 'added' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold tracking-wider">NEW</span>}
                            {status === 'removed' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 font-bold tracking-wider">REMOVED</span>}
                            {status === 'changed' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-bold tracking-wider">CHANGED</span>}
                            {!status || status === 'unchanged' ? <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 font-bold tracking-wider">UNCHANGED</span> : null}
                        </div>
                    </div>

                    <div className="flex-1 w-full sm:w-2/3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 rounded-lg p-3 border border-slate-100 dark:border-white/5 shadow-inner">
                        <div className="flex-1 text-center truncate">
                            <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Original</span>
                            <span className={`font-mono text-sm ${status === 'removed' ? 'text-red-500 line-through opacity-70' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>{isCurrency ? '$' : ''}{oldVal}</span>
                        </div>
                        <div className="px-4 text-slate-300 dark:text-slate-600 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </div>
                        <div className="flex-1 text-center truncate">
                            <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Modified</span>
                            <span className={`font-mono text-sm font-bold ${status === 'added' ? 'text-green-600 dark:text-emerald-400' : status === 'changed' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>{isCurrency ? '$' : ''}{newVal}</span>
                        </div>
                    </div>
                </div>
            );
        };

        if (type?.toLowerCase() === 'product') {
            const oldPrice = targetCurrent?.price || 0;
            const newPrice = proposedChanges?.price !== undefined ? proposedChanges.price : oldPrice;
            const priceStatus = newPrice !== oldPrice ? 'changed' : 'unchanged';

            const oldCost = targetCurrent?.costPrice || 0;
            const newCost = proposedChanges?.costPrice !== undefined ? proposedChanges.costPrice : oldCost;
            const costStatus = newCost !== oldCost ? 'changed' : 'unchanged';

            const oldAttach = targetCurrent?.attachments || [];
            const newAttach = proposedChanges?.attachments || [...oldAttach];
            const allAttach = Array.from(new Set([...oldAttach, ...newAttach]));

            return (
                <div className="bg-white dark:bg-slate-800/40 border dark:border-white/10 rounded-2xl p-6 space-y-8 shadow-sm transition-colors">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b dark:border-white/5 pb-2 text-sm uppercase tracking-wider">Financial Dimensions</h3>
                        <div className="space-y-3">
                            <DiffField label="Sales Price" oldVal={oldPrice} newVal={newPrice} status={priceStatus} isCurrency={true} />
                            <DiffField label="Cost Price" oldVal={oldCost} newVal={newCost} status={costStatus} isCurrency={true} />
                        </div>
                    </div>
                    {allAttach.length > 0 && (
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b dark:border-white/5 pb-2 text-sm uppercase tracking-wider">Digital Attachments</h3>
                            <div className="space-y-3">
                                {allAttach.map(att => {
                                    const hasOld = oldAttach.includes(att);
                                    const hasNew = newAttach.includes(att);
                                    const status = !hasOld ? 'added' : !hasNew ? 'removed' : 'unchanged';
                                    return <DiffField key={att} label={`Asset: ${att}`} oldVal={hasOld ? att : '-'} newVal={hasNew ? att : '-'} status={status} />;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            );
        } else {
            const currComps = targetCurrent.components || [];
            const propComps = proposedChanges?.components || currComps;
            const allCompNames = Array.from(new Set([...currComps.map(c => c.name), ...propComps.map(c => c.name)]));

            const currOps = targetCurrent.operations || [];
            const propOps = proposedChanges?.operations || currOps;
            const allOpNames = Array.from(new Set([...currOps.map(o => o.name), ...propOps.map(o => o.name)]));

            return (
                <div className="bg-white dark:bg-slate-800/40 border dark:border-white/10 rounded-2xl p-6 space-y-8 shadow-sm transition-colors">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b dark:border-white/5 pb-2 text-sm uppercase tracking-wider flex items-center justify-between">
                            Components Alignment
                            <span className="text-[10px] text-slate-400 tracking-normal font-normal normal-case border dark:border-white/10 px-2 py-0.5 rounded-full">{allCompNames.length} Tracked Nodes</span>
                        </h3>
                        <div className="space-y-3">
                            {allCompNames.length > 0 ? allCompNames.map(name => {
                                const c = currComps.find(x => x.name === name);
                                const p = propComps.find(x => x.name === name);
                                const status = !c ? 'added' : !p ? 'removed' : (c.quantity !== p.quantity ? 'changed' : 'unchanged');
                                return <DiffField key={name} label={`Component: ${name}`} oldVal={c ? c.quantity : '-'} newVal={p ? p.quantity : '-'} status={status} />;
                            }) : <div className="text-sm text-center text-slate-400 p-4 border border-dashed rounded-xl dark:border-white/10">No components attached</div>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b dark:border-white/5 pb-2 text-sm uppercase tracking-wider flex items-center justify-between">
                            Routing Operations
                            <span className="text-[10px] text-slate-400 tracking-normal font-normal normal-case border dark:border-white/10 px-2 py-0.5 rounded-full">{allOpNames.length} Tracked Nodes</span>
                        </h3>
                        <div className="space-y-3">
                            {allOpNames.length > 0 ? allOpNames.map(name => {
                                const c = currOps.find(x => x.name === name);
                                const p = propOps.find(x => x.name === name);
                                const status = !c ? 'added' : !p ? 'removed' : (c.timeMinutes !== p.timeMinutes ? 'changed' : 'unchanged');
                                return <DiffField key={name} label={`Operation: ${name}`} oldVal={c ? c.timeMinutes : '-'} newVal={p ? p.timeMinutes : '-'} status={status} />;
                            }) : <div className="text-sm text-center text-slate-400 p-4 border border-dashed rounded-xl dark:border-white/10">No routing operations attached</div>}
                        </div>
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
                            <RiskBadge level={riskLevel} />
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
                        stage?.approvals?.length > 0 ? (
                            <button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                                <CheckSquare size={14} /> APPROVE
                            </button>
                        ) : (
                            <button onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                                <CheckSquare size={14} /> VALIDATE
                            </button>
                        )
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
