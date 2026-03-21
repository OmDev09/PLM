import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, X } from 'lucide-react';
import ECOView from './ECOView';

const ECOList = () => {
    const { user } = useAuth();
    const [ecos, setEcos] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeEcoId, setActiveEcoId] = useState(null);

    const [formData, setFormData] = useState({
        title: '', type: 'product', productId: '', assignedUser: user?.email || '', versionUpdate: true
    });

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchData = async () => {
        try {
            const [ecoRes, prodRes] = await Promise.all([api.get('/eco'), api.get('/products/active')]);
            setEcos(ecoRes.data); setProducts(prodRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateECO = async (status) => {
        if (!formData.title || !formData.productId) return alert('Title and Product are mandatory');
        try {
            await api.post('/eco', { ...formData, status });
            setIsCreateOpen(false); fetchData();
        } catch (err) { alert(err.response?.data?.msg || 'Error creating ECO'); }
    };

    const DynamicBadge = ({ stage }) => {
        if (!stage) return <span className="bg-gray-100 text-gray-400 px-2 py-0.5 text-xs rounded-full border border-gray-200 shadow-sm">Orphaned</span>;
        if (stage.isFinal) return <span className="bg-green-50 border border-green-200 text-green-700 px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm">{stage.name}</span>;
        if (stage.isDraft) return <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm">{stage.name}</span>;
        return <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm">{stage.name}</span>;
    };

    const filteredEcos = ecos.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Engineering Change Pipeline</h1>
                    <p className="text-sm text-slate-500 mt-1">Click any entry to view detailed payload comparisons and workflow actions.</p>
                </div>
                <button onClick={() => { setFormData({ ...formData, title: '', productId: '' }); setIsCreateOpen(true); }} className="bg-amber-400 text-slate-900 border border-amber-500 hover:bg-amber-500 hover:-translate-y-0.5 shadow-lg shadow-amber-500/20 transition-all duration-200 px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2">
                    <Plus size={16} className="text-slate-800" /> New
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4 shrink-0">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search ECOs..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3">ECO Title</th>
                                <th className="px-6 py-3">Target Asset</th>
                                <th className="px-6 py-3">Workflow Node</th>
                                <th className="px-6 py-3">Author</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEcos.map(eco => (
                                <tr key={eco._id} onClick={() => setActiveEcoId(eco._id)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-700">{eco.title}</td>
                                    <td className="px-6 py-4">{eco.productId?.name} <span className="text-[10px] text-gray-400 ml-1">v{eco.productId?.version}</span></td>
                                    <td className="px-6 py-4"><DynamicBadge stage={eco.stage} /></td>
                                    <td className="px-6 py-4">{eco.createdBy?.email}</td>
                                </tr>
                            ))}
                            {filteredEcos.length === 0 && (<tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No Pipeline Data Available</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Box */}
                        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-900">Draft Engineering Change Request</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-sm hover:bg-gray-100 p-1"><X size={20} /></button>
                        </div>

                        {/* Top Action Buttons - Inside Card, Top Left */}
                        <div className="px-8 py-3 bg-white border-b border-gray-200 flex items-center gap-3 shrink-0">
                            <button onClick={() => handleCreateECO('start')} className="px-6 py-1.5 text-sm font-bold text-white bg-emerald-600 border border-emerald-700 rounded-md hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                Start
                            </button>
                            <button onClick={() => handleCreateECO('draft')} className="px-6 py-1.5 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                                Save
                            </button>
                        </div>

                        {/* Vertical Form Fields */}
                        <div className="p-8 overflow-y-auto space-y-2 flex-1 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-2 border-b border-gray-50">
                                <label className="w-full sm:w-1/3 text-sm font-bold text-slate-700 sm:text-right">ECO Title <span className="text-red-500">*</span></label>
                                <div className="w-full sm:w-2/3">
                                    <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-slate-500" placeholder="e.g. Update Chassis Material" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-2 border-b border-gray-50">
                                <label className="w-full sm:w-1/3 text-sm font-bold text-slate-700 sm:text-right">ECO Type <span className="text-red-500">*</span></label>
                                <div className="w-full sm:w-2/3">
                                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="product">Product Master</option>
                                        <option value="bom">Bill of Materials</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-2 border-b border-gray-50">
                                <label className="w-full sm:w-1/3 text-sm font-bold text-slate-700 sm:text-right">Target Asset (Product) <span className="text-red-500">*</span></label>
                                <div className="w-full sm:w-2/3">
                                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })}>
                                        <option value="">Select ACTIVE Product...</option>
                                        {products.map(p => <option key={p._id} value={p._id}>{p.name} (v{p.version})</option>)}
                                    </select>
                                </div>
                            </div>

                            {formData.type === 'bom' && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-2 border-b border-gray-50">
                                    <label className="w-full sm:w-1/3 text-sm font-bold text-slate-700 sm:text-right">Bill of Materials <span className="text-red-500">*</span></label>
                                    <div className="w-full sm:w-2/3">
                                        <select disabled className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-slate-500 cursor-not-allowed">
                                            <option>Auto-selecting Active BoM for Target Asset</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-2 border-b border-gray-50">
                                <label className="w-full sm:w-1/3 text-sm font-bold text-slate-700 sm:text-right">Assigned User <span className="text-red-500">*</span></label>
                                <div className="w-full sm:w-2/3">
                                    <input type="text" className="w-full border border-transparent bg-gray-50 text-gray-600 font-semibold rounded-md px-3 py-2 text-sm" value={formData.assignedUser} readOnly />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-2 border-b border-gray-50">
                                <label className="w-full sm:w-1/3 text-sm font-bold text-slate-700 sm:text-right">Effective Date</label>
                                <div className="w-full sm:w-2/3">
                                    <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-slate-500" />
                                    <p className="text-xs text-slate-400 mt-1">Leave empty to auto-apply on Final Approval.</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-2">
                                <label className="w-full sm:w-1/3 text-sm font-bold text-slate-700 sm:text-right"></label>
                                <div className="w-full sm:w-2/3 flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <input type="checkbox" id="version" className="w-4 h-4 rounded text-slate-900 border-gray-300" checked={formData.versionUpdate} onChange={e => setFormData({ ...formData, versionUpdate: e.target.checked })} />
                                    <label htmlFor="version" className="text-sm font-semibold text-slate-800 cursor-pointer">Execute Strict Version Bumping Data Matrix</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeEcoId && <ECOView ecoId={activeEcoId} onClose={() => setActiveEcoId(null)} refreshList={fetchData} />}
        </div>
    );
};

export default ECOList;
