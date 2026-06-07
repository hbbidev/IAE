"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    GraduationCap,
    Settings,
} from 'lucide-react';

interface MobileLayoutProps {
    children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || 'STUDENT';
    const [profileOpen, setProfileOpen] = useState(false);

    // Build navigation items dynamically based on the current user's role
    const navItems = role === 'ADMIN' ? [
        { name: 'Dasbor', icon: LayoutDashboard, href: '/' },
        { name: 'Kursus', icon: BookOpen, href: '/admin/courses' },
        { name: 'Akses', icon: Settings, href: '/admin/users' },
        { name: 'Pengaturan', icon: Settings, href: '/settings' },
    ] : [
        { name: 'Dasbor', icon: LayoutDashboard, href: '/' },
        { name: 'Kursus', icon: BookOpen, href: role === 'STUDENT' ? '/courses' : '/teacher/courses' },
        { name: 'Tugas', icon: ClipboardList, href: '/assignments' },
        { name: 'Nilai', icon: GraduationCap, href: '/grades' },
        { name: 'Pengaturan', icon: Settings, href: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-[#F4F7FE] dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 relative overflow-x-hidden">
            {/* Mobile Top Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 z-50 flex items-center justify-between px-5 transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain dark:mix-blend-screen" />
                    </div>
                    <span className="font-bold text-xs tracking-wider text-slate-800 dark:text-slate-200 uppercase">pErC lms</span>
                </div>

                <div className="flex items-center gap-3.5">
                    <div className="hover:scale-105 transition-transform">
                        <ThemeToggle />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shadow-sm border border-slate-200/20 dark:border-slate-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center"
                        >
                            <img
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${session?.user?.name ? session.user.name : 'Siswa'}`}
                                alt="User avatar"
                                className="w-full h-full object-cover"
                            />
                        </button>

                        {profileOpen && (
                            <>
                                {/* Backdrop */}
                                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                
                                {/* Dropdown menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                                    <div className="px-3 py-2">
                                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{session?.user?.name || 'Siswa'}</p>
                                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate mt-0.5 uppercase tracking-wider">{role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Guru' : 'Siswa'}</p>
                                    </div>
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                    <Link
                                        href="/settings?tab=profile"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors w-full text-left"
                                    >
                                        Profil Saya
                                    </Link>
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                    <button
                                        onClick={() => {
                                            setProfileOpen(false);
                                            signOut({ callbackUrl: "/login" });
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left font-bold"
                                    >
                                        Keluar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Main Scrollable Body */}
            <main className="flex-1 pt-20 pb-36 px-4 overflow-y-auto w-full max-w-md mx-auto">
                {children}
            </main>

            {/* Premium Floating Bottom Tab Navigation */}
            <nav className="fixed bottom-4 left-4 right-4 h-16 bg-white/90 dark:bg-[#0b0f19]/90 border border-slate-200/40 dark:border-slate-800/40 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] rounded-2xl z-50 flex items-center justify-around px-2 backdrop-blur-md max-w-md mx-auto transition-colors duration-300">
                {navItems.map((item, index) => {
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-300 group hover-lift ${
                                isActive
                                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Icon
                                size={18}
                                className={`mb-1 transition-transform duration-300 group-hover:scale-110 ${
                                    isActive ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-slate-400 dark:text-slate-500'
                                }`}
                            />
                            <span className="text-[9px] font-semibold tracking-tight leading-none truncate max-w-[60px]">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
