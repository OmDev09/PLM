import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Button = ({
    children,
    variant = 'primary',
    isLoading,
    icon: Icon,
    className = "",
    ...props
}) => {
    const baseStyle = "flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-900 disabled:opacity-60 disabled:cursor-not-allowed";

    // Adapted variations for the dark glass theme
    const variants = {
        primary: "bg-white text-indigo-900 hover:bg-indigo-50 shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:ring-white",
        secondary: "bg-white/10 text-white border border-white/20 hover:border-white/40 hover:bg-white/20 focus:ring-white/50 shadow-sm",
        danger: "bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/50 focus:ring-red-500",
        ghost: "bg-transparent text-indigo-100 hover:bg-white/10 hover:text-white"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </motion.button>
    );
};

export const Input = ({ label, id, ...props }) => (
    <div className="space-y-1.5 w-full">
        {label && <label htmlFor={id} className="text-sm font-semibold text-indigo-100">{label}</label>}
        <input
            id={id}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 focus:bg-white/10 transition-all font-medium shadow-inner"
            {...props}
        />
    </div>
);

export const Select = ({ label, id, options, ...props }) => (
    <div className="space-y-1.5 w-full">
        {label && <label htmlFor={id} className="text-sm font-semibold text-indigo-100">{label}</label>}
        <select
            id={id}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 focus:bg-white/10 transition-all font-medium shadow-inner appearance-none custom-select-bg"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.6)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25em 1.25em'
            }}
            {...props}
        >
            <option value="" disabled className="text-slate-900">Select {label?.toLowerCase()}</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value} className="text-slate-900">{opt.label}</option>
            ))}
        </select>
    </div>
);

export const Checkbox = ({ label, id, ...props }) => (
    <div className="flex items-center gap-3">
        <div className="relative flex items-center">
            <input
                type="checkbox"
                id={id}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-400/30 transition-all cursor-pointer accent-indigo-500"
                {...props}
            />
        </div>
        {label && <label htmlFor={id} className="text-sm font-medium text-indigo-100 cursor-pointer select-none">{label}</label>}
    </div>
);
