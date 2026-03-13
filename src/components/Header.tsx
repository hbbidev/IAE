import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Menu, LogOut, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { data: session } = useSession();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
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
                className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-800/40 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                <Menu size={24} />
            </button>

            <div className="flex items-center flex-1 max-w-xl hidden sm:flex">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses, grades, or settings..."
                        className="w-full bg-white dark:bg-slate-800/30 h-14 pl-12 pr-4 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)] dark:group-hover:shadow-[0_15px_45px_rgba(0,0,0,0.3)] placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                <ThemeToggle />

                <button className="relative p-3.5 bg-white dark:bg-slate-800/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                </button>

                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 bg-white dark:bg-slate-800/30 p-2 pr-4 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] cursor-pointer hover:-translate-y-1 transition-all duration-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500/20"
                        tabIndex={0}
                    >
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 overflow-hidden ring-2 ring-transparent group-hover:ring-blue-100 dark:group-hover:ring-slate-700 transition-all">
                            <img
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${session?.user?.name || 'Felix'}`}
                                alt="User avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col hidden sm:flex">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{session?.user?.name || 'Budi Santoso'}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Informatics Eng.</span>
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 ml-2 hidden sm:block transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-700/50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 z-50">
                            <div className="p-2 flex flex-col gap-1">
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors">
                                    <User size={16} /> My Profile
                                </button>
                                <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
