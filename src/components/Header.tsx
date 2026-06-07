"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Info, Menu, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';

export default function Header({ onMenuClick, onNotificationClick }: { onMenuClick?: () => void, onNotificationClick?: () => void }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    // Map pathname to breadcrumbs (ByeWind top left style)
    const pathMap: Record<string, string[]> = {
        '/': ['Dasbor', 'Default'],
        '/courses': ['Kursus', 'Daftar Kursus'],
        '/teacher/courses': ['Kursus', 'Kelas Saya'],
        '/admin/courses': ['Kursus', 'Manajemen Kursus'],
        '/assignments': ['Akademik', 'Tugas'],
        '/grades': ['Akademik', 'Nilai'],
        '/schedule': ['Akademik', 'Jadwal'],
        '/admin/users': ['Sistem', 'Hak Akses'],
        '/settings': ['Sistem', 'Pengaturan'],
    };
    const breadcrumbs = pathMap[pathname] || ['LMS', 'Halaman'];

    return (
        <header className="flex items-center justify-between h-14 mb-6 z-30 relative gap-4">
            {/* Mobile Hamburger Menu */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 shadow-sm"
            >
                <Menu size={20} />
            </button>

            {/* Left Column: Breadcrumbs & Favorite star (mockup design) */}
            <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold select-none">
                    <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">pErC lms</span>
                    <span>/</span>
                    <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{breadcrumbs[0]}</span>
                    <span>/</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{breadcrumbs[1]}</span>
                </div>
            </div>

            {/* Right Column: Search & Action Icons */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Search input (centered-right borderless styling) */}
                <div className="relative w-48 sm:w-64 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && searchQuery.trim()) {
                                router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
                            }
                        }}
                        placeholder="Search..."
                        className="w-full h-9 pl-10 pr-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-transparent focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-medium"
                    />
                </div>

                {/* Theme Toggle Widget */}
                <div className="hover:scale-105 transition-transform">
                    <ThemeToggle />
                </div>

                {/* Notification Badge link */}
                <button
                    onClick={onNotificationClick}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                >
                    <Info size={18} />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                </button>
            </div>
        </header>
    );
}
