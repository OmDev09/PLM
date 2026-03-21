import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileSearch, X, ArrowRight } from 'lucide-react';

const ECOList = () => {
    const { user } = useAuth();
    const [ecos, setEcos] = useState([]);
    const [selectedEco, setSelectedEco] = useState(null);
    const [diff, setDiff] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchEcos = async () => {
        try {
            const res = await api.get('/eco'); setEcos(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchEcos(); }, []);

    const openComparison = async (eco) => {
        setSelectedEco(eco);
        try {
            const res = await api.get(`/eco/${eco._id}/comparison`);
            setDiff(res.data); setIsModalOpen(true);
        } catch (err) { alert('Error fetching comparison details'); }
    };

    const handleApprove = async () => {
        try {
            await api.post(`/eco/${selectedEco._id}/approve`);
            setIsModalOpen(false); fetchEcos();
        } catch (err) { alert(err.response?.data?.msg || 'Error approving ECO'); }
    };

    const handleApply = async () => {
        try {
            await api.post(`/eco/${selectedEco._id}/apply`);
            setIsModalOpen(false); fetchEcos();
        } catch (err) { alert(err.response?.data?.msg || 'Error applying ECO'); }
    };

    const renderBoMArrayDiff = (title, oldArray = [], newArray = [], isQuantities = false) => {
        const allNames = [...new Set([...oldArray.map(i => i.name), ...newArray.map(i => i.name)])];
        return (
            <div className="mb-6">
                <h4 className="text-[13px] font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">{title}</h4>
                <div className="border border-gray-200 rounded-sm overflow-hidden text-[13px]">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                            <tr>
                                <th className="px-3 py-1.5 font-bold">Element</th>
                                <th className="px-3 py-1.5 font-bold">Previous</th>
                                <th className="px-3 py-1.5 font-bold">New</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {allNames.map(name => {
                                const oldItem = oldArray.find(i => i.name === name);
                                const newItem = newArray.find(i => i.name === name);

                                if (!oldItem && newItem) {
                                    return (
                                        <tr key={name} className="bg-green-50 text-green-800">
                                            <td className="px-3 py-1.5 font-medium">{name}</td>
                                            <td className="px-3 py-1.5 text-gray-400 italic">None</td>
                                            <td className="px-3 py-1.5 font-bold">{isQuantities ? newItem.quantity : `${newItem.timeMinutes}m`}</td>
                                        </tr>
                                    );
                                }
                                if (oldItem && !newItem) {
                                    return (
                                        <tr key={name} className="bg-red-50 text-red-800">
                                            <td className="px-3 py-1.5 font-medium line-through">{name}</td>
                                            <td className="px-3 py-1.5">{isQuantities ? oldItem.quantity : `${oldItem.timeMinutes}m`}</td>
                                            <td className="px-3 py-1.5 font-bold italic">Removed</td>
                                        </tr>
                                    );
                                }
                                if (oldItem && newItem) {
                                    const oldVal = isQuantities ? oldItem.quantity : oldItem.timeMinutes;
                                    const newVal = isQuantities ? newItem.quantity : newItem.timeMinutes;
                                    if (oldVal === newVal) {
                                        return (
                                            <tr key={name} className="text-gray-600">
                                                <td className="px-3 py-1.5">{name}</td>
                                                <td className="px-3 py-1.5">{oldVal}</td>
                                                <td className="px-3 py-1.5">{newVal}</td>
                                            </tr>
                                        );
                                    } else {
                                        const isIncrease = newVal > oldVal;
                                        return (
                                            <tr key={name} className={isIncrease ? "bg-[#e8f5e9] text-green-800" : "bg-[#ffebee] text-red-800"}>
                                                <td className="px-3 py-1.5 font-medium">{name}</td>
                                                <td className="px-3 py-1.5 line-through">{oldVal}</td>
                                                <td className="px-3 py-1.5 font-bold flex items-center gap-1"><ArrowRight size={12} /> {newVal}</td>
                                            </tr>
                                        );
                                    }
                                }
                                return null;
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#f9f9f9]">
            <div className="bg-white border-b border-gray-300 px-4 py-3 shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-normal text-gray-800">Engineering Change Orders</h1>
                </div>
            </div>

            <div className="p-4 overflow-y-auto w-full">
                <div className="bg-white border border-gray-300 rounded shadow-sm overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-600 border-r border-gray-200">Name</th>
                                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-600 border-r border-gray-200">Type</th>
                                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-600 border-r border-gray-200">Status</th>
                                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-600 border-r border-gray-200">Created By</th>
                                <th className="px-4 py-2 text-right text-[12px] font-bold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-[13px] text-gray-800">
                            {ecos.map((eco) => (
                                <tr key={eco._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openComparison(eco)}>
                                    <td className="px-4 py-2 whitespace-nowrap border-r border-gray-200 font-medium">{eco.title}</td>
                                    <td className="px-4 py-2 whitespace-nowrap border-r border-gray-200 capitalize">{eco.type}</td>
                                    <td className="px-4 py-2 whitespace-nowrap border-r border-gray-200 capitalize">
                                        {eco.status === 'new' && <span className="text-blue-600 font-bold">Draft</span>}
                                        {eco.status === 'approval' && <span className="text-orange-600 font-bold">In Progress</span>}
                                        {eco.status === 'done' && <span className="text-green-600 font-bold">Validated</span>}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap border-r border-gray-200">{eco.createdBy?.email}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right">
                                        <button className="text-[#00A09D] hover:underline text-xs" onClick={(e) => { e.stopPropagation(); openComparison(eco); }}>View ECO</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && selectedEco && diff && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#f9f9f9] w-full max-w-4xl rounded shadow-2xl flex flex-col h-[90vh]">
                        {/* Odoo Form Header */}
                        <div className="bg-white border-b border-gray-300 flex justify-between items-center p-2 shrink-0">
                            <div className="flex gap-2 pl-2">
                                {selectedEco.status === 'new' && (user?.role === 'Approver' || user?.role === 'Admin') && (
                                    <button onClick={handleApprove} className="bg-[#00A09D] text-white px-3 py-1 text-[13px] rounded-sm font-medium">Approve</button>
                                )}
                                {selectedEco.status === 'approval' && (user?.role === 'Engineer' || user?.role === 'Approver' || user?.role === 'Admin') && (
                                    <button onClick={handleApply} className="bg-[#00A09D] text-white px-3 py-1 text-[13px] rounded-sm font-medium">Apply Changes</button>
                                )}
                            </div>

                            {/* Odoo Stepper */}
                            <div className="flex bg-gray-100 rounded-sm border border-gray-200 text-[11px] font-bold uppercase overflow-hidden">
                                <div className={`px-4 py-1.5 border-r border-gray-200 ${selectedEco.status === 'new' ? 'bg-[#00A09D] text-white' : 'text-gray-500'}`}>Draft</div>
                                <div className={`px-4 py-1.5 border-r border-gray-200 ${selectedEco.status === 'approval' ? 'bg-[#00A09D] text-white' : 'text-gray-500'}`}>In Progress</div>
                                <div className={`px-4 py-1.5 ${selectedEco.status === 'done' ? 'bg-[#00A09D] text-white' : 'text-gray-500'}`}>Validated</div>
                            </div>

                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 mr-2"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                            {/* Form Sheet */}
                            <div className="bg-white border border-gray-300 shadow-sm p-6 relative">
                                {/* Status Ribbon (if done) */}
                                {selectedEco.status === 'done' && <div className="absolute top-0 right-0 overflow-hidden w-24 h-24"><div className="bg-green-600 text-white text-[10px] font-bold text-center w-[150%] rotate-45 translate-x-[15%] translate-y-[80%] py-1 shadow uppercase tracking-widest">Validated</div></div>}

                                <h1 className="text-2xl text-gray-900 border-b border-gray-200 pb-2 mb-6 w-full flex items-center gap-4">
                                    {selectedEco.title}
                                    {!diff.versionUpdate && <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">In-Place Edit</span>}
                                </h1>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <div className="flex items-center gap-4 border-b border-gray-100 py-1">
                                            <label className="text-[13px] font-bold text-gray-700 w-1/3">Target</label>
                                            <div className="text-[13px] text-gray-900 flex-1">{diff.targetCurrent?.name || 'BoM Target'} <span className="text-gray-500 italic text-xs ml-1">(v{diff.targetCurrent?.version})</span></div>
                                        </div>
                                        <div className="flex items-center gap-4 border-b border-gray-100 py-1">
                                            <label className="text-[13px] font-bold text-gray-700 w-1/3">Type</label>
                                            <div className="text-[13px] text-gray-900 flex-1 capitalize">{selectedEco.type}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notebook Tabs */}
                                <div className="mt-8">
                                    <div className="border-b border-gray-200 flex text-[13px]">
                                        <div className="px-4 py-2 border-b-2 border-[#00A09D] text-[#00A09D] font-bold cursor-pointer">Changes Matrix</div>
                                    </div>
                                    <div className="pt-6">
                                        {diff.type === 'product' ? (
                                            <table className="w-full text-left text-[13px]">
                                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                                    <tr><th className="px-3 py-1.5 font-bold">Field</th><th className="px-3 py-1.5 font-bold">Old Value</th><th className="px-3 py-1.5 font-bold">New Value</th></tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {Object.keys(diff.proposedChanges).map(key => {
                                                        const oldVal = diff.targetCurrent[key];
                                                        const newVal = diff.proposedChanges[key];
                                                        if (oldVal === newVal) return null;
                                                        return (
                                                            <tr key={key} className="bg-[#e8f5e9] text-gray-800">
                                                                <td className="px-3 py-2 font-bold capitalize border-l-4 border-green-500">{key}</td>
                                                                <td className="px-3 py-2 line-through text-gray-500">{oldVal}</td>
                                                                <td className="px-3 py-2 font-bold text-green-700">{newVal}</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div>
                                                {renderBoMArrayDiff('Components Additions / Subtractions', diff.targetCurrent.components, diff.proposedChanges.components, true)}
                                                {renderBoMArrayDiff('Operations Workflow Changes', diff.targetCurrent.operations, diff.proposedChanges.operations, false)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ECOList;
