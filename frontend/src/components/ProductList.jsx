import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Package, X, Box, Settings } from 'lucide-react';
import BoMView from './BoMView';

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBomModalOpen, setIsBomModalOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');

    const [ecoTitle, setEcoTitle] = useState('');
    const [ecoChanges, setEcoChanges] = useState({ name: '', price: '' });
    const [versionUpdate, setVersionUpdate] = useState(true);

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

    const handleProposeECO = async (e) => {
        e.preventDefault();
        try {
            const changes = {};
            if (ecoChanges.name && ecoChanges.name !== selectedProduct.name) changes.name = ecoChanges.name;
            if (ecoChanges.price && Number(ecoChanges.price) !== selectedProduct.price) changes.price = Number(ecoChanges.price);

            if (Object.keys(changes).length === 0) return alert("You must propose at least one change.");

            await api.post('/eco', { title: ecoTitle, type: 'product', productId: selectedProduct._id, changes, versionUpdate });
            setIsModalOpen(false);
            alert('ECO Proposed Successfully! Go to the ECO Pipeline tab to track it.');
        } catch (err) { alert(err.response?.data?.msg || 'Error proposing ECO'); }
    };

    return (
        <div className="flex flex-col h-full bg-[#f9f9f9]">
            {/* Odoo Control Panel */}
            <div className="bg-white border-b border-gray-300 px-4 py-3 shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-normal text-gray-800">Products</h1>
                    {user?.role === 'Engineer' && (
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#00A09D] hover:bg-[#008784] text-white px-3 py-1.5 rounded-sm text-[13px] transition-colors font-medium">
                            New
                        </button>
                    )}
                </div>
                <div className="text-[13px] text-gray-500">
                    {products.length} Products
                </div>
            </div>

            <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white border border-gray-300 rounded shadow-sm hover:shadow transition-shadow flex flex-col">
                            <div className="p-4 border-b border-gray-100 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-[#00A09D] text-base leading-tight break-words pr-2">{product.name}</h3>
                                    <span className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">v{product.version}</span>
                                </div>
                                <div className="text-gray-600 text-sm mb-4">
                                    Price: ${product.price}
                                </div>
                                <div className="text-xs text-gray-400 uppercase">
                                    {product.status}
                                </div>
                            </div>
                            <div className="p-2 bg-gray-50 border-t border-gray-200 flex gap-2 shrink-0">
                                <button onClick={() => { setSelectedProduct(product); setIsBomModalOpen(true); }} className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-[12px] py-1 transition-colors flex items-center justify-center gap-1">
                                    <Box size={12} /> BoM
                                </button>
                                {(user?.role === 'Engineer' || user?.role === 'Admin') && (
                                    <button onClick={() => { setSelectedProduct(product); setEcoChanges({ name: product.name, price: product.price }); setEcoTitle(`ECO: Update ${product.name}`); setVersionUpdate(true); setIsModalOpen(true); }} className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-[12px] py-1 transition-colors flex items-center justify-center gap-1">
                                        <Settings size={12} /> ECO
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && <div className="col-span-full py-20 text-center text-gray-500 text-sm">No products found.</div>}
                </div>
            </div>

            {/* Product Mint Modal (Odoo Form Style) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-lg rounded shadow-xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 shrink-0">
                            <h3 className="text-lg font-normal text-gray-800">New Product</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateProduct} className="p-4 overflow-y-auto space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="text-[13px] font-bold text-gray-700 md:w-1/3">Product Name</label>
                                <input required type="text" className="flex-1 border-b border-gray-300 focus:border-[#00a09d] outline-none text-[13px] py-1 bg-transparent" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="text-[13px] font-bold text-gray-700 md:w-1/3">Sales Price</label>
                                <input required type="number" className="flex-1 border-b border-gray-300 focus:border-[#00a09d] outline-none text-[13px] py-1 bg-transparent" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
                            </div>
                        </form>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2 shrink-0">
                            <button onClick={handleCreateProduct} type="submit" className="bg-[#00a09d] text-white px-4 py-1.5 text-[13px] rounded-sm">Save</button>
                            <button onClick={() => setIsCreateModalOpen(false)} type="button" className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 text-[13px] rounded-sm">Discard</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product ECO Proposal Modal (Odoo Form Style) */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-2xl rounded shadow-xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 shrink-0">
                            <h3 className="text-lg font-normal text-gray-800">Engineering Change Request</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleProposeECO} className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <h1 className="text-2xl text-gray-900 border-b border-gray-200 pb-2 mb-4 w-full">
                                    <input required type="text" placeholder="ECO Title" className="w-full outline-none placeholder-gray-300" value={ecoTitle} onChange={e => setEcoTitle(e.target.value)} />
                                </h1>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-[13px] font-bold text-gray-700 w-1/3">Apply On</label>
                                    <div className="text-[13px] text-gray-800 border-b border-gray-200 pb-1 flex-1 font-semibold">{selectedProduct.name} v{selectedProduct.version} (Product)</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[13px] font-bold text-gray-700 w-1/3 text-right">Generate Version</label>
                                    <input type="checkbox" className="w-4 h-4 text-[#00A09D]" checked={versionUpdate} onChange={e => setVersionUpdate(e.target.checked)} />
                                </div>
                            </div>

                            {/* Notebook Tabs */}
                            <div className="mt-8">
                                <div className="border-b border-gray-200 flex text-[13px]">
                                    <div className="px-4 py-2 border-b-2 border-[#00A09D] text-[#00A09D] font-bold cursor-pointer">Product Changes</div>
                                </div>
                                <div className="pt-4 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <label className="text-[13px] font-bold text-gray-700 w-1/4">Name</label>
                                        <input type="text" className="flex-1 border-b border-gray-300 focus:border-[#00a09d] outline-none text-[13px] py-1 bg-transparent" value={ecoChanges.name} onChange={e => setEcoChanges({ ...ecoChanges, name: e.target.value })} />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-[13px] font-bold text-gray-700 w-1/4">Price</label>
                                        <input type="number" className="flex-1 border-b border-gray-300 focus:border-[#00a09d] outline-none text-[13px] py-1 bg-transparent" value={ecoChanges.price} onChange={e => setEcoChanges({ ...ecoChanges, price: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2 shrink-0">
                            <button onClick={handleProposeECO} type="submit" className="bg-[#00a09d] hover:bg-[#008784] text-white px-4 py-1.5 text-[13px] rounded-sm">Submit ECO</button>
                            <button onClick={() => setIsModalOpen(false)} type="button" className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 text-[13px] rounded-sm">Cancel</button>
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
