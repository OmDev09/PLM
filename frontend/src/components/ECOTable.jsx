import React from 'react';
import { Inbox, FileSignature } from 'lucide-react';
import { motion } from 'framer-motion';

export const ECOTable = ({ ecos = [] }) => {
    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white/5 border-b border-white/10 backdrop-blur-md">
                        <tr>
                            <th className="px-6 py-5 font-bold text-indigo-100 uppercase tracking-widest text-xs">Name</th>
                            <th className="px-6 py-5 font-bold text-indigo-100 uppercase tracking-widest text-xs">ECO Type</th>
                            <th className="px-6 py-5 font-bold text-indigo-100 uppercase tracking-widest text-xs">Product</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ecos.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-indigo-200/50">
                                        <Inbox className="w-14 h-14 mb-4 opacity-50" />
                                        <p className="text-lg font-bold text-white mb-1 tracking-tight">No ECOs active</p>
                                        <p className="text-sm font-medium">Initiate your first Engineering Change Order to populate this workspace.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            ecos.map((eco, idx) => (
                                <motion.tr
                                    key={eco.id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05, ease: "easeOut" }}
                                    className="hover:bg-white/10 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-5 text-white font-bold flex items-center gap-4 tracking-wide">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/40 transition-colors">
                                            <FileSignature className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" />
                                        </div>
                                        {eco.name}
                                    </td>
                                    <td className="px-6 py-5 text-indigo-100/80">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wide shadow-inner
                                            ${eco.type === 'Product'
                                                ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                                                : 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/30'}`}>
                                            {eco.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-indigo-100/90 font-medium">{eco.product}</td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
