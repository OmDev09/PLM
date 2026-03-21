import React, { useState } from 'react';
import { Input, Select, Checkbox, Button } from './ui';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ECOForm = ({ onCancel, onSave, onStart }) => {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        type: 'Product',
        product: '',
        bom: '',
        user: user?.email || 'admin@plm.io',
        effectiveDate: '',
        versionUpdate: false
    });

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAction = (actionType) => {
        if (!formData.title) {
            alert("Title is required!");
            return;
        }

        const data = {
            ...formData,
            stage: actionType === 'start' ? 'New' : 'Draft'
        };

        if (actionType === 'start') {
            onStart('New', data);
        } else {
            onSave(data);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
            <div className="flex flex-wrap items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-5">
                    <button
                        onClick={onCancel}
                        className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase">Initialize ECO</h2>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <Button variant="secondary" icon={Save} onClick={() => handleAction('save')}>
                        Save Draft
                    </Button>
                    <Button variant="primary" icon={Play} onClick={() => handleAction('start')}>
                        Start Workflow
                    </Button>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Input
                            label="ECO TITLE *"
                            id="title"
                            placeholder="e.g., Update Motor Housing Rev B"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Select
                        label="ECO TYPE"
                        id="type"
                        value={formData.type}
                        onChange={handleChange}
                        options={[
                            { value: 'Product', label: 'Product' },
                            { value: 'Bill of Materials', label: 'Bill of Materials' }
                        ]}
                    />

                    <Select
                        label="TARGET PRODUCT"
                        id="product"
                        value={formData.product}
                        onChange={handleChange}
                        options={[
                            { value: 'PRD-1001', label: 'Smart Motor Housing' },
                            { value: 'PRD-1002', label: 'Lithium Battery Pack' },
                            { value: 'PRD-1003', label: 'Sensor Array Module' }
                        ]}
                    />

                    <AnimatePresence>
                        {formData.type === 'Bill of Materials' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="sm:col-span-2 overflow-hidden"
                            >
                                <Select
                                    label="BILL OF MATERIALS"
                                    id="bom"
                                    value={formData.bom}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'BOM-2001', label: 'BOM-2001 (Rev A)' },
                                        { value: 'BOM-2002', label: 'BOM-2002 (Rev C)' }
                                    ]}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Input
                        label="ASSIGNED ARCHITECT"
                        id="user"
                        value={formData.user}
                        onChange={handleChange}
                        disabled
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-indigo-300/50 cursor-not-allowed font-medium shadow-inner text-sm"
                    />

                    <div className="space-y-1.5 w-full">
                        <label htmlFor="effectiveDate" className="text-sm font-semibold text-indigo-100 uppercase tracking-wide">Effective Date</label>
                        <input
                            type="date"
                            id="effectiveDate"
                            value={formData.effectiveDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 focus:bg-white/10 transition-all font-medium shadow-inner [color-scheme:dark]"
                        />
                    </div>

                    <div className="sm:col-span-2 pt-4 border-t border-white/10">
                        <Checkbox
                            label="Force global version hierarchy update across down-stream assemblies"
                            id="versionUpdate"
                            checked={formData.versionUpdate}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
