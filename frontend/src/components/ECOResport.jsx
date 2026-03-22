import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Activity, FileText, Package, Archive, Layers, GitBranch, ChevronRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ECOView from './ECOView';

/* ─── Shared helpers ─────────────────────────────────────── */
const TypeBadge = ({ type }) => (
    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[11px] text-slate-600 dark:text-slate-400 uppercase font-mono border border-slate-200 dark:border-slate-700 tracking-wider font-semibold">
        {type}
    </span>
);

const StatusBadge = ({ eco }) => {
    if (eco.status === 'Completed' || eco.stage?.isFinal) {
        return <span className="px-2.5 py-1 rounded text-xs font-bold border bg-green-50 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-500/20 uppercase tracking-wider">APPLIED (DONE)</span>;
    }
    if (eco.status === 'Draft') {
        return <span className="px-2.5 py-1 rounded text-xs font-bold border bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 uppercase tracking-wider">DRAFT</span>;
    }
    return <span className="px-2.5 py-1 rounded text-xs font-bold border bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 uppercase tracking-wider">{eco.stage?.name || 'IN-FLIGHT'}</span>;
};

/* ─── Tab ids ─────────────────────────────────────────────── */
const TABS = [
    { id: 'ecos', label: 'ECO Report', icon: FileText },
    { id: 'versions', label: 'Product Version History', icon: GitBranch },
    { id: 'bom', label: 'BoM Change History', icon: Layers },
    { id: 'archived', label: 'Archived Products', icon: Archive },
    { id: 'matrix', label: 'Active P–V–BoM Matrix', icon: Package },
];

/* ════════════════════════════════════════════════════════════ */
const ECOResport = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('ecos');
    const [ecos, setEcos] = useState([]);
    const [products, setProducts] = useState([]);   // all versions
    const [boms, setBoms] = useState([]);
    const [search, setSearch] = useState('');
    const [activeEcoId, setActiveEcoId] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    /* ── Fetch all data once ── */
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [ecoRes, prodRes, bomRes] = await Promise.all([
                    api.get('/eco'),
                    api.get('/products/all'),
                    api.get('/bom/all'),
                ]);
                setEcos([...ecoRes.data].reverse());
                setProducts(prodRes.data);
                setBoms(bomRes.data);
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        load();
    }, [user?.token]);

    const q = search.toLowerCase();

    /* ── Derived data ── */
    const filteredEcos = ecos.filter(e => e.title?.toLowerCase().includes(q) || e.productId?.name?.toLowerCase().includes(q));
    const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(q));
    const filteredBoms = boms.filter(b => b.reference?.toLowerCase().includes(q) || b.productId?.name?.toLowerCase().includes(q));
    const archivedProducts = filteredProducts.filter(p => p.status === 'archived');

    // Active Product–Version–BoM matrix: each active product paired with its active BoM
    const activeProducts = filteredProducts.filter(p => p.status === 'active');
    const matrixRows = activeProducts.map(p => ({
        product: p,
        bom: boms.find(b => b.productId?._id === p._id && b.status === 'active') || null,
    }));

    /* ── Summary counts ── */
    const stats = [
        { label: 'Total ECOs', value: ecos.length },
        { label: 'Completed', value: ecos.filter(e => e.status === 'Completed').length },
        { label: 'Active Products', value: products.filter(p => p.status === 'active').length },
        { label: 'Archived Versions', value: products.filter(p => p.status === 'archived').length },
    ];

    /* ── Search placeholder per tab ── */
    const placeholders = {
        ecos: 'Search ECO title or product…',
        versions: 'Search product name…',
        bom: 'Search BoM reference or product…',
        archived: 'Search archived products…',
        matrix: 'Search active products…',
    };

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)] transition-colors duration-300">

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Reporting & History</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Full lifecycle audit across ECOs, products, and bills of materials.</p>
                </div>
                {/* Summary stat cards */}
                <div className="hidden lg:flex items-center gap-3">
                    {stats.map(s => (
                        <div key={s.label} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-center min-w-[90px]">
                            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</div>
                            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight mt-0.5">{s.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tab bar ── */}
            <div className="flex items-center gap-1 mb-4 shrink-0 overflow-x-auto pb-1">
                {TABS.map(t => {
                    const Icon = t.icon;
                    const active = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => { setActiveTab(t.id); setSearch(''); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${active
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <Icon size={15} />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Main card ── */}
            <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden transition-colors">

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex gap-4 shrink-0 bg-slate-50 dark:bg-slate-800/30">
                    <div className="relative max-w-md w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder={placeholders[activeTab]}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-white/10 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content area */}
                <div className="overflow-auto flex-1 relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500">Loading data…</div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                                className="min-h-full"
                            >

                                {/* ══ TAB 1: ECO Report ══ */}
                                {activeTab === 'ecos' && (
                                    <table className="w-full text-left text-sm text-slateate-600 dark:text-slate-300">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4">ECO Title</th>
                                                <th className="px-6 py-4">ECO Type</th>
                                                <th className="px-6 py-4">Product</th>
                                                <th className="px-6 py-4">Changes</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Author</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {filteredEcos.map(eco => (
                                                <tr key={eco._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <FileText size={14} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                        {eco.title}
                                                    </td>
                                                    <td className="px-6 py-4"><TypeBadge type={eco.type} /></td>
                                                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                                        {eco.productId?.name}
                                                        <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-1">v{eco.productId?.version}</span>
                                                    </td>
                                                    {/* ── Clickable Changes column ── */}
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => setActiveEcoId(eco._id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                                        >
                                                            <Eye size={13} /> View Changes
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4"><StatusBadge eco={eco} /></td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{eco.createdBy?.email}</td>
                                                </tr>
                                            ))}
                                            {filteredEcos.length === 0 && <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">No ECOs found.</td></tr>}
                                        </tbody>
                                    </table>
                                )}

                                {/* ══ TAB 2: Product Version History ══ */}
                                {activeTab === 'versions' && (
                                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4">Product Name</th>
                                                <th className="px-6 py-4">Version</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Sales Price</th>
                                                <th className="px-6 py-4">Cost Price</th>
                                                <th className="px-6 py-4">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {filteredProducts.map(p => (
                                                <tr key={p._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${p.status === 'archived' ? 'opacity-60' : ''}`}>
                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                                        {p.name}
                                                        {p.previousVersionId && (
                                                            <span className="ml-2 text-[10px] text-blue-500 dark:text-blue-400 font-normal">← versioned from ECO</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            v{p.version}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {p.status === 'active'
                                                            ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active</span>
                                                            : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><Archive size={10} />Archived</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 font-mono">${p.price?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-mono">${p.costPrice?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {filteredProducts.length === 0 && <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No products found.</td></tr>}
                                        </tbody>
                                    </table>
                                )}

                                {/* ══ TAB 3: BoM Change History ══ */}
                                {activeTab === 'bom' && (
                                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4">Linked Product</th>
                                                <th className="px-6 py-4">Reference ID</th>
                                                <th className="px-6 py-4">Version</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Components</th>
                                                <th className="px-6 py-4">Operations</th>
                                                <th className="px-6 py-4">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {filteredBoms.map(b => (
                                                <tr key={b._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${b.status === 'archived' ? 'opacity-60' : ''}`}>
                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{b.productId?.name}</td>
                                                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{b.reference}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">v{b.version}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {b.status === 'active'
                                                            ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active</span>
                                                            : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><Archive size={10} />Archived</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{b.components?.length ?? 0} items</td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{b.operations?.length ?? 0} steps</td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {filteredBoms.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No BoM records found.</td></tr>}
                                        </tbody>
                                    </table>
                                )}

                                {/* ══ TAB 4: Archived Products ══ */}
                                {activeTab === 'archived' && (
                                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4">Product Name</th>
                                                <th className="px-6 py-4">Archived Version</th>
                                                <th className="px-6 py-4">Sales Price (at archival)</th>
                                                <th className="px-6 py-4">Archived On</th>
                                                <th className="px-6 py-4">Note</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {archivedProducts.map(p => (
                                                <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors opacity-70">
                                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{p.name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">v{p.version}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">${p.price?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{new Date(p.updatedAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                                            <Archive size={10} /> Superseded by ECO
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {archivedProducts.length === 0 && (
                                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                                    No archived products yet. Products get archived when an ECO is approved.
                                                </td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {/* ══ TAB 5: Active Product–Version–BoM Matrix ══ */}
                                {activeTab === 'matrix' && (
                                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4">Product</th>
                                                <th className="px-6 py-4">Active Version</th>
                                                <th className="px-6 py-4">Sales Price</th>
                                                <th className="px-6 py-4"><ChevronRight size={14} className="inline opacity-40" /> Active BoM Reference</th>
                                                <th className="px-6 py-4">BoM Version</th>
                                                <th className="px-6 py-4">Components</th>
                                                <th className="px-6 py-4">BoM Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {matrixRows.map(({ product: p, bom: b }) => (
                                                <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-mono border border-blue-200 dark:border-blue-500/20">v{p.version}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">${p.price?.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        {b
                                                            ? <span className="font-mono text-slate-700 dark:text-slate-300">{b.reference}</span>
                                                            : <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full font-semibold">No BoM defined</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {b
                                                            ? <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">v{b.version}</span>
                                                            : <span className="text-slate-400 dark:text-slate-600">—</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                        {b ? `${b.components?.length ?? 0} items` : '—'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {b
                                                            ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active</span>
                                                            : <span className="text-slate-400 dark:text-slate-600 text-xs">—</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                            {matrixRows.length === 0 && (
                                                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No active products found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* ── ECOView modal (opens when Changes clicked) ── */}
            {activeEcoId && (
                <ECOView
                    ecoId={activeEcoId}
                    onClose={() => setActiveEcoId(null)}
                    refreshList={() => { }}
                    readOnlyReport={true}
                />
            )}
        </div>
    );
};

export default ECOResport;
