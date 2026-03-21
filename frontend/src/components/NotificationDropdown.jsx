import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    const markAllAsRead = async (e) => {
        e.stopPropagation();
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) { console.error(err); }
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return `${Math.floor(diffHrs / 24)}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 min-w-[16px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)] border border-white dark:border-slate-800 px-1 transform translate-x-1/4 -translate-y-1/4">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-xs font-semibold text-blue-600 dark:text-amber-400 hover:text-blue-800 dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                                    <Check size={14} /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                                    No new notifications.
                                </div>
                            ) : (
                                <div className="divide-y dark:divide-white/5">
                                    {notifications.map(n => (
                                        <div
                                            key={n._id}
                                            className={`p-4 transition-colors flex gap-3 ${n.isRead ? 'bg-white dark:bg-transparent opacity-70' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                                        >
                                            <div className="mt-1 shrink-0">
                                                {n.isRead
                                                    ? <Circle size={10} className="text-slate-300 dark:text-slate-600" />
                                                    : <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-snug ${n.isRead ? 'text-slate-600 dark:text-slate-400 font-medium' : 'text-slate-900 dark:text-white font-semibold'}`}>
                                                    {n.message}
                                                </p>
                                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1.5 block">
                                                    {formatTime(n.createdAt)}
                                                </span>
                                            </div>
                                            {!n.isRead && (
                                                <button
                                                    onClick={(e) => markAsRead(n._id, e)}
                                                    className="shrink-0 text-slate-400 hover:text-blue-500 dark:hover:text-amber-400 self-center p-1 rounded transition-colors"
                                                    title="Mark as Read"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
