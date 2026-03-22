import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, X, UploadCloud, FileType, Archive, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusBadge = ({ status }) =>
    status === 'active'
        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active
        </span>
        : <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
            <Archive size={10} />Archived
        </span>;

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [viewRoute, setViewRoute] = useState('list'); // 'list' | 'create' | 'detail'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', costPrice: '', attachments: [] });

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    const fetchProducts = async () => {
        try {
            // Fetch ALL versions so we can show history
            const res = await api.get('/products/all');
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return alert('Missing required fields');
        try {
            await api.post('/products', {
                name: newProduct.name,
                price: Number(newProduct.price),
                costPrice: Number(newProduct.costPrice || 0),
                attachments: newProduct.attachments
            });
            setViewRoute('list');
            setNewProduct({ name: '', price: '', costPrice: '', attachments: [] });
            fetchProducts();
        } catch (err) { alert(err.response?.data?.msg || 'Error creating product'); }
    };

    const mockFileUpload = () => {
        const tempFiles = ['datasheet_v1.pdf', 'schematics.dxf', 'material_specs.xlsx'];
        const randomFile = tempFiles[Math.floor(Math.random() * tempFiles.length)];
        setNewProduct({ ...newProduct, attachments: [...newProduct.attachments, randomFile] });
    };

    // Filter + sort: active on top, archived below
    const filteredProducts = products
        .filter(p => {
            if (!showArchived && p.status !== 'active') return false;
            if (user?.role === 'Operations' && p.status !== 'active') return false;
            return p.name.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
            // Active always before archived
            if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
            // Same status: sort by name, then version desc
            if (a.name !== b.name) return a.name.localeCompare(b.name);
            return b.version - a.version;
        });

    // --- FORM VIEW (create OR detail) ---
    const renderForm = () => {
        const isDetail = viewRoute === 'detail';
        const isArchived = isDetail && selectedProduct?.status === 'archived';
        const data = isDetail ? selectedProduct : newProduct;

        return (
            <div className="p-8 max-w-4xl mx-auto transition-colors duration-300">
                {/* Header buttons */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setViewRoute('list')}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <X size={16} /> Back
                    </button>
                    {/* Only show Save when creating (not detail, not archived) */}
                    {!isDetail && (
                        <button
                            onClick={handleCreateProduct}
                            className="px-6 py-2 text-sm font-bold text-slate-900 bg-amber-400 dark:bg-amber-500 border border-amber-500 dark:border-amber-400 rounded-md hover:bg-amber-500 dark:hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all"
                        >
                            Save Data
                        </button>
                    )}
                </div>

                {/* Archived read-only banner */}
                <AnimatePresence>
                    {isArchived && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mb-5 flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 text-sm font-semibold"
                        >
                            <Archive size={16} />
                            Read Only (Archived) — This version has been superseded by a newer ECO-approved version. It cannot be edited or used in new operations.
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden transition-colors">
                    <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-colors">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {isDetail ? 'Product Details' : 'New Product Record'}
                            </h2>
                            {isDetail && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Version history record · Not editable
                                </p>
                            )}
                        </div>
                        {isDetail && <StatusBadge status={data.status} />}
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Product Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-gray-50 dark:border-white/5 pb-4">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                readOnly={isDetail}
                                type="text"
                                className="w-2/3 border border-gray-300 dark:border-white/10 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white read-only:bg-gray-50 dark:read-only:bg-slate-800 read-only:text-slate-500 read-only:border-transparent outline-none transition-colors"
                                value={data.name}
                                onChange={e => !isDetail && setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                        </div>

                        {/* Sales Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-gray-50 dark:border-white/5 pb-4">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                Sales Price <span className="text-red-500">*</span>
                            </label>
                            <div className="w-2/3 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400">$</span>
                                <input
                                    readOnly={isDetail}
                                    type="number"
                                    className="w-full border border-gray-300 dark:border-white/10 rounded-md pl-7 px-3 py-2 text-sm bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white read-only:bg-gray-50 dark:read-only:bg-slate-800 read-only:text-slate-500 read-only:border-transparent font-mono outline-none transition-colors"
                                    value={data.price}
                                    onChange={e => !isDetail && setNewProduct({ ...newProduct, price: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Cost Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-gray-50 dark:border-white/5 pb-4">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300">Cost Price</label>
                            <div className="w-2/3 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400">$</span>
                                <input
                                    readOnly={isDetail}
                                    type="number"
                                    className="w-full border border-gray-300 dark:border-white/10 rounded-md pl-7 px-3 py-2 text-sm bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white read-only:bg-gray-50 dark:read-only:bg-slate-800 read-only:text-slate-500 read-only:border-transparent font-mono outline-none transition-colors"
                                    value={data.costPrice}
                                    onChange={e => !isDetail && setNewProduct({ ...newProduct, costPrice: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2 pb-4 border-b border-gray-50 dark:border-white/5">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">Attachments</label>
                            <div className="w-2/3">
                                {!isDetail && (
                                    <div
                                        className="border border-dashed border-gray-300 dark:border-slate-700 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors mb-4"
                                        onClick={mockFileUpload}
                                    >
                                        <UploadCloud size={24} className="mx-auto text-gray-400 dark:text-slate-500 mb-2" />
                                        <p className="text-xs text-gray-500 dark:text-slate-400">Click to upload files (PDFs, Excel, Images)</p>
                                    </div>
                                )}
                                <div className="space-y-2 flex flex-col items-start">
                                    {data.attachments?.length > 0
                                        ? data.attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 font-medium">
                                                <FileType size={14} className="text-slate-400" /> {file}
                                            </div>
                                        ))
                                        : <span className="text-xs text-gray-400 dark:text-slate-500 italic">No payloads attached.</span>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Version */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300">Hardware Version</label>
                            <div className="w-2/3">
                                {isDetail ? (
                                    <input
                                        readOnly type="text"
                                        className="w-full border border-transparent rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold outline-none"
                                        value={`v${data.version}`}
                                    />
                                ) : (
                                    <div className="bg-blue-50/50 dark:bg-blue-500/10 p-3 rounded border border-blue-100 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-400 font-medium">
                                        Generates Base Version (v1). Iterations execute exclusively through ECO lifecycles.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (viewRoute !== 'list') return renderForm();

    // --- LIST VIEW ---
    const canCreate = user?.role === 'Engineer' || user?.role === 'Admin';

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)] transition-colors duration-300">
            {/* Page header */}
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Master Data: Products</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Full version history — active versions on top, archived below.
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setViewRoute('create')}
                        className="bg-amber-400 dark:bg-amber-500 text-slate-900 border border-amber-500 hover:bg-amber-500 hover:-translate-y-0.5 shadow-lg shadow-amber-500/20 transition-all duration-200 px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> New Product
                    </button>
                )}
            </div>

            {/* Table card */}
            <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden transition-colors">

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-4 shrink-0">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search Products..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-white/10 rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-500/20 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Show Archived toggle — hidden for Operations role */}
                    {user?.role !== 'Operations' && (
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border transition-all duration-200 ${showArchived
                                ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-700 dark:border-slate-600 shadow-inner'
                                : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-gray-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Archive size={14} />
                            {showArchived ? 'Hiding Archived' : 'Show Archived'}
                        </button>
                    )}

                    {showArchived && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-full">
                            Showing all versions including archived
                        </span>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Version</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Sales Price</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            <AnimatePresence initial={false}>
                                {filteredProducts.map(product => (
                                    <motion.tr
                                        key={product._id}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${product.status === 'archived' ? 'opacity-55' : ''}`}
                                        onClick={() => { setSelectedProduct(product); setViewRoute('detail'); }}
                                    >
                                        {/* Name */}
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
                                            {product.name}
                                        </td>

                                        {/* Version badge */}
                                        <td className="px-6 py-4">
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                v{product.version}
                                            </span>
                                        </td>

                                        {/* Status badge */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={product.status} />
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                                            ${product.price?.toLocaleString()}
                                        </td>

                                        {/* View button */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={e => { e.stopPropagation(); setSelectedProduct(product); setViewRoute('detail'); }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20"
                                            >
                                                <Eye size={13} />
                                                {product.status === 'archived' ? 'View (Read Only)' : 'View'}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        {showArchived ? 'No products found.' : 'No active products found. Toggle "Show Archived" to see all versions.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
