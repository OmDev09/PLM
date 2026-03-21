import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Replace } from 'lucide-react';

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // New Product State
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');

    // ECO State
    const [ecoTitle, setEcoTitle] = useState('');
    const [ecoChanges, setEcoChanges] = useState({ name: '', price: '' });

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', { name: newProductName, price: Number(newProductPrice) });
            setIsCreateModalOpen(false);
            setNewProductName('');
            setNewProductPrice('');
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error creating product');
        }
    };

    const handleProposeECO = async (e) => {
        e.preventDefault();
        try {
            // Clean up empty changes
            const changes = {};
            if (ecoChanges.name && ecoChanges.name !== selectedProduct.name) changes.name = ecoChanges.name;
            if (ecoChanges.price && Number(ecoChanges.price) !== selectedProduct.price) changes.price = Number(ecoChanges.price);

            if (Object.keys(changes).length === 0) {
                return alert("You must propose at least one change.");
            }

            await api.post('/eco', {
                title: ecoTitle,
                type: 'product',
                productId: selectedProduct._id,
                changes
            });
            setIsModalOpen(false);
            alert('ECO Proposed Successfully! Go to the ECO Pipeline tab to track it.');
        } catch (err) {
            alert(err.response?.data?.msg || 'Error proposing ECO');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Master Products</h2>
                {user?.role === 'Engineer' && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
                    >
                        <Plus size={16} /> New Base Product
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product._id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-lg text-slate-900">{product.name}</h3>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium tracking-wide">v{product.version}</span>
                        </div>
                        <div className="text-slate-600 mb-6 flex justify-between">
                            <span>Price: <span className="font-medium text-slate-900">${product.price}</span></span>
                            <span className="text-xs uppercase bg-slate-100 px-2 py-1 rounded text-slate-500">{product.status}</span>
                        </div>

                        {(user?.role === 'Engineer' || user?.role === 'Admin') && (
                            <button
                                onClick={() => {
                                    setSelectedProduct(product);
                                    setEcoChanges({ name: product.name, price: product.price });
                                    setEcoTitle(`ECO: Update ${product.name}`);
                                    setIsModalOpen(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 border border-slate-300 text-slate-700 py-2 rounded hover:bg-slate-50 transition-colors font-medium"
                            >
                                <Replace size={16} /> Propose ECO
                            </button>
                        )}
                    </div>
                ))}
                {products.length === 0 && <div className="col-span-full py-10 text-center text-slate-500">No active products found.</div>}
            </div>

            {/* Create Product Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Create Baseline Product</h3>
                        <p className="text-sm text-slate-500 mb-6">This generates a new master product initialized at Version 1.</p>
                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Name</label>
                                <input required type="text" className="w-full border border-slate-300 p-2.5 rounded outline-none focus:ring-2 focus:ring-blue-500" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Price ($)</label>
                                <input required type="number" className="w-full border border-slate-300 p-2.5 rounded outline-none focus:ring-2 focus:ring-blue-500" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800">Create Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Propose ECO Modal */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-900">Propose Engineering Change</h3>
                            <p className="text-sm text-slate-500 mt-1">Target: <span className="font-semibold">{selectedProduct.name}</span> (v{selectedProduct.version})</p>
                        </div>

                        <form onSubmit={handleProposeECO} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">ECO Title</label>
                                <input required type="text" className="w-full border border-slate-300 p-2 rounded focus:ring-2 outline-none focus:ring-blue-500" value={ecoTitle} onChange={e => setEcoTitle(e.target.value)} placeholder="e.g. Price Adjustment Q3" />
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
                                <p className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Proposed Values</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-slate-500 uppercase">Product Name</label>
                                        <input type="text" className="w-full border border-slate-300 p-2 rounded text-sm focus:ring-2 outline-none focus:border-blue-500" value={ecoChanges.name} onChange={e => setEcoChanges({ ...ecoChanges, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-slate-500 uppercase">Price</label>
                                        <input type="number" className="w-full border border-slate-300 p-2 rounded text-sm focus:ring-2 outline-none focus:border-blue-500" value={ecoChanges.price} onChange={e => setEcoChanges({ ...ecoChanges, price: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-sm">Submit ECO into Pipeline</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
