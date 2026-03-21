import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Key, ArrowRight, Loader2, Layers, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isDesktop, setIsDesktop] = useState(true);
    const [formData, setFormData] = useState({
        emailId: '',
        loginId: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setFormData({ emailId: '', loginId: '', password: '', confirmPassword: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                const res = await axios.post('http://localhost:5000/api/auth/login', {
                    email: formData.emailId,
                    password: formData.password
                });
                login(res.data);
                navigate('/dashboard');
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError("Passwords do not match");
                    setIsLoading(false);
                    return;
                }
                const res = await axios.post('http://localhost:5000/api/auth/register', {
                    email: formData.emailId,
                    loginId: formData.loginId,
                    password: formData.password
                });
                login(res.data);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Ultra-smooth bezier curve (similar to Apple's / Stripe's transitions)
    const slideTransition = {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
    };

    return (
        <div className="relative h-screen w-full bg-white overflow-hidden flex font-sans">

            {/* Main Center Card */}
            <div className="relative w-full h-full bg-white overflow-hidden flex flex-col lg:flex-row">

                {/* 
                    FORM PANEL
                */}
                <motion.div
                    layout
                    initial={false}
                    animate={{
                        left: isDesktop ? (isLogin ? '50%' : '0%') : '0%',
                    }}
                    transition={slideTransition}
                    className="absolute top-0 w-full lg:w-1/2 h-full bg-white z-10 flex flex-col justify-center px-6 sm:px-16 xl:px-24 overflow-y-auto"
                >
                    <div className="w-full max-w-[400px] mx-auto py-12">
                        {/* Mobile Header */}
                        <div className="lg:hidden flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Layers className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-800 tracking-tight">PLM</span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login-title' : 'signup-title'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="mb-10"
                            >
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </h1>
                                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                    {isLogin
                                        ? 'Enter your credentials to access your workspace securely.'
                                        : 'Set up your profile to start managing lifecycle processes.'}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 overflow-hidden"
                                >
                                    <div className="p-3 bg-red-50 border border-red-100/60 text-red-600 text-sm font-medium rounded-lg flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                                        <span>{error}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.div
                                    key={isLogin ? 'login-form' : 'signup-form'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="space-y-4"
                                >
                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Work Email</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="email"
                                                name="emailId"
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-shadow text-sm"
                                                value={formData.emailId}
                                                onChange={handleChange}
                                                placeholder="name@company.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Login ID (Signup Only) */}
                                    {!isLogin && (
                                        <div className="space-y-1.5 pt-1">
                                            <label className="text-sm font-medium text-slate-700">Username</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="loginId"
                                                    required
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-shadow text-sm"
                                                    value={formData.loginId}
                                                    onChange={handleChange}
                                                    placeholder="Unique identifier"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Password */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-700">Password</label>
                                            {isLogin && (
                                                <button type="button" className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700">
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-shadow text-sm"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    {/* Confirm Password (Signup Only) */}
                                    {!isLogin && (
                                        <div className="space-y-1.5 pt-1">
                                            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <Key className="h-5 w-5" />
                                                </div>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    required
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-shadow text-sm"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center py-2.5 px-4 mt-8 bg-black hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2 disabled:opacity-70 group"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Mobile Toggle */}
                        <div className="mt-8 text-center lg:hidden">
                            <span className="text-slate-500 text-sm">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                            </span>
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="ml-1.5 text-sm font-medium text-indigo-600"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* 
                    OVERLAY PANEL 
                */}
                <motion.div
                    initial={false}
                    animate={{
                        left: isDesktop ? (isLogin ? '0%' : '50%') : '0%',
                    }}
                    transition={slideTransition}
                    className="hidden lg:flex absolute top-0 w-1/2 h-full z-20 bg-indigo-700 overflow-hidden shadow-2xl"
                >
                    {/* Deep aesthetic gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-indigo-700 to-indigo-900 opacity-90" />

                    {/* Minimal decorative glows */}
                    <motion.div
                        animate={{
                            x: isLogin ? [0, -10, 0] : [0, 10, 0],
                            opacity: [0.3, 0.4, 0.3]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            x: isLogin ? [0, 10, 0] : [0, -10, 0],
                            opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-indigo-400 rounded-full mix-blend-screen blur-[120px]"
                    />

                    {/* Content Container */}
                    <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-16">

                        <div className="absolute top-12 left-12 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-200" />
                            <span className="text-sm font-bold tracking-widest text-indigo-100 uppercase">PLM</span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login-overlay' : 'signup-overlay'}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex flex-col items-center text-center max-w-sm"
                            >
                                <div className="mb-8 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                    <ShieldCheck className="w-8 h-8 text-indigo-200" />
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                                    {isLogin ? 'New to PLM?' : 'Welcome Back'}
                                </h2>

                                <p className="text-indigo-100/90 text-sm leading-relaxed mb-10">
                                    {isLogin
                                        ? 'Register now to securely access the comprehensive platform and manage your entire product lifecycle seamlessly.'
                                        : 'If you already have a registered account, proceed to sign in and resume your workspace.'}
                                </p>

                                <button
                                    onClick={toggleMode}
                                    className="px-8 py-2.5 rounded-lg border border-white/20 hover:border-white/50 hover:bg-white/10 text-white text-sm font-medium transition-all duration-300"
                                >
                                    {isLogin ? 'Create Account' : 'Sign In'}
                                </button>
                            </motion.div>
                        </AnimatePresence>

                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
