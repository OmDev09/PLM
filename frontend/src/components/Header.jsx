import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Menu } from 'lucide-react';

export const Header = () => {
    const { logout } = useAuth();

    return (
        <header className="h-16 bg-[#000] border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <button className="lg:hidden p-2 text-zinc-400 hover:bg-zinc-900 rounded-md transition-colors">
                    <Menu className="w-5 h-5" />
                </button>

                {/* Advanced Search Bar */}
                <div className="hidden sm:flex relative max-w-sm w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search infrastructure..."
                        className="w-full pl-9 pr-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-[#000] transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <kbd className="hidden sm:inline-block border border-zinc-700 rounded px-1.5 text-[10px] font-mono text-zinc-500 shrink-0">⌘K</kbd>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-5">
                <button className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-black"></span>
                </button>
                <div className="h-5 w-px bg-zinc-800 mx-1 hidden sm:block"></div>
                <button
                    onClick={logout}
                    className="text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:block tracking-wide uppercase"
                >
                    Sign out
                </button>
            </div>
        </header>
    );
};
