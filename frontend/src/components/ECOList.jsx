import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, X, CheckCircle2, ChevronDown, Rocket } from 'lucide-react';

const ECOList = () => {
    const { user } = useAuth();
    const [ecos, setEcos] = useState([]);
    const [products, setProducts] = useState([]);
    const [boms, setBoms] = useState([]); // In a real app we'd fetch actual BoMs, but we map strictly to productId for now
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'product',
        productId: '',
        assignedUser: user?.email || '',
        versionUpdate: true
    });

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchData = async () => {
        try {
            const [ecoRes, prodRes] = await Promise.all([api.get('/eco'), api.get('/products')]);
            setEcos(ecoRes.data);
            setProducts(prodRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSaveDraft = async () => {
        if (!formData.title || !formData.productId) return alert('Title and Product are mandatory');
        try {
            await api.post('/eco', { ...formData, status: 'draft' });
            setIsModalOpen(false); fetchData();
        } catch (err) { alert(err.response?.data?.msg || 'Error saving ECO'); }
    };

    const handleStartProcess = async () => {
        if (!formData.title || !formData.productId) return alert('Title and Product are mandatory');
        try {
            await api.post('/eco', { ...formData, status: 'new' });
            setIsModalOpen(false); fetchData();
        } catch (err) { alert(err.response?.data?.msg || 'Error starting ECO'); }
    };

    const handlePushStage = async (eco) => {
        try {
            if (eco.status === 'draft') await api.put(`/eco/${eco._id}`, { status: 'new' });
            else if (eco.status === 'new') await api.post(`/eco/${eco._id}/approve`);
            else if (eco.status === 'approval') await api.post(`/eco/${eco._id}/apply`);
            fetchData();
        } catch (err) { alert(err.response?.data?.msg || 'Error updating stage'); }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-600 border-gray-200',
            new: 'bg-white border-blue-200 text-blue-700',
            approval: 'bg-orange-50 text-orange-700 border-orange-200',
            done: 'bg-green-50 text-green-700 border-green-200',
        };
        const labels = { draft: 'Draft', new: 'New', approval: 'In Progress (CCB)', done: 'Approved' };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status]}`}>{labels[status]}</span>
    };

    const filteredEcos = ecos.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Engineering Change Orders</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track product lifecycle mutations.</p>
                </div>
                <button onClick={() => { setFormData({ ...formData, title: '', productId: '' }); setIsModalOpen(true); }} className="bg-slate-900 text-white hover:bg-slate-800 transition-colors px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm">
                    <Plus size={16} /> Create ECO
                </button>
            </div>

            {/* Shadcn-like Table Container */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">

                {/* Table Toolbar */}
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search ECOs..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">ECO Title</th>
                                <th className="px-6 py-3">Target</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Author</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEcos.map(eco => (
                                <tr key={eco._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{eco.title}</td>
                                    <td className="px-6 py-4">{eco.productId?.name} <span className="text-xs text-gray-400">v{eco.productId?.version}</span></td>
                                    <td className="px-6 py-4 capitalize">{eco.type}</td>
                                    <td className="px-6 py-4">{eco.createdBy?.email}</td>
                                    <td className="px-6 py-4"><StatusBadge status={eco.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        {eco.status !== 'done' && (
                                            <button onClick={() => handlePushStage(eco)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                                {eco.status === 'draft' ? 'Start ECO' : eco.status === 'new' ? 'Approve' : 'Apply Changes'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredEcos.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No Data Available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Shadcn-like Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                            <h2 className="text-lg font-bold text-slate-900">New Engineering Change Request</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-sm hover:bg-gray-100 p-1"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">ECO Title <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500" placeholder="e.g. Update Chassis Material" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">ECO Type <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select className="w-full border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 appearance-none bg-white" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="product">Products</option>
                                            <option value="bom">Bills of Materials</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Author</label>
                                    <input type="text" className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-3 py-2 text-sm cursor-not-allowed" value={formData.assignedUser} readOnly />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Product Target <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select className="w-full border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 appearance-none bg-white" value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })}>
                                        <option value="">Select a product...</option>
                                        {products.map(p => <option key={p._id} value={p._id}>{p.name} (v{p.version})</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            {formData.type === 'bom' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Bill of Materials Reference</label>
                                    <div className="relative">
                                        <select className="w-full border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 appearance-none bg-white">
                                            <option value="">Auto-linked to active Product BoM</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Our system strictly ties BoMs 1:1 with Master Products.</p>
                                </div>
                            )}

                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 mt-6">
                                <input type="checkbox" id="version" className="w-4 h-4 rounded text-slate-900 border-gray-300 focus:ring-slate-900" checked={formData.versionUpdate} onChange={e => setFormData({ ...formData, versionUpdate: e.target.checked })} />
                                <div className="flex flex-col">
                                    <label htmlFor="version" className="text-sm font-bold text-slate-800 cursor-pointer">Require Version Update</label>
                                    <span className="text-xs text-gray-500">If checked, creates a new version upon application.</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                            <button onClick={handleSaveDraft} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm">Save Draft</button>
                            <button onClick={handleStartProcess} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"><Rocket size={14} /> Start</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ECOList;
