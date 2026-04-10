"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    GraduationCap,
    Calendar,
    Settings,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean, setMobileOpen?: (open: boolean) => void }) {
    const { data: session, status } = useSession();
    const role = (session?.user as any)?.role || 'STUDENT';
    const isLoading = status === 'loading';
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

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
        { name: 'Dasbor', icon: LayoutDashboard, href: '/', roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
        { name: 'Kursus Saya', icon: BookOpen, href: '/courses', roles: ['STUDENT'] },
        { name: 'Kursus Saya', icon: BookOpen, href: '/teacher/courses', roles: ['TEACHER'] },
        { name: 'Manajemen Kursus', icon: BookOpen, href: '/admin/courses', roles: ['ADMIN'] },
        { name: 'Tugas', icon: ClipboardList, href: '/assignments', roles: ['STUDENT', 'TEACHER'] },
        { name: 'Nilai', icon: GraduationCap, href: '/grades', roles: ['STUDENT', 'TEACHER'] },
        { name: 'Jadwal', icon: Calendar, href: '/schedule', roles: ['STUDENT', 'TEACHER'] },
        { name: 'Hak Akses', icon: Settings, href: '/admin/users', roles: ['ADMIN'] },
        { name: 'Pengaturan', icon: Settings, href: '/settings', roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
    ].filter(item => item.roles.includes(role));

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-md transition-opacity"
                    onClick={() => setMobileOpen?.(false)}
                />
            )}

            <aside className={`fixed top-0 left-0 h-full lg:top-6 lg:bottom-6 lg:h-auto ${collapsed ? 'w-[5.5rem]' : 'w-64'} lg:left-6 glass-panel lg:rounded-3xl flex flex-col py-6 px-4 lg:p-6 z-50 transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setMobileOpen?.(false)}
                    className="absolute top-6 right-4 lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl"
                >
                    <X size={20} />
                </button>

                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'} mb-10 mt-2 lg:mt-0 transition-all duration-300`}>
                    <div className="w-10 h-10 min-w-[2.5rem] rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-sm shrink-0">
                        <Image src="/logo.png" alt="Perciklab Logo" width={40} height={40} className="object-contain" />
                    </div>
                    {!collapsed && <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap overflow-hidden">Perciklab</span>}
                </div>

                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto overflow-x-hidden no-scrollbar">
                    {isLoading ? (
                        <div className="px-4 space-y-3 mt-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-[52px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-4'} py-3.5 rounded-2xl transition-all duration-300 group hover-lift ${isActive
                                        ? 'bg-white/80 dark:bg-white/10 text-blue-600 dark:text-blue-400 font-medium shadow-[0_8px_16px_rgba(59,130,246,0.1)] dark:shadow-[0_8px_16px_rgba(59,130,246,0.2)] ring-1 ring-white/50 dark:ring-white/10'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                    title={collapsed ? item.name : undefined}
                                >
                                    <item.icon size={20} className={`min-w-[1.25rem] transition-colors duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                    {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
                                </Link>
                            )
                        })
                    )}
                </nav>



                {/* Collapse Toggle */}
                <button
                    onClick={toggleCollapse}
                    className="absolute -right-3 top-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-md border border-slate-100 dark:border-slate-700 z-10 hover:scale-110 transition-all hidden lg:flex hover-lift"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>
        </>
    );
}
