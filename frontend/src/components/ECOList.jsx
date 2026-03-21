import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileSearch, CheckCircle, ArrowRight } from 'lucide-react';

const ECOList = () => {
    const { user } = useAuth();
    const [ecos, setEcos] = useState([]);
    const [selectedEco, setSelectedEco] = useState(null);
    const [diff, setDiff] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    const fetchEcos = async () => {
        try {
            const res = await api.get('/eco');
            setEcos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchEcos(); }, []);

    const openComparison = async (eco) => {
        setSelectedEco(eco);
        try {
            const res = await api.get(`/eco/${eco._id}/comparison`);
            setDiff(res.data);
            setIsModalOpen(true);
        } catch (err) {
            alert('Error fetching comparison details');
        }
    };

    const handleApprove = async () => {
        try {
            await api.post(`/eco/${selectedEco._id}/approve`);
            setIsModalOpen(false);
            fetchEcos();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error approving ECO');
        }
    };

    const handleApply = async () => {
        try {
            await api.post(`/eco/${selectedEco._id}/apply`);
            setIsModalOpen(false);
            fetchEcos();
            alert('ECO Applied successfully! Product version incremented.');
        } catch (err) {
            alert(err.response?.data?.msg || 'Error applying ECO');
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            new: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approval: 'bg-blue-100 text-blue-800 border-blue-200',
            done: 'bg-green-100 text-green-800 border-green-200'
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${colors[status]}`}>{status}</span>;
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">ECO Pipeline</h2>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ECO Title</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Target Master</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Proposed By</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {ecos.map(eco => (
                            <tr key={eco._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{eco.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {eco.productId?.name} <span className="text-slate-400 pl-1">(v{eco.productId?.version})</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={eco.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{eco.createdBy?.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openComparison(eco)}
                                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        <FileSearch size={16} /> Diff
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {ecos.length === 0 && <div className="text-center py-16 text-slate-500">No Engineering Change Orders found.</div>}
            </div>

            {/* Review Modal */}
            {isModalOpen && selectedEco && diff && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-0 w-full max-w-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{selectedEco.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Diff view against master <span className="font-semibold text-slate-700">{diff.productCurrent.name} (v{diff.productCurrent.version})</span>
                                </p>
                            </div>
                            <StatusBadge status={selectedEco.status} />
                        </div>

                        <div className="p-8 bg-slate-50">
                            <div className="grid grid-cols-3 gap-6 mb-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <div>Field Modified</div>
                                <div>Master (Old)</div>
                                <div>Proposed (New)</div>
                            </div>

                            {Object.keys(diff.proposedChanges).map(key => {
                                const currentVal = diff.productCurrent[key];
                                const proposedVal = diff.proposedChanges[key];
                                const isChanged = currentVal !== proposedVal;

                                if (!isChanged) return null;

                                return (
                                    <div key={key} className="grid grid-cols-3 gap-6 bg-white p-5 rounded-xl border border-slate-200 mb-3 shadow-sm items-center">
                                        <div className="font-semibold text-slate-900 capitalize text-sm">{key}</div>
                                        <div className="text-slate-500 bg-red-50/50 p-3 rounded-lg text-sm line-through decoration-red-300 font-mono">
                                            {currentVal}
                                        </div>
                                        <div className="text-green-800 bg-green-50 p-3 rounded-lg text-sm font-mono font-medium flex items-center gap-3 border border-green-100 shadow-inner text-right">
                                            <ArrowRight size={16} className="text-green-500 opacity-50 shrink-0" />
                                            {proposedVal}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-white">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 border border-slate-300 rounded text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Close Diff
                            </button>

                            <div className="flex gap-3">
                                {selectedEco.status === 'new' && (user?.role === 'Approver' || user?.role === 'Admin') && (
                                    <button
                                        onClick={handleApprove}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center gap-2 shadow-sm transition-all"
                                    >
                                        <CheckCircle size={18} /> Validated - Approve
                                    </button>
                                )}
                                {selectedEco.status === 'approval' && (user?.role === 'Engineer' || user?.role === 'Approver' || user?.role === 'Admin') && (
                                    <button
                                        onClick={handleApply}
                                        className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium shadow-md transition-all flex flex-col items-center"
                                    >
                                        <span className="flex items-center gap-2"><CheckCircle size={16} /> Apply & Release</span>
                                        <span className="text-[10px] text-slate-400 font-normal leading-none">(Generates v{diff.productCurrent.version + 1})</span>
                                    </button>
                                )}
                                {selectedEco.status === 'done' && (
                                    <div className="px-6 py-2 bg-green-50 text-green-800 font-medium rounded border border-green-200">
                                        Changes Applied to Master
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ECOList;
