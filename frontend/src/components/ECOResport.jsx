import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileSearch } from 'lucide-react';
import ECOView from './ECOView';

const ECOResport = () => {
    const { user } = useAuth();
    const [ecos, setEcos] = useState([]);
    const [activeEcoId, setActiveEcoId] = useState(null);

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchData = async () => {
        try {
            const res = await api.get('/eco');
            // Filter based on Data Visibility rules
            let visibleEcos = res.data;
            if (user?.role === 'Engineer') {
                visibleEcos = visibleEcos.filter(e => e.createdBy?._id === user.id || e.createdBy?.email === user.email);
            } else if (user?.role === 'Approver') {
                // ECOs requiring review: not draft, not final, and stage has approvals including this approver
                visibleEcos = visibleEcos.filter(e => {
                    if (e.stage?.isDraft || e.stage?.isFinal) return false;
                    const requiresMe = e.stage?.approvals?.some(a => a.user?._id === user.id || a.user === user.id);
                    return requiresMe;
                });
            }
            // Admin sees all
            setEcos(visibleEcos);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, [user]);

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
            <div className="flex items-center justify-center mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Engineering Change Orders</h1>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="overflow-auto flex-1 p-2">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">ECO Title</th>
                                <th className="px-6 py-4">ECO Type</th>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4 text-center">Changes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ecos.map(eco => (
                                <tr key={eco._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5 font-bold text-slate-900">{eco.title}</td>
                                    <td className="px-6 py-5 uppercase text-xs font-semibold">{eco.type}</td>
                                    <td className="px-6 py-5">{eco.productId?.name} <span className="text-[10px] text-gray-400">v{eco.productId?.version}</span></td>
                                    <td className="px-6 py-5 text-center">
                                        <button onClick={() => setActiveEcoId(eco._id)} className="px-4 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:text-blue-800 rounded-md transition-colors flex items-center gap-1 mx-auto shadow-sm">
                                            <FileSearch size={14} /> Changes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {ecos.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No ECO records available for your role view.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Read-Only Compare View modal wrapper using ECOView */}
            {activeEcoId && (
                <div className="reporting-read-only-wrapper">
                    <ECOView ecoId={activeEcoId} onClose={() => setActiveEcoId(null)} refreshList={fetchData} readOnlyReport={true} />
                </div>
            )}
        </div>
    );
};

export default ECOResport;
