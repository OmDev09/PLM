import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings2, Plus, GripVertical, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';

const ECOStagesApproval = () => {
    const { user } = useAuth();
    const isEngineer = user?.role === 'Engineer';
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
        <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full h-full mb-12 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
                        <Settings2 className="text-blue-600 dark:text-blue-400" size={28} /> Pipeline Configuration
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Design your Engineering Change Order lifecycle and define strict approval gates.</p>
                </div>
                {!isEngineer && (
                    <button
                        onClick={handleSave}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 dark:bg-indigo-600 hover:bg-blue-700 dark:hover:bg-indigo-700 text-white shadow-blue-500/20 dark:shadow-indigo-500/20 hover:-translate-y-0.5'}`}
                    >
                        {isSaved ? <><CheckCircle size={18} /> Configuration Saved</> : 'Save Active Architecture'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visualizer & Editor */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-sm p-6 transition-colors">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-white/5 pb-4">Lifecycle Sequence</h2>

                        <div className="space-y-3">
                            {stages.map((stage, index) => (
                                <div key={stage.id} className={`flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl transition-all ${!isEngineer ? 'group hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm' : ''}`}>
                                    <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-slate-600">
                                        <button onClick={() => moveStage(index, -1)} disabled={isEngineer || index === 0} className={`p-1 ${isEngineer ? 'opacity-30 cursor-not-allowed' : 'hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30'}`}><GripVertical size={16} /></button>
                                        <button onClick={() => moveStage(index, 1)} disabled={isEngineer || index === stages.length - 1} className={`p-1 ${isEngineer ? 'opacity-30 cursor-not-allowed' : 'hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30'}`}><GripVertical size={16} /></button>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-slate-400 dark:text-slate-500 text-sm shrink-0">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={stage.name}
                                            readOnly={isEngineer}
                                            onChange={(e) => setStages(stages.map(s => s.id === stage.id ? { ...s, name: e.target.value } : s))}
                                            className={`bg-transparent text-lg font-bold text-slate-800 dark:text-white focus:outline-none w-full transition-colors ${isEngineer ? 'cursor-default' : ''}`}
                                        />
                                        {index === stages.length - 1 ? (
                                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Final Stage (Marks as Applied)</div>
                                        ) : (
                                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Intermediate Stage</div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <button
                                            onClick={() => !isEngineer && toggleApproval(stage.id)}
                                            disabled={isEngineer}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${stage.requiresApproval ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-500/20 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/10'} ${!isEngineer ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <ShieldAlert size={14} className={stage.requiresApproval ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'} />
                                            {stage.requiresApproval ? 'Mandatory Approval' : 'No Approval (Validate only)'}
                                        </button>

                                        {!isEngineer && (
                                            <button onClick={() => removeStage(stage.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add New Line - Hidden for Engineers */}
                        {!isEngineer && (
                            <form onSubmit={addStage} className="mt-4 flex items-center gap-3 flex-wrap">
                                <input
                                    type="text"
                                    placeholder="E.g. Technical Review"
                                    value={newStageName}
                                    onChange={e => setNewStageName(e.target.value)}
                                    className="flex-1 min-w-[200px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-indigo-500/40 focus:border-blue-500 dark:focus:border-indigo-500 transition-all font-medium shadow-inner"
                                />
                                <button type="submit" className="bg-white dark:bg-indigo-600 border border-slate-200 dark:border-transparent text-slate-600 dark:text-white hover:text-blue-700 dark:hover:bg-indigo-700 hover:bg-blue-50 dark:hover:border-transparent hover:border-blue-300 px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
                                    <Plus size={16} strokeWidth={3} /> Inject Stage
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Explanation Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-blue-50/50 dark:bg-indigo-900/10 border border-blue-100 dark:border-indigo-500/20 rounded-xl p-6 sticky top-6 transition-colors">
                        <ShieldAlert className="w-10 h-10 text-blue-500 dark:text-indigo-400 mb-4" />
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 uppercase">Engine Directives</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                            Configure the exact path an Engineering Change Order follows. Security and role gating applies automatically.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-900/60 p-4 rounded-lg border border-blue-50 dark:border-white/5 shadow-sm transition-colors">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1">Approval Button</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">If <strong>Mandatory Approval</strong> is engaged for a stage, engineers are forced to use the <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold px-1 rounded">Approve</span> action, logging a high-security signature.</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900/60 p-4 rounded-lg border border-blue-50 dark:border-white/5 shadow-sm transition-colors">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1">Validate Button</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">If no approval is required, a standard <span className="bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold px-1 rounded">Validate</span> button is rendered to simply advance the workflow.</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900/60 p-4 rounded-lg border border-emerald-50 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors">
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-400 dark:bg-emerald-500"></div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1">Finalization</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">The lowest stage in the sequence automatically registers the ECO as <strong>Applied</strong>, locking the asset baseline permanently.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ECOStagesApproval;
