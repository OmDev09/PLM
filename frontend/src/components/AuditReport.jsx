import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Clock, FileKey, Download } from 'lucide-react';

const AuditReport = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/audit', { headers: { Authorization: `Bearer ${user?.token}` } });
                setLogs(res.data);
            } catch (err) { console.error('Error fetching logs', err); }
        };
        fetchLogs();
    }, [user]);

    const getBadgeStyle = (action) => {
        if (action.includes('CREATED') || action.includes('VERSIONED')) return 'bg-emerald-100 text-emerald-800 border-[0.5px] border-emerald-200';
        if (action.includes('APPROVED')) return 'bg-blue-100 text-blue-800 border-[0.5px] border-blue-200';
        if (action.includes('INPLACE') || action.includes('DRAFTED')) return 'bg-orange-100 text-orange-800 border-[0.5px] border-orange-200';
        return 'bg-purple-100 text-purple-800 border-[0.5px] border-purple-200';
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">Immutable System Trace <ShieldCheck size={24} className="text-blue-600" /></h1>
                    <p className="text-sm text-slate-500 mt-1">Enterprise audit logs of all global lifecycle modifications.</p>
                </div>
                <button className="bg-white border border-gray-300 text-slate-700 hover:bg-gray-50 transition-colors px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3"><div className="flex items-center gap-2"><Clock size={14} /> Timestamp</div></th>
                                <th className="px-6 py-3">Event Action</th>
                                <th className="px-6 py-3"><div className="flex items-center gap-2"><User size={14} /> Actor</div></th>
                                <th className="px-6 py-3"><div className="flex items-center gap-2"><FileKey size={14} /> Target Ref Id</div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(log.action)}`}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {log.user?.email || 'SYSTEM'} <span className="text-[10px] text-slate-400 font-normal italic ml-1">({log.user?.role})</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{log.entityId}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No events logged in system memory.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditReport;
