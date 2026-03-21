import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList';
import ECOList from '../components/ECOList';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navbar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-slate-900">PLM Control Center</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                            {user?.role}
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-sm text-slate-600">{user?.email}</div>
                        <button
                            onClick={logout}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-8">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`pb-4 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'products'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Active Products
                    </button>
                    <button
                        onClick={() => setActiveTab('ecos')}
                        className={`pb-4 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'ecos'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        ECO Pipeline
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
                    {activeTab === 'products' && <ProductList />}
                    {activeTab === 'ecos' && <ECOList />}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
