import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ECOList from '../components/ECOList';
import { LogOut, Grid } from 'lucide-react';

const ApproverDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#F0F0F4] font-sans text-slate-800">
            <header className="bg-[#875A7B] text-white flex items-center justify-between px-4 h-12 shadow z-10 relative">
                <div className="flex items-center gap-6 h-full">
                    <div className="flex items-center gap-2 cursor-pointer font-bold text-lg mr-4">
                        <Grid size={18} /> <span className="tracking-tight text-base">CCB Pipeline</span>
                    </div>
                    <nav className="flex h-full space-x-1 items-end pt-2">
                        <button className={`px-4 py-2 rounded-t-sm text-[13px] font-medium transition-colors bg-[#714B67] text-white`}>Awaiting Review</button>
                    </nav>
                </div>
                <div className="flex items-center gap-4 text-[13px] font-medium">
                    <span className="hidden md:flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">A</div>
                        <span>{user?.email}</span>
                    </span>
                    <button onClick={logout} className="hover:text-red-300 transition-colors ml-2"><LogOut size={16} /></button>
                </div>
            </header>

            <main className="w-full h-[calc(100vh-48px)] overflow-y-auto">
                <ECOList />
            </main>
        </div>
    );
};
export default ApproverDashboard;
