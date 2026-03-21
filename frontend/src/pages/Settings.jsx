import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Settings2, Users } from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    const [stages, setStages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedStage, setSelectedStage] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchData = async () => {
        try {
            const [stgRes, usrRes] = await Promise.all([api.get('/settings/stages'), api.get('/settings/users')]);
            setStages(stgRes.data);
            setUsers(usrRes.data);
            if (activeStageId) {
                const refreshedActive = stgRes.data.find(s => s._id === activeStageId);
                setSelectedStage(refreshedActive || null);
            }
        } catch (err) { console.error(err); }
    };

    const [activeStageId, setActiveStageId] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const handleSelectStage = (stage) => {
        setSelectedStage(JSON.parse(JSON.stringify(stage))); // deep copy for editing
        setActiveStageId(stage._id);
        setIsCreating(false);
    };

    const handleCreateNew = () => {
        setSelectedStage({ name: '', sequence: stages.length > 0 ? stages[stages.length - 1].sequence + 10 : 10, isDraft: false, isFinal: false, approvals: [] });
        setActiveStageId(null);
        setIsCreating(true);
    };

    const handleSaveStage = async () => {
        if (!selectedStage.name) return alert("Stage name required");
        try {
            if (isCreating) {
                await api.post('/settings/stages', selectedStage);
            } else {
                await api.put(`/settings/stages/${selectedStage._id}`, selectedStage);
            }
            fetchData();
            setIsCreating(false);
            alert("Stage saved successfully.");
        } catch (err) { alert("Error saving stage"); }
    };

    const handleDeleteStage = async (id) => {
        try {
            await api.delete(`/settings/stages/${id}`);
            setSelectedStage(null);
            fetchData();
        } catch (err) { alert("Error removing stage. It might be in use."); }
    };

    const addApprover = () => {
        setSelectedStage({ ...selectedStage, approvals: [...selectedStage.approvals, { user: '', type: 'required' }] });
    };

    const updateApprover = (idx, field, val) => {
        const newA = [...selectedStage.approvals];
        newA[idx][field] = val;
        setSelectedStage({ ...selectedStage, approvals: newA });
    };

    const removeApprover = (idx) => {
        const newA = selectedStage.approvals.filter((_, i) => i !== idx);
        setSelectedStage({ ...selectedStage, approvals: newA });
    };

    return (
        <div className="flex h-[calc(100vh-56px)] bg-gray-50 overflow-hidden">

            {/* Left Panel: Stages List */}
            <div className="w-1/3 min-w-[300px] border-r border-gray-200 bg-white flex flex-col">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Settings2 size={18} /> ECO Stages</h2>
                    <button onClick={handleCreateNew} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors"><Plus size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {stages.map(stage => (
                        <div
                            key={stage._id}
                            onClick={() => handleSelectStage(stage)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${activeStageId === stage._id ? 'border-blue-500 bg-blue-50/30 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-semibold text-slate-800">{stage.name}</h3>
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 rounded-full border border-slate-200">{stage.sequence}</span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                <Users size={12} /> {stage.approvals.length} Configured Rules
                                {stage.isFinal && <span className="text-green-600 font-bold ml-auto">FINAL</span>}
                            </div>
                        </div>
                    ))}
                    {stages.length === 0 && <p className="text-sm text-gray-400 text-center py-10">No stages built.</p>}
                </div>
            </div>

            {/* Right Panel: Configurations */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 relative">
                {selectedStage ? (
                    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50/30">
                            <h2 className="text-xl font-bold text-slate-900">{isCreating ? 'Create Workflow Stage' : 'Configure Workflow Stage'}</h2>
                            {!isCreating && <button onClick={() => handleDeleteStage(selectedStage._id)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Delete Stage</button>}
                        </div>

                        <div className="p-6 space-y-8 flex-1">
                            {/* Core Settings */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Core Attributes</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700">Stage Name</label>
                                        <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={selectedStage.name} onChange={e => setSelectedStage({ ...selectedStage, name: e.target.value })} placeholder="e.g. Technical Review" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700">Sequence Order</label>
                                        <input type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={selectedStage.sequence} onChange={e => setSelectedStage({ ...selectedStage, sequence: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="flex gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="isDraft" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" checked={selectedStage.isDraft} onChange={e => setSelectedStage({ ...selectedStage, isDraft: e.target.checked })} />
                                        <label htmlFor="isDraft" className="text-sm font-medium text-slate-700">Draft Status (Initial Entry Point)</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="isFinal" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" checked={selectedStage.isFinal} onChange={e => setSelectedStage({ ...selectedStage, isFinal: e.target.checked })} />
                                        <label htmlFor="isFinal" className="text-sm font-medium text-slate-700">Final Stage (Applies Data on Entry)</label>
                                    </div>
                                </div>
                            </section>

                            {/* Approvals Routing */}
                            <section>
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Approval Routing Logic</h3>
                                    <button onClick={addApprover} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus size={14} /> Add Rule</button>
                                </div>

                                {selectedStage.approvals.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 rounded-lg border border-dashed border-gray-200">No approval constraints configured. ECOs will passively transition through this node.</div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-slate-500 text-xs uppercase bg-slate-50">
                                            <tr><th className="px-3 py-2 rounded-tl-md">Target User</th><th className="px-3 py-2">Constraint Type</th><th className="px-3 py-2 w-10 rounded-tr-md"></th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedStage.approvals.map((rule, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    <td className="px-3 py-2">
                                                        <select className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white outline-none" value={rule.user?._id || rule.user} onChange={e => updateApprover(idx, 'user', e.target.value)}>
                                                            <option value="">Select identity...</option>
                                                            {users.map(u => <option key={u._id} value={u._id}>{u.email} ({u.role})</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white outline-none" value={rule.type} onChange={e => updateApprover(idx, 'type', e.target.value)}>
                                                            <option value="required">Required (Blocking)</option>
                                                            <option value="optional">Optional (Advisory)</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button onClick={() => removeApprover(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </section>
                        </div>
                        <div className="p-5 bg-slate-50 border-t border-gray-100 flex justify-end shrink-0">
                            <button onClick={handleSaveStage} className="bg-slate-900 text-white px-6 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-slate-800 transition-colors">Save Configuration</button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Settings2 size={48} className="mb-4 opacity-50" />
                        <p>Select a stage on the left to configure routing logic.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
