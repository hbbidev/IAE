"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpenCheck,
    GraduationCap,
    Wallet,
    CalendarDays,
    Settings,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean, setMobileOpen?: (open: boolean) => void }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    // Initialize from localStorage if available
    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved !== null) {
            setCollapsed(JSON.parse(saved));
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
        { name: 'Course Registration', icon: BookOpenCheck, href: '/courses' },
        { name: 'Grades/KHS', icon: GraduationCap, href: '/grades' },
        { name: 'Finance', icon: Wallet, href: '/finance' },
        { name: 'Schedule', icon: CalendarDays, href: '/schedule' },
        { name: 'Settings', icon: Settings, href: '/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/30 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setMobileOpen?.(false)}
                />
            )}

            <aside className={`fixed top-0 left-0 h-full lg:top-6 lg:bottom-6 lg:h-auto ${collapsed ? 'w-[5.5rem]' : 'w-64'} lg:left-6 bg-white dark:bg-slate-900/30 lg:rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] flex flex-col py-6 px-4 lg:p-6 z-50 transition-all duration-300 ease-in-out transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setMobileOpen?.(false)}
                    className="absolute top-6 right-4 lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                    <X size={20} />
                </button>

                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'} mb-10 mt-2 lg:mt-0 transition-all duration-300`}>
                    <div className="w-10 h-10 min-w-[2.5rem] rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                        S
                    </div>
                    {!collapsed && <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap overflow-hidden">PercikLab</span>}
                </div>

                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto overflow-x-hidden no-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-4'} py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium shadow-[inset_0px_0px_0px_1px_rgba(59,130,246,0.1)] dark:shadow-[inset_0px_0px_0px_1px_rgba(59,130,246,0.2)]'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                title={collapsed ? item.name : undefined}
                            >
                                <item.icon size={20} className={`min-w-[1.25rem] transition-colors duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className={`mt-auto pt-8 transition-all duration-300 ${collapsed ? 'px-0' : 'px-2'}`}>
                    {!collapsed ? (
                        <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-900/40 rounded-2xl ring-1 ring-indigo-100/50 dark:ring-indigo-800/30">
                            <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Need Help?</p>
                            <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 mb-3">Contact academic support</p>
                            <button className="w-full py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-xl shadow-sm hover:shadow-md dark:shadow-none hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-300">
                                Support Center
                            </button>
                        </div>
                    ) : (
                        <button className="w-full h-12 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors" title="Support Center">
                            <span className="font-bold text-lg">?</span>
                        </button>
                    )}
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={toggleCollapse}
                    className="absolute -right-3 top-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800/40 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-700 z-10 hover:scale-110 transition-all hidden lg:flex"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>
        </>
    );
}
