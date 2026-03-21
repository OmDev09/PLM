import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    FileSignature,
    Database,
    Box,
    PackageSearch,
    BarChart3,
    Settings,
    GitCommitHorizontal,
    Layers,
    Hexagon
} from 'lucide-react';
import { motion } from 'framer-motion';

const getMenuIcon = (name) => {
    switch (name) {
        case 'Engineering Changes': return FileSignature;
        case 'Master Data': return Database;
        case 'Bills of Materials': return Box;
        case 'Products': return PackageSearch;
        case 'Reporting': return BarChart3;
        case 'Settings': return Settings;
        case 'ECO Stages': return GitCommitHorizontal;
        default: return Box;
    }
};

const menuItems = [
    'Master Data',
    'Engineering Changes',
    'Reporting',
    'Settings'
];

export const Sidebar = ({ activeItem, setActiveItem }) => {
    const { user } = useAuth();

    const emailStr = user?.email || 'admin@plm.io';
    const roleStr = user?.role || 'System Admin';
    const initials = emailStr.substring(0, 2).toUpperCase();

    return (
        <div className="w-64 h-screen flex-shrink-0 bg-[#000] border-r border-zinc-800 flex flex-col text-zinc-300 font-sans relative z-30">
            <div className="p-5 flex items-center gap-3 mb-2 shrink-0">
                <div className="w-8 h-8 rounded-md bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <Hexagon className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-sm font-bold text-zinc-100 tracking-tight">Nexus PLM</span>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 relative z-10 custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = getMenuIcon(item);
                    const isActive = activeItem === item;

                    return (
                        <button
                            key={item}
                            onClick={() => setActiveItem(item)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium
                                ${isActive
                                    ? 'bg-zinc-900 text-zinc-100'
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                            <span className="truncate">{item}</span>
                        </button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-zinc-800 shrink-0 bg-[#000]">
                <div className="flex items-center gap-3 rounded-md hover:bg-zinc-900 p-2 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 tracking-tight truncate capitalize">{roleStr}</p>
                        <p className="text-[10px] text-zinc-500 tracking-wide truncate">{emailStr}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
