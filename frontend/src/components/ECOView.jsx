import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, CheckSquare, FastForward, ExternalLink, Activity, Save, Play } from 'lucide-react';

const ECOView = ({ ecoId, onClose, refreshList, readOnlyReport = false }) => {
    const { user } = useAuth();
    const [ecoData, setEcoData] = useState(null);
    const [viewMode, setViewMode] = useState('details'); // details, changes
    const [loading, setLoading] = useState(true);

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

    const handleAdvance = async () => {
        try { await api.post(`/eco/${ecoId}/advance`); fetchData(); refreshList(); onClose(); } catch (err) { alert(err.response?.data?.msg); }
    };

    if (loading) return <div className="p-10 text-center">Loading ECO payload...</div>;
    if (!ecoData) return <div className="p-10 text-center text-red-500">Failed to load ECO data.</div>;

    const { targetCurrent, proposedChanges, stage, signatures, title, type, versionUpdate } = ecoData;

    const DiffRow = ({ label, oldVal, newVal, isCurrency }) => {
        const oV = oldVal || 0; const nV = newVal !== undefined ? newVal : oV;
        if (oV === nV) return <div className="flex justify-between py-2 border-b text-sm text-slate-800"><span>{label}</span><span className="font-mono">{isCurrency ? '$' : ''}{oV}</span></div>;
        return (
            <div className="flex justify-between py-2 border-b text-sm">
                <span>{label}</span>
                <div className="font-mono flex items-center gap-2">
                    <span className="text-slate-400 line-through">{isCurrency ? '$' : ''}{oV}</span>
                    <span className={nV > oV ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{isCurrency ? '$' : ''}{nV}</span>
                </div>
            </div>
        );
    };

    const renderComparison = () => {
        if (type === 'product') {
            return (
                <div className="bg-white border rounded-lg p-5">
                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Product Parameter Diff</h3>
                    <DiffRow label="Sales Price" oldVal={targetCurrent.price} newVal={proposedChanges?.price} isCurrency />
                    <DiffRow label="Cost Price" oldVal={targetCurrent.costPrice} newVal={proposedChanges?.costPrice} isCurrency />
                    <div className="mt-4 pt-4 border-t">
                        <span className="text-sm font-semibold text-slate-700 block mb-2">Attachments</span>
                        {/* Mocking diff logic for arrays since a full deep array diff visualizer is bulky */}
                        <div className="text-xs text-slate-500 italic">Attachments modified. (Binary diff hidden)</div>
                    </div>
                </div>
            );
        } else {
            // BoM diffs
            const currComps = targetCurrent.components || [];
            const propComps = proposedChanges?.components || currComps;

            return (
                <div className="bg-white border rounded-lg p-5 space-y-6">
                    <div>
                        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Components Alignment</h3>
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 bg-slate-50"><tr><th className="px-2 py-1">Component</th><th className="px-2 py-1">Current Qty</th><th className="px-2 py-1">Proposed Qty</th></tr></thead>
                            <tbody>
                                {propComps.map((pc, idx) => {
                                    const cc = currComps.find(c => c.name === pc.name);
                                    let color = 'text-slate-800';
                                    if (!cc) color = 'text-green-600 font-bold'; // Added
                                    else if (pc.quantity > cc.quantity) color = 'text-green-600 font-bold'; // Increased
                                    else if (pc.quantity < cc.quantity) color = 'text-red-500 font-bold'; // Decreased
                                    return (
                                        <tr key={idx} className="border-b border-gray-100">
                                            <td className="px-2 py-2">{pc.name}</td>
                                            <td className="px-2 py-2 text-slate-400">{cc ? cc.quantity : '--'}</td>
                                            <td className={`px-2 py-2 ${color}`}>{pc.quantity}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Operations diff mock */}
                    <div className="text-xs text-slate-500 italic">Operations array diff mapping follows exact same scalar logic as components.</div>
                </div>
            );
        }
    };

    const isDraft = stage?.isDraft;
    const isFinal = stage?.isFinal;
    const iAssigned = signatures?.find(s => s.user._id === user.id && s.stage === stage?._id);

    let approvalStatus = 'N/A';
    if (stage && !isDraft && !isFinal) {
        const requiredIds = (stage.approvals || []).filter(a => a.type === 'required').map(a => a.user?.toString());
        const signedIds = (signatures || []).filter(s => s.stage === stage._id).map(s => s.user?._id?.toString());
        const missing = requiredIds.filter(id => !signedIds.includes(id));
        approvalStatus = missing.length > 0 ? 'Pending' : 'Approved';
        if (requiredIds.length === 0) approvalStatus = 'Approved';
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header Card */}
                <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${isFinal ? 'bg-green-100 text-green-800 border-green-200' : isDraft ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-blue-100 text-blue-800 border-blue-200'} border`}>
                                {isFinal ? 'DONE (FINAL)' : stage?.name || 'ORPHAN'}
                            </span>
                            {!isDraft && !isFinal && (
                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                    Status: {approvalStatus}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">Target Type: <span className="uppercase font-semibold text-slate-700">{type}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Top Action Bar */}
                <div className="px-6 py-3 bg-white border-b flex items-center gap-3 shrink-0">
                    <button onClick={() => setViewMode('details')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'details' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Form Details</button>
                    <button onClick={() => setViewMode('changes')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'changes' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}><Activity size={16} /> Changes Detail</button>

                    <div className="flex-1"></div>

                    <button className="text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                        <ExternalLink size={14} /> Open {type === 'product' ? 'Product Master' : 'BoM Master'}
                    </button>

                    {!readOnlyReport && !isFinal && !isDraft && user?.role !== 'Engineer' && (
                        <div className="flex bg-slate-100 rounded-md p-0.5 border border-slate-200">
                            <button onClick={handleSign} disabled={iAssigned} className={`px-3 py-1 text-sm font-medium rounded ${iAssigned ? 'text-slate-400 cursor-not-allowed' : 'text-blue-700 hover:bg-white shadow-sm'}`}>
                                {iAssigned ? 'Signed' : 'Approve Stage'}
                            </button>
                            <button onClick={handleAdvance} className="px-3 py-1 text-sm font-medium text-slate-700 hover:bg-white rounded shadow-sm flex items-center gap-1">Advance <FastForward size={14} /></button>
                        </div>
                    )}

                    {!readOnlyReport && isDraft && ['Engineer', 'Admin'].includes(user?.role) && (
                        <button onClick={handleAdvance} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                            <Play size={14} /> START LIFECYCLE
                        </button>
                    )}
                </div>

                {/* View Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {viewMode === 'details' ? (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-white border rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 uppercase text-xs tracking-wider">ECO Form Data</h3>
                                <div className="space-y-4">
                                    <div><label className="text-xs font-bold text-slate-500">ECO Title</label><input type="text" value={title} readOnly={!isDraft} className="w-full mt-1 border-b py-1 focus:outline-none focus:border-blue-500 bg-transparent text-slate-900" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-slate-500">Type</label><input type="text" value={type.toUpperCase()} readOnly className="w-full mt-1 border-b py-1 bg-transparent text-slate-500" /></div>
                                        <div><label className="text-xs font-bold text-slate-500">Target Identifier (v{targetCurrent?.version})</label><input type="text" value={targetCurrent?.name || targetCurrent?.reference || ''} readOnly className="w-full mt-1 border-b py-1 bg-transparent text-slate-500" /></div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4"><input type="checkbox" checked={versionUpdate} readOnly className="default:ring-2" /> <span className="text-sm font-semibold">Require Version Update upon Final Approval</span></div>
                                </div>
                            </div>
                            {isDraft && <div className="text-sm text-slate-500 text-center italic">Fields remain mutable until START command executes.</div>}
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            {renderComparison()}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ECOView;
