import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, X, Pickaxe, Trash2, Box } from 'lucide-react';

const BoMList = () => {
    const { user } = useAuth();
    const [boms, setBoms] = useState([]);
    const [activeProducts, setActiveProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        productId: '',
        reference: '',
        components: [],
        operations: []
    });

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchData = async () => {
        try {
            const [bomRes, prodRes] = await Promise.all([api.get('/bom/all'), api.get('/products/active')]);
            setBoms(bomRes.data);
            setActiveProducts(prodRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateBoM = async () => {
        if (!formData.productId || !formData.reference) return alert('Product and Reference are required.');
        try {
            await api.post('/bom', formData);
            setIsModalOpen(false);
            setFormData({ productId: '', reference: '', components: [], operations: [] });
            fetchData();
        } catch (err) { alert(err.response?.data?.msg || 'Error creating BoM. Note: An active BoM may already exist.'); }
    };

    const addComponent = () => setFormData({ ...formData, components: [...formData.components, { name: '', quantity: 1 }] });
    const updateComponent = (idx, field, val) => { const newC = [...formData.components]; newC[idx][field] = val; setFormData({ ...formData, components: newC }); };
    const removeComponent = (idx) => setFormData({ ...formData, components: formData.components.filter((_, i) => i !== idx) });

    const filteredBoms = boms.filter(b => b.reference?.toLowerCase().includes(searchQuery.toLowerCase()) || b.productId?.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Data: Bills of Materials</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage component trees, references, and hardware definitions.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 transition-colors px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm">
                    <Plus size={16} /> New BoM
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search BoMs..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Reference ID</th>
                                <th className="px-6 py-3">Linked Product</th>
                                <th className="px-6 py-3">Version</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBoms.map(bom => (
                                <tr key={bom._id} className={`hover:bg-slate-50/50 transition-colors ${bom.status === 'archived' ? 'opacity-60 bg-gray-50/50' : ''}`}>
                                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{bom.reference}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{bom.productId?.name}</td>
                                    <td className="px-6 py-4"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-mono">v{bom.version}</span></td>
                                    <td className="px-6 py-4">
                                        {bom.status === 'active'
                                            ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">Active</span>
                                            : <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-gray-100 text-gray-600 border-gray-200">Archived</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {filteredBoms.length === 0 && (<tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No BoMs Available</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Box size={18} /> New Bill of Materials</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-sm hover:bg-gray-100 p-1"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Select Active Product <span className="text-red-500">*</span></label>
                                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 bg-white" value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })}>
                                    <option value="">Choose a product...</option>
                                    {activeProducts.map(p => <option key={p._id} value={p._id}>{p.name} (v{p.version})</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">BoM Reference ID <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 font-mono" placeholder="e.g. BOM-CHASSIS-X1" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
                            </div>

                            {/* Components Table */}
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-bold text-slate-800 mb-2">Components</h3>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-600 border-b border-gray-200 text-xs uppercase tracking-wider">
                                        <tr><th className="px-3 py-2">Component Name</th><th className="px-3 py-2 w-24">Qty</th><th className="px-3 py-2 w-10"></th></tr>
                                    </thead>
                                    <tbody>
                                        {formData.components.map((c, idx) => (
                                            <tr key={idx} className="border-b border-gray-100">
                                                <td className="px-3 py-1"><input className="w-full py-1.5 outline-none focus:border-b-2 focus:border-slate-900" placeholder="e.g. M3 Screw" value={c.name} onChange={e => updateComponent(idx, 'name', e.target.value)} /></td>
                                                <td className="px-3 py-1"><input type="number" className="w-full py-1.5 outline-none focus:border-b-2 focus:border-slate-900" value={c.quantity} onChange={e => updateComponent(idx, 'quantity', e.target.value)} /></td>
                                                <td className="px-3 py-1 text-center"><button onClick={() => removeComponent(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                                            </tr>))}
                                    </tbody>
                                </table>
                                <button onClick={addComponent} className="text-blue-600 hover:underline text-xs font-semibold mt-3 py-1 flex items-center gap-1"><Plus size={14} /> Add line</button>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm">Discard</button>
                            <button onClick={handleCreateBoM} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-sm">Save Baseline</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BoMList;
