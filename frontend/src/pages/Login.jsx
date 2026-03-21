import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Key, ArrowRight, Loader2, Layers } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

/* ─── PLM Lifecycle Animated Diagram ───────────────────── */
const PLM_NODES = [
    { id: 0, label: 'Design', angle: -90 },
    { id: 1, label: 'Prototype', angle: -18 },
    { id: 2, label: 'Review', angle: 54 },
    { id: 3, label: 'Manufacture', angle: 126 },
    { id: 4, label: 'Release', angle: 198 },
];
const R = 150; // orbit radius (svg units)
const CX = 210;
const CY = 210;

const toXY = (angleDeg) => ({
    x: CX + R * Math.cos((angleDeg * Math.PI) / 180),
    y: CY + R * Math.sin((angleDeg * Math.PI) / 180),
});

const TRAVEL_MS = 1500; // dot travel time
const REST_MS = 700;  // dot rests at node
const VANISH_MS = 500;  // line fades after arrival

const LifecycleDiagram = () => {
    // phase: 'resting' → 'traveling' → 'vanishing' → back to 'resting' at next node
    const [current, setCurrent] = useState(0);
    const [phase, setPhase] = useState('resting');

    useEffect(() => {
        let t;
        const startRest = (node) => {
            setCurrent(node);
            setPhase('resting');
            t = setTimeout(() => {
                setPhase('traveling');
                t = setTimeout(() => {
                    setPhase('vanishing');
                    t = setTimeout(() => {
                        startRest((node + 1) % PLM_NODES.length);
                    }, VANISH_MS);
                }, TRAVEL_MS);
            }, REST_MS);
        };
        startRest(0);
        return () => clearTimeout(t);
    }, []);

    const next = (current + 1) % PLM_NODES.length;

    // dot target: move toward next during traveling & vanishing; snap back to current during resting
    const dotTargetXY = (phase === 'traveling' || phase === 'vanishing')
        ? toXY(PLM_NODES[next].angle)
        : toXY(PLM_NODES[current].angle);

    // Line endpoints for the active segment
    const lineFrom = toXY(PLM_NODES[current].angle);
    const lineTo = toXY(PLM_NODES[next].angle);

    return (
        <svg viewBox="0 0 420 420" className="w-full max-w-[380px] drop-shadow-xl">
            {/* static dim orbit ring */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(45,212,191,0.10)" strokeWidth="1" strokeDasharray="4 7" />

            {/* static dim baseline segments — always present at low opacity */}
            {PLM_NODES.map((n, i) => {
                const a = toXY(n.angle);
                const b = toXY(PLM_NODES[(i + 1) % PLM_NODES.length].angle);
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(45,212,191,0.10)" strokeWidth="0.7" />;
            })}

            {/* === ACTIVE SEGMENT: draws in then fades out === */}
            {/* key={current} forces a fresh mount each cycle so pathLength always starts at 0 */}
            {(phase === 'traveling' || phase === 'vanishing') && (
                <motion.line
                    key={`seg-${current}`}
                    x1={lineFrom.x} y1={lineFrom.y}
                    x2={lineTo.x} y2={lineTo.y}
                    stroke="#2dd4bf"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 1 }}
                    animate={
                        phase === 'traveling'
                            ? { pathLength: 1, opacity: 1 }
                            : { pathLength: 1, opacity: 0 }   // vanishing: line fades out
                    }
                    transition={
                        phase === 'traveling'
                            ? { pathLength: { duration: TRAVEL_MS / 1000, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0 } }
                            : { opacity: { duration: VANISH_MS / 1000, ease: 'easeIn' }, pathLength: { duration: 0 } }
                    }
                    style={{ filter: 'drop-shadow(0 0 4px rgba(45,212,191,0.7))' }}
                />
            )}

            {/* center hub */}
            <motion.circle cx={CX} cy={CY} r="22"
                fill="rgba(11,17,35,0.95)" stroke="#2dd4bf" strokeWidth="1.5"
                animate={{ r: [22, 24, 22] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <text x={CX} y={CY - 5} textAnchor="middle" fill="#2dd4bf" fontSize="7" fontWeight="700" fontFamily="monospace" letterSpacing="1">PLM</text>
            <text x={CX} y={CY + 7} textAnchor="middle" fill="rgba(45,212,191,0.55)" fontSize="5.5" fontFamily="monospace">NEXUS</text>

            {/* === NODES === */}
            {PLM_NODES.map((n, i) => {
                const { x, y } = toXY(n.angle);
                const isResting = i === current && phase === 'resting';
                const isArriving = i === next && phase === 'vanishing'; // dot just arrived here
                return (
                    <g key={n.id}>
                        {/* pulse ring — only while resting */}
                        {isResting && (
                            <motion.circle cx={x} cy={y}
                                fill="none" stroke="#2dd4bf" strokeWidth="1"
                                initial={{ r: 20, opacity: 0.8 }}
                                animate={{ r: 36, opacity: 0 }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                            />
                        )}
                        <motion.circle cx={x} cy={y} r="20"
                            fill={isResting ? '#0d9488' : isArriving ? 'rgba(13,148,136,0.45)' : 'rgba(10,16,38,0.88)'}
                            stroke={isResting || isArriving ? '#2dd4bf' : 'rgba(45,212,191,0.2)'}
                            strokeWidth="1.5"
                            animate={{ scale: isResting ? 1.1 : 1 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                        <text x={x} y={y + 3} textAnchor="middle"
                            fill={isResting ? '#fff' : isArriving ? 'rgba(255,255,255,0.65)' : 'rgba(100,116,139,0.7)'}
                            fontSize="7.5" fontWeight="700" fontFamily="system-ui"
                        >
                            {n.label}
                        </text>
                    </g>
                );
            })}

            {/* === DOT === travels during 'traveling', stays at arrival during 'vanishing', snaps on 'resting' */}
            <motion.circle
                r="5"
                fill="#2dd4bf"
                animate={{ cx: dotTargetXY.x, cy: dotTargetXY.y }}
                transition={
                    phase === 'traveling'
                        ? { duration: TRAVEL_MS / 1000, ease: [0.4, 0, 0.2, 1] }
                        : { duration: 0 }
                }
                style={{ filter: 'drop-shadow(0 0 8px rgba(45,212,191,0.9))' }}
            />
        </svg>
    );
};

/* ─── Input field ────────────────────────────────────────── */
const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
                {...props}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
            />
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════ */
const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isDesktop, setIsDesktop] = useState(true);
    const [formData, setFormData] = useState({ emailId: '', loginId: '', password: '', confirmPassword: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setFormData({ emailId: '', loginId: '', password: '', confirmPassword: '' });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (isLogin) {
                const res = await axios.post('http://localhost:5000/api/auth/login', { email: formData.emailId, password: formData.password });
                login(res.data);
                navigate('/dashboard');
            } else {
                if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); setIsLoading(false); return; }
                const res = await axios.post('http://localhost:5000/api/auth/register', { email: formData.emailId, loginId: formData.loginId, password: formData.password });
                login(res.data);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const slide = { duration: 0.75, ease: [0.16, 1, 0.3, 1] };

    return (
        <div className="relative h-screen w-full overflow-hidden flex font-sans bg-slate-50 dark:bg-[#070d14] transition-colors duration-300">

            {/* subtle blueprint dot grid */}
            <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
                style={{ backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)', backgroundSize: '28px 28px' }}
            />

            {/* Theme toggle */}
            <div className="absolute top-5 right-5 z-50"><ThemeToggle /></div>

            <div className="relative w-full h-full overflow-hidden flex">

                {/* ══════ FORM PANEL ══════ */}
                <motion.div
                    layout
                    initial={false}
                    animate={{ left: isDesktop ? (isLogin ? '50%' : '0%') : '0%' }}
                    transition={slide}
                    className="absolute top-0 w-full lg:w-1/2 h-full z-10 flex flex-col justify-center px-8 sm:px-16 xl:px-20 overflow-y-auto
                               bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur-xl shadow-2xl dark:shadow-black/60
                               border-r border-slate-200/60 dark:border-white/5 transition-colors duration-300"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-10">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-600/30">
                            <Layers className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-base font-bold text-slate-800 dark:text-white tracking-widest uppercase">Nexus PLM</span>
                    </div>

                    <div className="w-full max-w-[380px] mx-auto">

                        {/* Title */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'lt' : 'st'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="mb-8"
                            >
                                <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em] mb-2">
                                    {isLogin ? '— Workspace Access' : '— New Registration'}
                                </p>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1.5">
                                    {isLogin ? 'Access your PLM workspace securely.' : 'Set up your profile to start managing lifecycles.'}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="mb-5 overflow-hidden"
                                >
                                    <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400 text-sm font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.div
                                    key={isLogin ? 'lf' : 'sf'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    className="space-y-4"
                                >
                                    <InputField label="Work Email" icon={Mail} type="email" name="emailId" value={formData.emailId} onChange={handleChange} placeholder="you@company.com" required />
                                    {!isLogin && <InputField label="Username" icon={User} type="text" name="loginId" value={formData.loginId} onChange={handleChange} placeholder="Unique identifier" required />}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Password</label>
                                            {isLogin && <button type="button" className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline transition-all">Forgot?</button>}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                    {!isLogin && <InputField label="Confirm Password" icon={Key} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />}
                                </motion.div>
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(13,148,136,0.35)' }}
                                whileTap={{ y: 0, scale: 0.98 }}
                                className="mt-7 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold shadow-lg shadow-teal-600/25 transition-colors duration-200 disabled:opacity-60 group"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                                    {isLogin ? 'Sign In to Workspace' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                                </>}
                            </motion.button>
                        </form>

                        {/* Mobile toggle */}
                        <div className="mt-7 text-center lg:hidden">
                            <span className="text-sm text-slate-500 dark:text-slate-500">{isLogin ? "Don't have an account? " : "Already registered? "}</span>
                            <button type="button" onClick={toggleMode} className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">{isLogin ? 'Sign up' : 'Sign in'}</button>
                        </div>
                    </div>
                </motion.div>

                {/* ══════ OVERLAY / BRANDING PANEL ══════ */}
                <motion.div
                    initial={false}
                    animate={{ left: isDesktop ? (isLogin ? '0%' : '50%') : '0%' }}
                    transition={slide}
                    className="hidden lg:flex absolute top-0 w-1/2 h-full z-20 overflow-hidden bg-[#0b1f2e] shadow-2xl"
                >
                    {/* deep teal glow at top */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(13,148,136,0.25),transparent)]" />
                    {/* bottom navy gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050d18]/80" />

                    {/* blueprint dot grid */}
                    <div className="absolute inset-0 opacity-[0.07]"
                        style={{ backgroundImage: 'radial-gradient(circle, #2dd4bf 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />

                    {/* animated thin border on form side */}
                    <motion.div
                        className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-teal-500/40 to-transparent"
                        animate={{ opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* content */}
                    <div className="relative z-10 w-full h-full flex flex-col justify-between py-12 px-12">

                        {/* logo */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                                <Layers className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold text-white tracking-[0.2em] uppercase">Nexus PLM</span>
                        </div>

                        {/* center */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'lo' : 'so'}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="flex flex-col items-center text-center gap-8"
                            >
                                <LifecycleDiagram />

                                <div className="max-w-xs space-y-3">
                                    <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                                        {isLogin ? 'Product Lifecycle\nManagement' : 'Join the Engineering\nWorkspace'}
                                    </h2>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {isLogin
                                            ? 'Manage ECOs, Bills of Materials, and approval workflows in a single controlled platform.'
                                            : 'Collaborate, propose changes, and track every revision across your product lifecycle.'}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* bottom CTA */}
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-xs text-slate-500 font-medium">
                                {isLogin ? "Don't have an account?" : 'Already registered?'}
                            </p>
                            <motion.button
                                onClick={toggleMode}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-8 py-2.5 rounded-lg border border-teal-500/30 hover:border-teal-400/60 hover:bg-teal-500/10 text-teal-300 text-sm font-semibold transition-all duration-200 tracking-wide"
                            >
                                {isLogin ? 'Create Account →' : 'Sign In →'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
