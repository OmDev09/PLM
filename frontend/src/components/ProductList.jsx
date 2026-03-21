import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, X, UploadCloud, FileType } from 'lucide-react';

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewRoute, setViewRoute] = useState('list'); // 'list' | 'create' | 'detail'
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [newProduct, setNewProduct] = useState({ name: '', price: '', costPrice: '', attachments: [] });

    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return alert("Missing required fields");
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

    const filteredProducts = products.filter(p => {
        if (user?.role === 'Operations' && p.status !== 'active') return false;
        return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const renderForm = () => {
        const isDetail = viewRoute === 'detail';
        const data = isDetail ? selectedProduct : newProduct;

        return (
            <div className="p-8 max-w-4xl mx-auto transition-colors duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setViewRoute('list')} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 shadow-sm transition-colors">
                        <X size={16} /> Back
                    </button>
                    {!isDetail && (
                        <button onClick={handleCreateProduct} className="px-6 py-2 text-sm font-bold text-slate-900 bg-amber-400 dark:bg-amber-500 border border-amber-500 dark:border-amber-400 rounded-md hover:bg-amber-500 dark:hover:bg-amber-400 shadow-md shadow-amber-500/20 dark:shadow-amber-900/20 transition-all">
                            Save Data
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden transition-colors">
                    <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-colors">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isDetail ? 'Product Form Details' : 'New Product Record'}</h2>
                        {isDetail && <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${data.status === 'active' ? 'bg-green-100 dark:bg-emerald-500/20 text-green-800 dark:text-emerald-400 border-green-200 dark:border-emerald-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700'} border transition-colors`}>{data.status}</span>}
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-gray-50 dark:border-white/5 pb-4 transition-colors">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300">Product Name <span className="text-red-500">*</span></label>
                            <input readOnly={isDetail} type="text" className="w-2/3 border border-gray-300 dark:border-white/10 rounded-md px-3 py-2 text-sm focus:ring-2 focus:border-slate-500 dark:focus:border-slate-400 dark:focus:ring-slate-500/20 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white read-only:bg-gray-50 dark:read-only:bg-slate-800 read-only:text-slate-500 dark:read-only:text-slate-400 read-only:font-semibold read-only:border-transparent transition-colors outline-none" value={data.name} onChange={e => !isDetail && setNewProduct({ ...newProduct, name: e.target.value })} />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-gray-50 dark:border-white/5 pb-4 transition-colors">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300">Sales Price <span className="text-red-500">*</span></label>
                            <div className="w-2/3 relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDetail ? 'text-slate-500 dark:text-slate-500' : 'text-gray-400 dark:text-slate-400'}`}>$</span>
                                <input readOnly={isDetail} type="number" className="w-full border border-gray-300 dark:border-white/10 rounded-md pl-7 px-3 py-2 text-sm focus:ring-2 focus:border-slate-500 dark:focus:border-slate-400 dark:focus:ring-slate-500/20 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white read-only:bg-gray-50 dark:read-only:bg-slate-800 read-only:text-slate-500 dark:read-only:text-slate-400 read-only:border-transparent font-mono transition-colors outline-none" value={data.price} onChange={e => !isDetail && setNewProduct({ ...newProduct, price: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-gray-50 dark:border-white/5 pb-4 transition-colors">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300">Cost Price</label>
                            <div className="w-2/3 relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDetail ? 'text-slate-500 dark:text-slate-500' : 'text-gray-400 dark:text-slate-400'}`}>$</span>
                                <input readOnly={isDetail} type="number" className="w-full border border-gray-300 dark:border-white/10 rounded-md pl-7 px-3 py-2 text-sm focus:ring-2 focus:border-slate-500 dark:focus:border-slate-400 dark:focus:ring-slate-500/20 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white read-only:bg-gray-50 dark:read-only:bg-slate-800 read-only:text-slate-500 dark:read-only:text-slate-400 read-only:border-transparent font-mono transition-colors outline-none" value={data.costPrice} onChange={e => !isDetail && setNewProduct({ ...newProduct, costPrice: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2 pb-4 border-b border-gray-50 dark:border-white/5 transition-colors">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">Attachments</label>
                            <div className="w-2/3">
                                {!isDetail && (
                                    <div className="border border-dashed border-gray-300 dark:border-slate-700 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors mb-4" onClick={mockFileUpload}>
                                        <UploadCloud size={24} className="mx-auto text-gray-400 dark:text-slate-500 mb-2" />
                                        <p className="text-xs text-gray-500 dark:text-slate-400">Click to upload files (PDFs, Excel, Images)</p>
                                    </div>
                                )}
                                <div className="space-y-2 flex flex-col items-start">
                                    {data.attachments?.length > 0 ? data.attachments.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors">
                                            <FileType size={14} className="text-slate-400 dark:text-slate-500" /> {file}
                                        </div>
                                    )) : <span className="text-xs text-gray-400 dark:text-slate-500 italic font-medium">No payloads attached.</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2">
                            <label className="w-1/3 text-sm font-bold text-slate-700 dark:text-slate-300">Hardware Version</label>
                            <div className="w-2/3">
                                {isDetail ? (
                                    <input readOnly type="text" className="w-full border border-transparent rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold transition-colors outline-none" value={`v${data.version}`} />
                                ) : (
                                    <div className="bg-blue-50/50 dark:bg-blue-500/10 p-3 rounded border border-blue-100 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-400 tracking-wide font-medium transition-colors">
                                        Note: Generates Base Version (v1). Iterations execute exclusively through ECO lifecycles.
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

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)] transition-colors duration-300">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Master Data: Products</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage physical hardware frames across their complete lifecycle.</p>
                </div>
                {(user?.role === 'Engineer' || user?.role === 'Admin') && (
                    <button onClick={() => setViewRoute('create')} className="bg-amber-400 dark:bg-amber-500 text-slate-900 border border-amber-500 dark:border-amber-400 hover:bg-amber-500 dark:hover:bg-amber-400 hover:-translate-y-0.5 shadow-lg shadow-amber-500/20 dark:shadow-amber-900/20 transition-all duration-200 px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2">
                        <Plus size={16} className="text-slate-800 dark:text-slate-900" /> New Product
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden transition-colors">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex gap-4 shrink-0 transition-colors">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                        <input type="text" placeholder="Search Products..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-white/10 rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-500/20 focus:border-slate-400 dark:focus:border-slate-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10 transition-colors">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Version</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5 transition-colors">
                            {filteredProducts.map(product => (
                                <tr key={product._id} onClick={() => { setSelectedProduct(product); setViewRoute('detail'); }} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${product.status === 'archived' ? 'opacity-60 bg-gray-50/50 dark:bg-slate-900/50' : ''}`}>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">{product.name}</td>
                                    <td className="px-6 py-4"><span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono transition-colors">v{product.version}</span></td>
                                    <td className="px-6 py-4">
                                        {product.status === 'active'
                                            ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-50 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-500/20 transition-colors">Active</span>
                                            : <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 transition-colors">Archived</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (<tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No Products Available</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
