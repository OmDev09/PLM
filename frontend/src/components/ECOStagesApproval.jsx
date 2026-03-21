import React, { useState, useEffect } from 'react';
import { Settings2, Plus, GripVertical, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';

const ECOStagesApproval = () => {
    const DEFAULT_STAGES = [
        { id: '1', name: 'New', requiresApproval: false },
        { id: '2', name: 'Approval', requiresApproval: true },
        { id: '3', name: 'Done', requiresApproval: false }
    ];

    const [stages, setStages] = useState([]);
    const [newStageName, setNewStageName] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('plm_eco_stages');
        if (saved) {
            setStages(JSON.parse(saved));
        } else {
            setStages(DEFAULT_STAGES);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('plm_eco_stages', JSON.stringify(stages));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const addStage = (e) => {
        e.preventDefault();
        if (!newStageName.trim()) return;
        const newStage = {
            id: Date.now().toString(),
            name: newStageName.trim(),
            requiresApproval: false
        };
        setStages([...stages, newStage]);
        setNewStageName('');
    };

    const removeStage = (id) => {
        setStages(stages.filter(s => s.id !== id));
    };

    const toggleApproval = (id) => {
        setStages(stages.map(s =>
            s.id === id ? { ...s, requiresApproval: !s.requiresApproval } : s
        ));
    };

    const moveStage = (index, direction) => {
        if (index + direction < 0 || index + direction >= stages.length) return;
        const newStages = [...stages];
        const temp = newStages[index];
        newStages[index] = newStages[index + direction];
        newStages[index + direction] = temp;
        setStages(newStages);
    };

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full h-full mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <Settings2 className="text-blue-600" size={28} /> Pipeline Configuration
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Design your Engineering Change Order lifecycle and define strict approval gates.</p>
                </div>
                <button
                    onClick={handleSave}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:-translate-y-0.5'}`}
                >
                    {isSaved ? <><CheckCircle size={18} /> Configuration Saved</> : 'Save Active Architecture'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visualizer & Editor */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Lifecycle Sequence</h2>

                        <div className="space-y-3">
                            {stages.map((stage, index) => (
                                <div key={stage.id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl group transition-all hover:border-blue-300 hover:shadow-sm">
                                    <div className="flex flex-col items-center gap-1 text-slate-300">
                                        <button onClick={() => moveStage(index, -1)} disabled={index === 0} className="hover:text-blue-600 disabled:opacity-30 p-1"><GripVertical size={16} /></button>
                                        <button onClick={() => moveStage(index, 1)} disabled={index === stages.length - 1} className="hover:text-blue-600 disabled:opacity-30 p-1"><GripVertical size={16} /></button>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-black text-slate-400 text-sm shrink-0">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={stage.name}
                                            onChange={(e) => setStages(stages.map(s => s.id === stage.id ? { ...s, name: e.target.value } : s))}
                                            className="bg-transparent text-lg font-bold text-slate-800 focus:outline-none w-full"
                                        />
                                        {index === stages.length - 1 ? (
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Final Stage (Marks as Applied)</div>
                                        ) : (
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intermediate Stage</div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <button
                                            onClick={() => toggleApproval(stage.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${stage.requiresApproval ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <ShieldAlert size={14} className={stage.requiresApproval ? 'text-amber-500' : 'text-slate-300'} />
                                            {stage.requiresApproval ? 'Mandatory Approval' : 'No Approval (Validate only)'}
                                        </button>

                                        <button onClick={() => removeStage(stage.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 bg-white border border-slate-200 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add New Line */}
                        <form onSubmit={addStage} className="mt-4 flex items-center gap-3 flex-wrap">
                            <input
                                type="text"
                                placeholder="E.g. Technical Review"
                                value={newStageName}
                                onChange={e => setNewStageName(e.target.value)}
                                className="flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-inner"
                            />
                            <button type="submit" className="bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
                                <Plus size={16} strokeWidth={3} /> Inject Stage
                            </button>
                        </form>
                    </div>
                </div>

                {/* Explanation Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 sticky top-6">
                        <ShieldAlert className="w-10 h-10 text-blue-500 mb-4" />
                        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight mb-2 uppercase">Engine Directives</h3>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            Configure the exact path an Engineering Change Order follows. Security and role gating applies automatically.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1">Approval Button</h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">If <strong>Mandatory Approval</strong> is engaged for a stage, engineers are forced to use the <span className="bg-amber-100 text-amber-700 font-bold px-1 rounded">Approve</span> action, logging a high-security signature.</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1">Validate Button</h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">If no approval is required, a standard <span className="bg-blue-50 text-blue-600 font-bold px-1 rounded">Validate</span> button is rendered to simply advance the workflow.</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-emerald-50 shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1">Finalization</h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">The lowest stage in the sequence automatically registers the ECO as <strong>Applied</strong>, locking the asset baseline permanently.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ECOStagesApproval;
