import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Clock, FileKey, Download, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Action colour map ─────────────────────────────────── */
const ACTION_META = {
    ECO_DRAFTED: { label: 'ECO Drafted', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
    ECO_CREATED: { label: 'ECO Created', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
    ECO_STAGE_TRANSITION: { label: 'Stage Transition', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
    ECO_APPROVAL_ACTION: { label: 'Approval Action', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
    ECO_SIGN_ACTION: { label: 'Signature', color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' },
    ECO_APPROVED: { label: 'ECO Approved', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
    ECO_APPLIED: { label: 'ECO Applied', color: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' },
    PRODUCT_CREATED: { label: 'Product Created', color: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20' },
    PRODUCT_VERSIONED: { label: 'Product Versioned', color: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20' },
    BOM_BASELINE_CREATED: { label: 'BoM Created', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' },
    BOM_VERSIONED: { label: 'BoM Versioned', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' },
};

const ActionBadge = ({ action }) => {
    const meta = ACTION_META[action] || { label: action.replace(/_/g, ' '), color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${meta.color}`}>
            {meta.label}
        </span>
    );
};

/* ── Diff row: oldValue → newValue ─────────────────────── */
const DiffCell = ({ oldVal, newVal }) => {
    if (!oldVal && !newVal) return <span className="text-slate-400 dark:text-slate-600 italic text-xs">—</span>;

    const renderVal = (v) => {
        if (v === null || v === undefined) return <span className="italic text-slate-400">null</span>;
        if (typeof v === 'object') {
            return (
                <div className="space-y-0.5">
                    {Object.entries(v).map(([k, vv]) => (
                        <div key={k} className="flex gap-1.5">
                            <span className="text-slate-400 dark:text-slate-500">{k}:</span>
                            <span className="font-mono">{String(vv)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return <span className="font-mono">{String(v)}</span>;
    };

    return (
        <div className="flex items-start gap-2 text-xs">
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-2 py-1 rounded max-w-[140px] overflow-hidden">
                {renderVal(oldVal)}
            </div>
            <ChevronRight size={12} className="mt-1 text-slate-400 flex-shrink-0" />
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded max-w-[140px] overflow-hidden">
                {renderVal(newVal)}
            </div>
        </div>
    );
};

/* ── Main Component ──────────────────────────────────────── */
const AuditReport = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/audit', {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                setLogs(res.data);
            } catch (err) { console.error('Error fetching logs', err); }
            finally { setLoading(false); }
        };
        fetchLogs();
    }, [user]);

    const actionTypes = ['ALL', ...Object.keys(ACTION_META)];

    const filtered = logs.filter(log => {
        if (filterAction !== 'ALL' && log.action !== filterAction) return false;
        if (search) {
            const s = search.toLowerCase();
            return (
                log.action?.toLowerCase().includes(s) ||
                log.user?.email?.toLowerCase().includes(s) ||
                log.entityId?.toString().includes(s)
            );
        }
        return true;
    });

    // Export CSV
    const exportCSV = () => {
        const rows = [['Timestamp', 'Action', 'Actor', 'Role', 'Target Ref', 'Old Value', 'New Value']];
        filtered.forEach(l => rows.push([
            new Date(l.createdAt).toISOString(),
            l.action,
            l.user?.email || 'SYSTEM',
            l.user?.role || '',
            l.entityId,
            JSON.stringify(l.oldValue || ''),
            JSON.stringify(l.newValue || ''),
        ]));
        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `audit_log_${Date.now()}.csv`; a.click();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)] transition-colors duration-300">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Immutable System Trace <ShieldCheck size={22} className="text-blue-600 dark:text-blue-400" />
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Enterprise audit log — every critical lifecycle action is permanently recorded.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Summary count */}
                    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-center">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Events</div>
                        <div className="text-xl font-black text-slate-800 dark:text-white leading-tight mt-0.5">{logs.length}</div>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm"
                    >
                        <Download size={15} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Tracked events legend */}
            <div className="flex flex-wrap gap-2 mb-4 shrink-0">
                {Object.entries(ACTION_META).map(([key, meta]) => (
                    <span key={key} className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${meta.color}`}>{meta.label}</span>
                ))}
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden transition-colors">

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3 shrink-0 bg-slate-50 dark:bg-slate-800/30">
                    <div className="relative max-w-xs w-full">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search actor, ref ID…"
                            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Action filter */}
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={filterAction}
                            onChange={e => setFilterAction(e.target.value)}
                            className="pl-8 pr-8 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 shadow-sm appearance-none cursor-pointer transition-all"
                        >
                            {actionTypes.map(a => (
                                <option key={a} value={a}>{a === 'ALL' ? 'All Events' : (ACTION_META[a]?.label || a)}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
                        Showing {filtered.length} of {logs.length} events
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-32 text-slate-400 dark:text-slate-500">Loading audit history…</div>
                    ) : (
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">
                                        <div className="flex items-center gap-1.5"><Clock size={13} /> Timestamp</div>
                                    </th>
                                    <th className="px-5 py-3 font-semibold">Event Action</th>
                                    <th className="px-5 py-3 font-semibold">
                                        <div className="flex items-center gap-1.5"><User size={13} /> Actor</div>
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        <div className="flex items-center gap-1.5"><FileKey size={13} /> Affected Record</div>
                                    </th>
                                    <th className="px-5 py-3 font-semibold">Old Value → New Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                <AnimatePresence initial={false}>
                                    {filtered.map(log => (
                                        <motion.tr
                                            key={log._id}
                                            initial={{ opacity: 0, y: 3 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                            {/* Timestamp */}
                                            <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>

                                            {/* Action badge */}
                                            <td className="px-5 py-3.5">
                                                <ActionBadge action={log.action} />
                                            </td>

                                            {/* Actor */}
                                            <td className="px-5 py-3.5">
                                                <div className="font-medium text-slate-800 dark:text-slate-200">{log.user?.email || 'SYSTEM'}</div>
                                                {log.user?.role && (
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase">{log.user.role}</div>
                                                )}
                                            </td>

                                            {/* Affected record ref */}
                                            <td className="px-5 py-3.5 font-mono text-[10px] text-slate-400 dark:text-slate-500 max-w-[140px] truncate">
                                                {log.entityId}
                                            </td>

                                            {/* Old → New diff */}
                                            <td className="px-5 py-3.5">
                                                <DiffCell oldVal={log.oldValue} newVal={log.newValue} />
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                            No events match your filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditReport;
