import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ECOView from './ECOView';

const ECOList = () => {
    const { user } = useAuth();
    const [ecos, setEcos] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState('all');
    const [productFilter, setProductFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeEcoId, setActiveEcoId] = useState(null);

    const [formData, setFormData] = useState({
        title: '', type: 'product', productId: '', assignedUser: user?.email || '', versionUpdate: true
    });

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchData = () => {
        api.get('/eco').then(res => setEcos(res.data)).catch(console.error);
        api.get('/products').then(res => setProducts(res.data)).catch(console.error);
    };

    useEffect(() => { fetchData(); }, []);

    const saveDraft = async () => {
        if (!formData.title || !formData.productId) return alert('Title and Product are mandatory');
        try {
            await api.post('/eco/draft', formData);
            setIsCreateOpen(false); fetchData();
        } catch (err) { alert(err.response?.data?.msg || 'Error saving ECO draft'); }
    };

    const startWorkflow = async () => {
        if (!formData.title || !formData.productId) return alert('Title and Product are mandatory');
        try {
            await api.post('/eco/start', formData);
            setIsCreateOpen(false); fetchData();
        } catch (err) { alert(err.response?.data?.msg || 'Error starting ECO workflow'); }
    };

    const DynamicBadge = ({ stage, status }) => {
        if (status === 'Draft') return <span className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm">Draft</span>;
        if (!stage) return <span className="bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 px-2 py-0.5 text-xs rounded-full border border-gray-200 dark:border-white/5 shadow-sm">Orphaned</span>;
        if (stage.isFinal) return <span className="bg-green-50 dark:bg-emerald-500/10 border border-green-200 dark:border-emerald-500/20 text-green-700 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm">DONE</span>;
        if (stage.isDraft) return <span className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm">{stage.name}</span>;
        return <span className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm">{stage.name}</span>;
    };

    const RiskBadge = ({ level }) => {
        const lv = level || 'Low';
        if (lv === 'High') return <span className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-2 py-0.5 text-[10px] uppercase font-bold rounded flex items-center shadow-sm w-max gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> HIGH</span>;
        if (lv === 'Medium') return <span className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px] uppercase font-bold rounded flex items-center shadow-sm w-max gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span> MEDIUM</span>;
        return <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px] uppercase font-bold rounded flex items-center shadow-sm w-max gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> LOW</span>;
    };

    const predefinedStages = ['all', 'Draft', 'New', 'Approval', 'Done'];
    const dynamicStages = new Set(ecos.map(e => {
        if (e.status === 'Draft') return 'Draft';
        if (e.status === 'Completed' || e.stage?.isFinal) return 'Done';
        return e.stage?.name || 'New';
    }).filter(Boolean));
    const uniqueStages = Array.from(new Set([...predefinedStages, ...dynamicStages]));
    const uniqueProducts = ['all', ...new Set(ecos.map(e => e.productId?.name).filter(Boolean))];
    const uniqueRisks = ['all', 'Low', 'Medium', 'High'];
    const dateOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: '7', label: 'Last 7 Days' },
        { value: '30', label: 'Last 30 Days' },
    ];

    const filteredEcos = ecos.filter(e => {
        const stageName = e.status === 'Draft' ? 'Draft' : (e.status === 'Completed' || e.stage?.isFinal ? 'Done' : (e.stage?.name || 'New'));

        // Hide Draft and New stages from Approvers completely
        if (user?.role === 'Approver' && (e.status === 'Draft' || stageName === 'New' || e.stage?.sequence < 3)) return false;

        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStage = stageFilter === 'all' || stageName === stageFilter;
        const matchesProduct = productFilter === 'all' || e.productId?.name === productFilter;
        const matchesRisk = riskFilter === 'all' || e.riskLevel === riskFilter;

        let matchesDate = true;
        if (dateFilter !== 'all') {
            const ecoDate = new Date(e.createdAt);
            const now = new Date();
            const diffDays = (now - ecoDate) / (1000 * 60 * 60 * 24);
            if (dateFilter === 'today' && ecoDate.toDateString() !== now.toDateString()) matchesDate = false;
            else if (dateFilter === '7' && diffDays > 7) matchesDate = false;
            else if (dateFilter === '30' && diffDays > 30) matchesDate = false;
        }

        return matchesSearch && matchesStage && matchesProduct && matchesRisk && matchesDate;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)] transition-colors duration-300">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Engineering Change Pipeline</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Click any entry to view detailed payload comparisons and workflow actions.</p>
                </div>
                <button onClick={() => { setFormData({ ...formData, title: '', productId: '' }); setIsCreateOpen(true); }} className="bg-amber-400 dark:bg-amber-500 text-slate-900 border border-amber-500 dark:border-amber-400 hover:bg-amber-500 dark:hover:bg-amber-400 hover:-translate-y-0.5 shadow-lg shadow-amber-500/20 dark:shadow-amber-900/20 transition-all duration-200 px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2">
                    <Plus size={16} className="text-slate-800 dark:text-slate-900" /> New
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden transition-colors">
                <div className="p-5 border-b border-gray-100 dark:border-white/5 space-y-4 shrink-0 transition-colors">
                    <div className="relative w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                        <input type="text" placeholder="Search ECOs by title or target asset..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block mr-1">Filter</span>
                        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-md text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-700 dark:text-slate-300 shadow-sm transition-colors cursor-pointer">
                            <option value="all">Stage: All</option>
                            {uniqueStages.filter(s => s !== 'all').map(stage => <option key={stage} value={stage}>Stage: {stage}</option>)}
                        </select>
                        <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-md text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-700 dark:text-slate-300 shadow-sm transition-colors cursor-pointer">
                            <option value="all">Product: All</option>
                            {uniqueProducts.filter(p => p !== 'all').map(p => <option key={p} value={p}>Target: {p}</option>)}
                        </select>
                        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-md text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-700 dark:text-slate-300 shadow-sm transition-colors cursor-pointer">
                            <option value="all">Risk: All</option>
                            {uniqueRisks.filter(r => r !== 'all').map(r => <option key={r} value={r}>Risk: {r}</option>)}
                        </select>
                        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-md text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-700 dark:text-slate-300 shadow-sm transition-colors cursor-pointer">
                            {dateOptions.map(d => <option key={d.value} value={d.value}>Date: {d.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10 transition-colors">
                            <tr>
                                <th className="px-6 py-3">ECO Title</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Target Asset</th>
                                <th className="px-6 py-3">Risk Level</th>
                                <th className="px-6 py-3">Workflow Node</th>
                                <th className="px-6 py-3">Author</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5 transition-colors">
                            {filteredEcos.map(eco => (
                                <tr key={eco._id} onClick={() => setActiveEcoId(eco._id)} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">{eco.title}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] text-slate-600 dark:text-slate-400 uppercase font-mono border border-slate-200 dark:border-white/10 tracking-wider font-semibold">{eco.type}</span></td>
                                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{eco.productId?.name} <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-1">v{eco.productId?.version}</span></td>
                                    <td className="px-6 py-4"><RiskBadge level={eco.riskLevel} /></td>
                                    <td className="px-6 py-4"><DynamicBadge stage={eco.stage} status={eco.status} /></td>
                                    <td className="px-6 py-4">{eco.createdBy?.email}</td>
                                </tr>
                            ))}
                            {filteredEcos.length === 0 && (<tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-500">No Pipeline Data Available</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)}></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-3xl relative z-10 flex flex-col overflow-hidden max-h-[90vh] border border-transparent dark:border-white/10"
                        >
                            {/* Header Box */}
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-start justify-between shrink-0 bg-white dark:bg-[#0f172a]">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Draft Engineering Change Request</h2>
                                        <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md text-xs font-bold border border-gray-200 dark:border-white/10">Draft</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Create a change request to modify product or BoM data through controlled workflow</p>
                                </div>
                                <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 p-2 transition-colors"><X size={20} /></button>
                            </div>

                            {/* Form Body - Card Based layout */}
                            <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">

                                {/* SECTION A: Basic Information */}
                                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-slate-800/40 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                                    <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5 border-b border-gray-50 dark:border-white/5 pb-2">A. Basic Information</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ECO Title <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className={`w-full bg-white dark:bg-slate-900 border rounded-lg px-4 py-2.5 text-sm dark:text-white outline-none transition-all ${!formData.title ? 'border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
                                                placeholder="e.g. Update Chassis Material"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Describe what change you are proposing</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ECO Type <span className="text-red-500">*</span></label>
                                            <select
                                                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value, productId: '' })}
                                            >
                                                <option value="product">Product Master</option>
                                                <option value="bom">Bill of Materials</option>
                                            </select>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Select whether you are modifying Product or BoM</p>
                                        </div>
                                    </div>
                                </motion.section>

                                {/* SECTION B: Target Details */}
                                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800/40 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                                    <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5 border-b border-gray-50 dark:border-white/5 pb-2">B. Target Details</h3>

                                    <div className="space-y-6">
                                        {formData.type === 'product' ? (
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Target Asset (Product) <span className="text-red-500">*</span></label>
                                                <select
                                                    className={`w-full bg-white dark:bg-slate-900 border rounded-lg px-4 py-2.5 text-sm dark:text-white outline-none transition-all font-medium ${!formData.productId ? 'border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
                                                    value={formData.productId}
                                                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                                                >
                                                    <option value="">Select ACTIVE Product...</option>
                                                    {products.map(p => <option key={p._id} value={p._id}>{p.name} (v{p.version})</option>)}
                                                </select>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Choose the item you want to modify</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Target Asset (BoM) <span className="text-red-500">*</span></label>
                                                <select
                                                    className={`w-full bg-white dark:bg-slate-900 border rounded-lg px-4 py-2.5 text-sm dark:text-white outline-none transition-all font-medium ${!formData.productId ? 'border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
                                                    value={formData.productId}
                                                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                                                >
                                                    <option value="">Select ACTIVE BoM...</option>
                                                    {products.map(p => <option key={p._id} value={p._id}>BoM for {p.name} v{p.version}</option>)}
                                                </select>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Choose the item you want to modify</p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned User</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 font-semibold rounded-lg px-4 py-2.5 text-sm cursor-not-allowed select-none"
                                                value={formData.assignedUser}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </motion.section>

                                {/* SECTION C: Effective Settings */}
                                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-slate-800/40 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                                    <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5 border-b border-gray-50 dark:border-white/5 pb-2">C. Effective Settings</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Effective Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Date when changes should be applied after approval</p>
                                        </div>

                                        <div className="flex items-start gap-3 bg-blue-50/50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 shadow-sm">
                                            <input
                                                type="checkbox"
                                                id="version"
                                                className="mt-1 w-4 h-4 rounded text-blue-600 dark:text-blue-500 border-blue-300 dark:border-blue-500/30 focus:ring-blue-500 cursor-pointer"
                                                checked={formData.versionUpdate}
                                                onChange={e => setFormData({ ...formData, versionUpdate: e.target.checked })}
                                            />
                                            <div>
                                                <label htmlFor="version" className="text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer block">Execute Strict Version Update</label>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Creates a new version instead of overwriting existing data</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>

                                {/* Workflow Context Box */}
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 p-4 rounded-xl flex items-start gap-3">
                                    <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">This request will go through approval before changes are applied.</p>
                                </motion.div>

                            </div>

                            {/* Footer Buttons */}
                            <div className="px-8 py-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-3 shrink-0 bg-white dark:bg-[#0f172a] shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)]">
                                <div className="relative group">
                                    <button
                                        onClick={saveDraft}
                                        className="px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none"
                                    >
                                        Save Draft
                                    </button>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                        Save as draft without starting workflow
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <button
                                        onClick={startWorkflow}
                                        disabled={!formData.title || !formData.productId}
                                        className="px-8 py-2.5 text-sm font-bold text-white bg-emerald-600 border border-emerald-700 rounded-lg hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-emerald-500/30 outline-none"
                                    >
                                        Start
                                    </button>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full right-0 mb-2 w-max px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                        Begin workflow and move to active stage
                                        <div className="absolute top-full right-8 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {activeEcoId && <ECOView ecoId={activeEcoId} onClose={() => setActiveEcoId(null)} refreshList={fetchData} />}
        </div>
    );
};

export default ECOList;
