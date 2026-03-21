import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Clock, FileKey } from 'lucide-react';

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

    const getActionClass = (action) => {
        if (action.includes('CREATED') || action.includes('VERSIONED')) return 'bg-green-100 text-green-800';
        if (action.includes('APPROVED')) return 'bg-blue-100 text-blue-800';
        if (action.includes('INPLACE')) return 'bg-orange-100 text-orange-800';
        return 'bg-purple-100 text-purple-800';
    }

    return (
        <div className="flex flex-col h-full bg-[#f9f9f9]">
            <div className="bg-white border-b border-gray-300 px-4 py-3 shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-normal text-gray-800 flex items-center gap-2"><ShieldCheck size={20} className="text-[#00A09D]" /> Audit Logs</h1>
                </div>
            </div>

            <div className="p-4 overflow-y-auto w-full">
                <div className="bg-white border border-gray-300 rounded shadow-sm overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-600 border-r border-gray-200 flex-1"><div className="flex items-center gap-1"><Clock size={12} /> Timestamp</div></th>
                                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-600 border-r border-gray-200">Action Type</th>
                                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-600 border-r border-gray-200"><div className="flex items-center gap-1"><User size={12} /> Origin Actor</div></th>
                                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-600"><div className="flex items-center gap-1"><FileKey size={12} /> Target Hash</div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-[13px] text-gray-800">
                            {logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap border-r border-gray-200 font-medium text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-2 whitespace-nowrap border-r border-gray-200">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getActionClass(log.action)}`}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap border-r border-gray-200">
                                        <span className="font-bold">{log.user?.email || 'SYSTEM'}</span> <span className="text-gray-400 italic text-[11px] ml-1">({log.user?.role})</span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-500 font-mono text-[11px]">{log.entityId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditReport;
