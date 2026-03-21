import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Package, X, Box, Settings } from 'lucide-react';
import BoMView from './BoMView';

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBomModalOpen, setIsBomModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');

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
        try {
            await api.post('/products', { name: newProductName, price: Number(newProductPrice) });
            setIsCreateModalOpen(false); setNewProductName(''); setNewProductPrice('');
            fetchProducts();
        } catch (err) { alert(err.response?.data?.msg || 'Error creating product'); }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Data: Products</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage physical hardware products and baseline assets.</p>
                </div>
                {(user?.role === 'Engineer' || user?.role === 'Admin') && (
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 transition-colors px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm">
                        <Plus size={16} /> New Product
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{product.name}</h3>
                                <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full border border-slate-200 font-semibold tracking-wider">v{product.version}</span>
                            </div>
                            <div className="text-slate-600 text-sm mb-4">
                                Base Valuation: <span className="font-mono text-slate-800">${product.price}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">
                                Status: <span className={product.status === 'active' ? 'text-green-600' : 'text-slate-400'}>{product.status}</span>
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-slate-50 border-t border-gray-100 flex gap-3">
                            <button onClick={() => { setSelectedProduct(product); setIsBomModalOpen(true); }} className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 font-medium shadow-sm">
                                <Box size={14} className="text-slate-400" /> BoM Tree
                            </button>
                            {/* ECOs are now created from the ECO menu per Shadcn spec */}
                        </div>
                    </div>
                ))}
                {products.length === 0 && <div className="col-span-full py-20 text-center text-slate-500 text-sm">No master products available.</div>}
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">New Master Asset</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-sm hover:bg-gray-100 p-1"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateProduct} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Product Name <span className="text-red-500">*</span></label>
                                <input required type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Base Price</label>
                                <input required type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
                            </div>
                        </form>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm">Discard</button>
                            <button onClick={handleCreateProduct} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-sm">Mint V1</button>
                        </div>
                    </div>
                </div>
            )}

            {isBomModalOpen && selectedProduct && (
                <BoMView product={selectedProduct} onClose={() => setIsBomModalOpen(false)} />
            )}
        </div>
    );
};

export default ProductList;
