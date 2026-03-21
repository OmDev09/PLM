import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 dark:hover:text-amber-400 transition-colors shadow-sm focus:outline-none relative overflow-hidden shrink-0 border border-slate-200 dark:border-white/10"
            aria-label="Toggle Theme"
        >
            <AnimatePresence initial={false}>
                {isDarkMode ? (
                    <motion.div
                        key="moon"
                        initial={{ y: -15, opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ y: 15, opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="absolute"
                    >
                        <Moon size={20} className="fill-slate-400" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ y: -15, opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ y: 15, opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="absolute"
                    >
                        <Sun size={20} className="fill-amber-400 text-amber-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
};

export default ThemeToggle;
