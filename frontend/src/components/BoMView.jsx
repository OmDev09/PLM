import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Trash2, Box, Wrench, Settings } from 'lucide-react';

const BoMView = ({ product, onClose }) => {
    const { user } = useAuth();
    const [bom, setBom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMinting, setIsMinting] = useState(false);

    const [isProposing, setIsProposing] = useState(false);
    const [components, setComponents] = useState([]);
    const [operations, setOperations] = useState([]);
    const [ecoTitle, setEcoTitle] = useState('');
    const [versionUpdate, setVersionUpdate] = useState(true);

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchBom = async () => {
        try {
            const res = await api.get(`/bom/${product._id}`);
            if (res.data && !res.data.isNew) {
                setBom(res.data); setComponents(res.data.components); setOperations(res.data.operations);
            } else { setBom(null); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBom(); }, [product]);

    const handleMintBaseline = async () => {
        try {
            setIsMinting(true);
            const res = await api.post(`/bom/${product._id}`, { components: [], operations: [] });
            setBom(res.data); setComponents([]); setOperations([]); setIsProposing(true);
        } catch (err) { alert(err.response?.data?.msg || 'Error minting baseline BoM'); }
        finally { setIsMinting(false); }
    };

    const handleProposeECO = async (e) => {
        e.preventDefault();
        if (!ecoTitle) return alert('Provide an ECO Title');
        try {
            await api.post('/eco', { title: ecoTitle, type: 'bom', productId: product._id, changes: { components, operations }, versionUpdate });
            alert('BoM ECO Proposed successfully. View in Pipeline.');
            onClose();
        } catch (err) { alert(err.response?.data?.msg || 'Error proposing ECO'); }
    };

    const addComponent = () => setComponents([...components, { name: '', quantity: 1 }]);
    const updateComponent = (idx, field, val) => { const newC = [...components]; newC[idx][field] = val; setComponents(newC); };
    const removeComponent = (idx) => setComponents(components.filter((_, i) => i !== idx));

    const addOperation = () => setOperations([...operations, { name: '', timeMinutes: 0, workCenter: '' }]);
    const updateOperation = (idx, field, val) => { const newO = [...operations]; newO[idx][field] = val; setOperations(newO); };
    const removeOperation = (idx) => setOperations(operations.filter((_, i) => i !== idx));

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-[#f9f9f9] w-full max-w-5xl rounded shadow-2xl flex flex-col h-[90vh]">

                {/* Odoo Header */}
                <div className="bg-white border-b border-gray-300 flex justify-between items-center p-3 shrink-0">
                    <h3 className="text-lg font-normal text-gray-800 flex items-center gap-2"><Box size={18} className="text-[#00A09D]" /> Bill of Materials <span className="text-sm text-gray-400">/ {product.name}</span></h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-8 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400 font-medium">Loading BoM Structure...</div>
                    ) : !bom ? (
                        <div className="bg-white border border-gray-300 shadow-sm p-10 text-center flex flex-col items-center justify-center">
                            <div className="text-gray-500 mb-6 text-sm">No manufacturing structure exists for this product.</div>
                            {(user?.role === 'Engineer' || user?.role === 'Admin') && (
                                <button onClick={handleMintBaseline} disabled={isMinting} className="bg-[#00A09D] hover:bg-[#008784] text-white px-5 py-2 text-[13px] rounded-sm font-medium transition-colors">
                                    Create BoM Form
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-300 shadow-sm p-6 relative">

                            {/* ECO Header Bar (if proposing) */}
                            {isProposing && (
                                <div className="bg-blue-50/50 p-4 rounded-sm border border-blue-100 mb-8">
                                    <div className="flex items-center gap-2 mb-4 text-[#00A09D] text-[13px] font-bold"><Settings size={14} /> Engineering Change Draft Mode</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-gray-600 mb-1">ECO Title</label>
                                            <input type="text" className="border border-gray-300 px-3 py-1.5 text-[13px] rounded-sm focus:border-[#00A09D] outline-none" value={ecoTitle} onChange={e => setEcoTitle(e.target.value)} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                                            <input type="checkbox" className="w-4 h-4 text-[#00A09D]" checked={versionUpdate} onChange={e => setVersionUpdate(e.target.checked)} />
                                            <label className="text-[13px] font-medium text-gray-700">Generate New Version</label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6 flex items-center gap-4">
                                <span className="text-2xl text-gray-800">BoM - {product.name}</span>
                                <span className="bg-gray-100 text-gray-700 border border-gray-200 text-[10px] px-2 py-0.5 rounded font-bold">V {bom.version}</span>
                            </div>

                            {/* Lists Container */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Components */}
                                <div>
                                    <div className="border-b border-gray-200 flex text-[13px] mb-4">
                                        <div className="px-4 py-2 border-b-2 border-[#00A09D] text-[#00A09D] font-bold">Components</div>
                                    </div>
                                    <table className="w-full text-left text-[13px]">
                                        <thead className="text-gray-500 border-b border-gray-200">
                                            <tr><th className="py-2">Component</th><th className="py-2">Quantity</th><th className="py-2 w-8"></th></tr>
                                        </thead>
                                        <tbody>
                                            {components.map((c, idx) => (
                                                <tr key={idx} className="border-b border-gray-100">
                                                    <td className="py-1 pr-2"><input readOnly={!isProposing} type="text" className={`w-full py-1 bg-transparent outline-none focus:border-b-2 focus:border-[#00A09D] ${!isProposing && 'text-gray-700'}`} value={c.name} onChange={e => updateComponent(idx, 'name', e.target.value)} /></td>
                                                    <td className="py-1 pr-2"><input readOnly={!isProposing} type="number" className={`w-full py-1 bg-transparent outline-none focus:border-b-2 focus:border-[#00A09D] ${!isProposing && 'text-gray-700'}`} value={c.quantity} onChange={e => updateComponent(idx, 'quantity', e.target.value)} /></td>
                                                    <td className="py-1">{isProposing && <button onClick={() => removeComponent(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {isProposing && <button onClick={addComponent} className="text-[#00A09D] hover:underline text-[13px] font-medium mt-2 py-1">Add a line</button>}
                                </div>

                                {/* Operations */}
                                <div>
                                    <div className="border-b border-gray-200 flex text-[13px] mb-4">
                                        <div className="px-4 py-2 border-b-2 border-gray-500 text-gray-700 font-bold">Operations</div>
                                    </div>
                                    <table className="w-full text-left text-[13px]">
                                        <thead className="text-gray-500 border-b border-gray-200">
                                            <tr><th className="py-2">Operation</th><th className="py-2">Duration (m)</th><th className="py-2">Work Center</th><th className="py-2 w-8"></th></tr>
                                        </thead>
                                        <tbody>
                                            {operations.map((o, idx) => (
                                                <tr key={idx} className="border-b border-gray-100">
                                                    <td className="py-1 pr-2"><input readOnly={!isProposing} type="text" className={`w-full py-1 bg-transparent outline-none focus:border-b-2 focus:border-gray-500 ${!isProposing && 'text-gray-700'}`} value={o.name} onChange={e => updateOperation(idx, 'name', e.target.value)} /></td>
                                                    <td className="py-1 pr-2"><input readOnly={!isProposing} type="number" className={`w-full py-1 bg-transparent outline-none focus:border-b-2 focus:border-gray-500 ${!isProposing && 'text-gray-700'}`} value={o.timeMinutes} onChange={e => updateOperation(idx, 'timeMinutes', e.target.value)} /></td>
                                                    <td className="py-1 pr-2"><input readOnly={!isProposing} type="text" className={`w-full py-1 bg-transparent outline-none focus:border-b-2 focus:border-gray-500 ${!isProposing && 'text-gray-700'}`} value={o.workCenter} onChange={e => updateOperation(idx, 'workCenter', e.target.value)} /></td>
                                                    <td className="py-1">{isProposing && <button onClick={() => removeOperation(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {isProposing && <button onClick={addOperation} className="text-gray-500 hover:underline text-[13px] font-medium mt-2 py-1">Add a line</button>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {bom && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2 shrink-0">
                        {isProposing ? (
                            <>
                                <button onClick={handleProposeECO} className="bg-[#00A09D] hover:bg-[#008784] text-white px-4 py-1.5 text-[13px] rounded-sm transition-colors">Save Proposal</button>
                                <button onClick={() => { setIsProposing(false); fetchBom(); }} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 text-[13px] rounded-sm hover:bg-gray-100">Discard</button>
                            </>
                        ) : (
                            (user?.role === 'Engineer' || user?.role === 'Admin') && (
                                <button onClick={() => setIsProposing(true)} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 text-[13px] rounded-sm hover:bg-gray-100 font-medium">Create BoM ECO</button>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default BoMView;
