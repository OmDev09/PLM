import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, X, UploadCloud, FileType } from 'lucide-react';

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
            setIsCreateModalOpen(false);
            setNewProduct({ name: '', price: '', costPrice: '', attachments: [] });
            fetchProducts();
        } catch (err) { alert(err.response?.data?.msg || 'Error creating product'); }
    };

    const mockFileUpload = () => {
        const tempFiles = ['datasheet_v1.pdf', 'schematics.dxf', 'material_specs.xlsx'];
        const randomFile = tempFiles[Math.floor(Math.random() * tempFiles.length)];
        setNewProduct({ ...newProduct, attachments: [...newProduct.attachments, randomFile] });
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Data: Products</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage physical hardware frames across their complete lifecycle.</p>
                </div>
                {(user?.role === 'Engineer' || user?.role === 'Admin') && (
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 transition-colors px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm">
                        <Plus size={16} /> New Product
                    </button>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search Products..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Product Name</th>
                                <th className="px-6 py-3">Version</th>
                                <th className="px-6 py-3">Sales Price</th>
                                <th className="px-6 py-3">Cost Price</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map(product => (
                                <tr key={product._id} className={`hover:bg-slate-50/50 transition-colors cursor-default ${product.status === 'archived' ? 'opacity-60 bg-gray-50/50' : ''}`}>
                                    <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                                    <td className="px-6 py-4"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-mono">v{product.version}</span></td>
                                    <td className="px-6 py-4 font-mono text-slate-800">${product.price}</td>
                                    <td className="px-6 py-4 font-mono text-slate-500">${product.costPrice}</td>
                                    <td className="px-6 py-4">
                                        {product.status === 'active'
                                            ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">Active</span>
                                            : <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-gray-100 text-gray-600 border-gray-200">Archived</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (<tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No Products Available</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">New Product Variant</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-sm hover:bg-gray-100 p-1"><X size={20} /></button>
                        </div>
                        <form className="p-6 space-y-5 h-[60vh] overflow-y-auto">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Product Name <span className="text-red-500">*</span></label>
                                <input required type="text" maxLength={255} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Sales Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input required type="number" className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Cost Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input required type="number" className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500" value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Attachments</label>
                                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={mockFileUpload}>
                                    <UploadCloud size={24} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500">Click to upload files (PDFs, Excel, Images)</p>
                                </div>
                                {newProduct.attachments.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {newProduct.attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-md text-xs text-slate-700">
                                                <FileType size={14} className="text-slate-400" /> {file}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50/50 p-3 rounded border border-blue-100 text-xs text-blue-800">
                                <strong>Note:</strong> Auto-generating Version 1. Further updates will only occur via ECO approval stages for data stability.
                            </div>
                        </form>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm">Discard</button>
                            <button onClick={handleCreateProduct} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-sm">Mint Record</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProductList;
