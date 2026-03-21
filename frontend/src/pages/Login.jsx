import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred during login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-md w-full relative z-10 px-4"
            >
                <div className="glass-panel rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-8">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight"
                        >
                            Nexus PLM
                        </motion.h2>
                        <p className="text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">Secure Hardware Core</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-5 border border-red-500/20 flex items-center gap-2 font-medium">
                            <span className="shrink-0 text-lg">⚠️</span> {error}
                        </motion.div>
                    )}



                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Access Credentials</label>
                            <input
                                type="email" required
                                className="w-full px-5 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-700"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="Secure email link"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Encryption Key</label>
                            <input
                                type="password" required
                                className="w-full px-5 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-700 font-mono"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="******"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] mt-8 uppercase tracking-widest text-xs"
                        >
                            Initialize Uplink
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
