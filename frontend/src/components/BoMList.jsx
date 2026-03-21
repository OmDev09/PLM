import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, X, Pickaxe, Trash2, Box } from 'lucide-react';

const BoMList = () => {
    const { user } = useAuth();
    const [boms, setBoms] = useState([]);
    const [activeProducts, setActiveProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewRoute, setViewRoute] = useState('list'); // 'list' | 'create' | 'detail'
    const [selectedBom, setSelectedBom] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        productId: '', reference: '', components: [], operations: []
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
            setViewRoute('list');
            setFormData({ productId: '', reference: '', components: [], operations: [] });
            fetchData();
        } catch (err) { alert(err.response?.data?.msg || 'Error creating BoM. Note: An active BoM may already exist.'); }
    };

    const addComponent = () => setFormData({ ...formData, components: [...formData.components, { name: '', quantity: 1 }] });
    const updateComponent = (idx, field, val) => { const newC = [...formData.components]; newC[idx][field] = val; setFormData({ ...formData, components: newC }); };
    const removeComponent = (idx) => setFormData({ ...formData, components: formData.components.filter((_, i) => i !== idx) });

    const addOperation = () => setFormData({ ...formData, operations: [...formData.operations, { name: '', workcenter: '', duration: 0 }] });
    const updateOperation = (idx, field, val) => { const newO = [...formData.operations]; newO[idx][field] = val; setFormData({ ...formData, operations: newO }); };
    const removeOperation = (idx) => setFormData({ ...formData, operations: formData.operations.filter((_, i) => i !== idx) });

    const filteredBoms = boms.filter(b => {
        if (user?.role === 'Operations' && b.status !== 'active') return false;
        return b.reference?.toLowerCase().includes(searchQuery.toLowerCase()) || b.productId?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const renderForm = () => {
        const isDetail = viewRoute === 'detail';
        const data = isDetail ? selectedBom : formData;

        return (
            <div className="p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-64px)]">
                <div className="flex items-center gap-4 mb-6 shrink-0">
                    <button onClick={() => setViewRoute('list')} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                        <X size={16} /> Back
                    </button>
                    {!isDetail && (
                        <button onClick={handleCreateBoM} className="px-4 py-2 text-sm font-bold text-slate-900 bg-amber-400 border border-amber-500 rounded-md hover:bg-amber-500 shadow-md shadow-amber-500/20 px-6">
                            Save Data
                        </button>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row flex-1">
                    {/* Left: Metadata */}
                    <div className="w-full lg:w-1/3 bg-slate-50 border-r border-gray-100 p-6 sm:p-8 space-y-6 overflow-y-auto">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">{isDetail ? 'BoM Details' : 'New Bill of Materials'}</h2>
                            {isDetail && <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${data.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'} border mb-6 inline-block`}>{data.status}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Product <span className="text-red-500">*</span></label>
                            {isDetail ? (
                                <div className="font-medium text-slate-900 pb-2 border-b border-gray-200">{data.productId?.name} <span className="text-gray-400 text-xs">v{data.productId?.version}</span></div>
                            ) : (
                                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 bg-white" value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })}>
                                    <option value="">Select active product...</option>
                                    {activeProducts.map(p => <option key={p._id} value={p._id}>{p.name} (v{p.version})</option>)}
                                </select>
                            )}
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference ID <span className="text-red-500">*</span></label>
                            {isDetail ? (
                                <div className="font-mono font-medium text-slate-900 pb-2 border-b border-gray-200">{data.reference}</div>
                            ) : (
                                <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 font-mono" placeholder="e.g. BOM-CH-X1" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
                            )}
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Version</label>
                            {isDetail ? (
                                <div className="font-mono text-slate-700 font-semibold text-sm">v{data.version}</div>
                            ) : (
                                <div className="font-mono text-slate-400 text-sm">Auto-generates upon baseline save</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Data Tables */}
                    <div className="w-full lg:w-2/3 p-6 sm:p-8 space-y-8 flex flex-col overflow-y-auto">

                        {/* Components Segment */}
                        <div>
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h3 className="text-base font-bold text-slate-800">1. Components Matrix</h3>
                            </div>
                            <table className="w-full text-left text-sm border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                                <thead className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider border-b border-gray-200">
                                    <tr><th className="px-4 py-3">Component Name</th><th className="px-4 py-3 w-32">Qty</th>{!isDetail && <th className="px-3 py-3 w-12 text-center">Act</th>}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.components.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-2.5">{isDetail ? <span className="font-medium text-slate-700">{c.name}</span> : <input className="w-full py-1 text-sm outline-none focus:border-b-2 focus:border-slate-800 bg-transparent" placeholder="e.g. Capacitor 1uF" value={c.name} onChange={e => updateComponent(idx, 'name', e.target.value)} />}</td>
                                            <td className="px-4 py-2.5">{isDetail ? <span className="font-mono text-slate-600">{c.quantity}</span> : <input type="number" className="w-full py-1 text-sm outline-none focus:border-b-2 focus:border-slate-800 bg-transparent font-mono" value={c.quantity} onChange={e => updateComponent(idx, 'quantity', e.target.value)} />}</td>
                                            {!isDetail && <td className="px-3 py-2.5 text-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => removeComponent(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button></td>}
                                        </tr>
                                    ))}
                                    {data.components.length === 0 && <tr><td colSpan={isDetail ? 2 : 3} className="px-4 py-6 text-center text-slate-400 italic text-sm">No component bindings present.</td></tr>}
                                </tbody>
                            </table>
                            {!isDetail && <button onClick={addComponent} className="text-blue-600 hover:text-blue-800 text-sm font-bold mt-3 py-1 flex items-center gap-1 transition-colors"><Plus size={16} /> Add Material Line</button>}
                        </div>

                        {/* Operations Segment */}
                        <div>
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h3 className="text-base font-bold text-slate-800">2. Routing Operations</h3>
                            </div>
                            <table className="w-full text-left text-sm border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                                <thead className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider border-b border-gray-200">
                                    <tr><th className="px-4 py-3">Operation Sequence</th><th className="px-4 py-3 w-40">Work Center</th><th className="px-4 py-3 w-32">Time (mins)</th>{!isDetail && <th className="px-3 py-3 w-12 text-center">Act</th>}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(data.operations || []).map((o, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-2.5">{isDetail ? <span className="font-medium text-slate-700">{o.name}</span> : <input className="w-full py-1 text-sm outline-none focus:border-b-2 focus:border-slate-800 bg-transparent" placeholder="e.g. Soldering" value={o.name} onChange={e => updateOperation(idx, 'name', e.target.value)} />}</td>
                                            <td className="px-4 py-2.5">{isDetail ? <span className="font-mono text-slate-600">{o.workcenter}</span> : <input type="text" className="w-full py-1 text-sm outline-none focus:border-b-2 focus:border-slate-800 bg-transparent font-mono uppercase" placeholder="WS-1" value={o.workcenter} onChange={e => updateOperation(idx, 'workcenter', e.target.value)} />}</td>
                                            <td className="px-4 py-2.5">{isDetail ? <span className="font-mono text-slate-600">{o.duration}</span> : <input type="number" className="w-full py-1 text-sm outline-none focus:border-b-2 focus:border-slate-800 bg-transparent font-mono" value={o.duration} onChange={e => updateOperation(idx, 'duration', Number(e.target.value))} />}</td>
                                            {!isDetail && <td className="px-3 py-2.5 text-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => removeOperation(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button></td>}
                                        </tr>
                                    ))}
                                    {(data.operations || []).length === 0 && <tr><td colSpan={isDetail ? 3 : 4} className="px-4 py-6 text-center text-slate-400 italic text-sm">No routing mapped for pipeline.</td></tr>}
                                </tbody>
                            </table>
                            {!isDetail && <button onClick={addOperation} className="text-blue-600 hover:text-blue-800 text-sm font-bold mt-3 py-1 flex items-center gap-1 transition-colors"><Plus size={16} /> Add Routing Step</button>}
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    if (viewRoute !== 'list') return renderForm();

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Data: Bills of Materials</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage component trees, referencing paths, and hardware payload definitions.</p>
                </div>
                {['Engineer', 'Admin'].includes(user?.role) && (
                    <button onClick={() => { setFormData({ productId: '', reference: '', components: [], operations: [] }); setViewRoute('create'); }} className="bg-amber-400 text-slate-900 border border-amber-500 hover:bg-amber-500 hover:-translate-y-0.5 shadow-lg shadow-amber-500/20 transition-all duration-200 px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2">
                        <Plus size={16} className="text-slate-800" /> New BoM
                    </button>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4 shrink-0">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search BoMs..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Linked Product</th>
                                <th className="px-6 py-4">Reference ID</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBoms.map(bom => (
                                <tr key={bom._id} onClick={() => { setSelectedBom(bom); setViewRoute('detail'); }} className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${bom.status === 'archived' ? 'opacity-60 bg-gray-50/50' : ''}`}>
                                    <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-700">{bom.productId?.name} <span className="text-gray-400 font-normal ml-2 text-xs">v{bom.productId?.version}</span></td>
                                    <td className="px-6 py-4 font-mono text-slate-800">{bom.reference}</td>
                                    <td className="px-6 py-4">
                                        {bom.status === 'active'
                                            ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">Active</span>
                                            : <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-gray-100 text-gray-600 border-gray-200">Archived</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {filteredBoms.length === 0 && (<tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">No BoMs Available</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BoMList;
