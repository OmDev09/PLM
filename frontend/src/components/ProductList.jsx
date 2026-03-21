import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Replace, Package, X, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="p-8">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-3 tracking-tight">
                    <Package className="text-blue-500" /> Master Catalog
                </h2>
                {user?.role === 'Engineer' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        <Plus size={16} /> Mint Baseline
                    </motion.button>
                )}
            </div>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {products.map((product, idx) => (
                        <motion.div
                            layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.05 }}
                            key={product._id}
                            className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-800/40 transition-all group shadow-lg"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-bold text-xl text-slate-100 group-hover:text-blue-400 transition-colors">{product.name}</h3>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                    v{product.version}
                                </span>
                            </div>
                            <div className="text-slate-400 mb-8 flex justify-between items-center bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                <span className="text-xs uppercase tracking-widest font-bold">Value: <span className="text-slate-100 text-sm ml-1">${product.price}</span></span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {product.status}</span>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => { setSelectedProduct(product); setIsBomModalOpen(true); }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-900/20 hover:bg-emerald-800/40 border border-emerald-800/50 text-emerald-400 py-3 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest"
                                >
                                    <Cpu size={14} /> Node BoM
                                </motion.button>

                                {(user?.role === 'Engineer' || user?.role === 'Admin') && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedProduct(product); setEcoChanges({ name: product.name, price: product.price });
                                            setEcoTitle(`ECO: Update ${product.name}`); setVersionUpdate(true); setIsModalOpen(true);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-700 text-slate-300 py-3 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest group-hover:border-slate-600 group-hover:text-white"
                                    >
                                        <Replace size={14} className="text-blue-500" /> Mutate
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {products.length === 0 && <div className="col-span-full py-20 text-center text-slate-600 text-sm tracking-widest uppercase font-bold">No active assets in the database.</div>}
            </motion.div>

            {/* Product Mint Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-panel p-8 w-full max-w-md rounded-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Mint Baseline</h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreateProduct} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Asset Name</label>
                                    <input required type="text" className="w-full bg-slate-950/80 border border-slate-800 text-white p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Base Value ($)</label>
                                    <input required type="number" className="w-full bg-slate-950/80 border border-slate-800 text-white p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest mt-4">Generate Version 1</motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Product ECO Proposal Modal */}
            <AnimatePresence>
                {isModalOpen && selectedProduct && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-panel p-0 w-full max-w-lg rounded-2xl overflow-hidden border border-slate-700">
                            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Engineering Change Proposal</h3>
                                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Target Master: <span className="text-blue-400">{selectedProduct.name}</span> (v{selectedProduct.version})</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleProposeECO} className="p-6 space-y-6">
                                <div className="flex gap-4 items-center w-full">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">ECO Designation (Title)</label>
                                        <input required type="text" className="w-full bg-slate-950/80 border border-slate-800 text-white p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm" value={ecoTitle} onChange={e => setEcoTitle(e.target.value)} />
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">Require Version Bump</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1">If unchecked, changes apply in-place to v{selectedProduct.version}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={versionUpdate} onChange={e => setVersionUpdate(e.target.checked)} />
                                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5">
                                    <p className="text-[10px] font-bold text-blue-500 mb-4 uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Proposed Mutations</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Asset Name</label>
                                            <input type="text" className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm focus:border-blue-500 outline-none" value={ecoChanges.name} onChange={e => setEcoChanges({ ...ecoChanges, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Value ($)</label>
                                            <input type="number" className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm focus:border-blue-500 outline-none" value={ecoChanges.price} onChange={e => setEcoChanges({ ...ecoChanges, price: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(79,70,229,0.3)]">Inject to Pipeline</motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isBomModalOpen && selectedProduct && (
                    <BoMView product={selectedProduct} onClose={() => setIsBomModalOpen(false)} />
                )}
            </AnimatePresence>

        </div>
    );
};

export default ProductList;
