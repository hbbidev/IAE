import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Menu, LogOut, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || 'STUDENT';
    const roleDisplayMap: Record<string, string> = {
        'STUDENT': 'Siswa Terdaftar',
        'TEACHER': 'Tenaga Pengajar',
        'ADMIN': 'Administrator Sistem'
    };
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="flex items-center justify-between h-20 mb-8 z-10 relative gap-4">
            <button
                onClick={onMenuClick}
                className="lg:hidden glass-panel p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none hover-lift"
            >
                <Menu size={24} />
            </button>

            <div className="flex items-center flex-1 max-w-xl hidden sm:flex">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                    <input
                        type="text"
                        placeholder="Cari kelas, materi, tugas..."
                        className="w-full glass-panel h-14 pl-12 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 group-hover:-translate-y-0.5 placeholder:text-slate-400/80 text-slate-700 dark:text-slate-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                <div className="hover-lift">
                    <ThemeToggle />
                </div>

                <button className="relative p-3.5 glass-panel rounded-2xl hover-lift transition-all duration-300 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 accent-bg rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                </button>

                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 glass-panel p-2 pr-4 rounded-full cursor-pointer hover-lift transition-all duration-300"
                        tabIndex={0}
                    >
                        <div className="w-10 h-10 rounded-full accent-tint overflow-hidden transition-all">
                            <img
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${session?.user?.name || 'Siswa'}`}
                                alt="User avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col hidden sm:flex">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{session?.user?.name || 'Nama Pengguna'}</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{roleDisplayMap[role]}</span>
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 ml-1 hidden sm:block transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-48 glass-panel !bg-white/90 dark:!bg-slate-900/90 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 z-50">
                            <div className="p-2 flex flex-col gap-1">
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors">
                                    <User size={16} /> Profil Saya
                                </button>
                                <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-1"></div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                >
                                    <LogOut size={16} /> Keluar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
