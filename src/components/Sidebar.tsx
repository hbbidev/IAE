"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
    LogOut,
} from 'lucide-react';
import { getMyEnrolledOrTaughtCourses } from '@/actions/course';

export default function Sidebar({ 
    mobileOpen, 
    setMobileOpen,
    collapsed,
    setCollapsed
}: { 
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
    collapsed: boolean;
    setCollapsed: (c: boolean) => void;
}) {
    const { data: session, status } = useSession();
    const role = (session?.user as any)?.role || 'STUDENT';
    const isLoading = status === 'loading';
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'profile';

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const showLoading = !mounted || isLoading;

    const [profileOpen, setProfileOpen] = useState(false);
    const [settingsExpanded, setSettingsExpanded] = useState(pathname === '/settings');
    const [coursesExpanded, setCoursesExpanded] = useState(pathname.startsWith('/courses') || pathname.startsWith('/teacher/courses'));
    const [myCourses, setMyCourses] = useState<{ id: string; title: string }[]>([]);

    useEffect(() => {
        if (pathname === '/settings') {
            setSettingsExpanded(true);
        }
        if (pathname.startsWith('/courses') || pathname.startsWith('/teacher/courses')) {
            setCoursesExpanded(true);
        }
    }, [pathname]);

    useEffect(() => {
        if (status === 'authenticated') {
            getMyEnrolledOrTaughtCourses().then((res) => {
                if (res.success && res.courses) {
                    setMyCourses(res.courses);
                }
            });
        }
    }, [status]);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const sections = [
        {
            title: 'Utama',
            items: [
                { name: 'Dasbor', icon: LayoutDashboard, href: '/', roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
            ]
        },
        {
            title: 'Akademik',
            items: [
                { 
                    name: 'Kursus Saya', 
                    icon: BookOpen, 
                    href: role === 'STUDENT' ? '/courses' : '/teacher/courses', 
                    roles: ['STUDENT', 'TEACHER'],
                    subItems: myCourses.map(c => ({
                        name: c.title,
                        href: role === 'STUDENT' ? `/courses/${c.id}` : `/teacher/courses/${c.id}`
                    }))
                },
                { name: 'Tugas', icon: ClipboardList, href: '/assignments', roles: ['STUDENT', 'TEACHER'] },
                { name: 'Nilai', icon: GraduationCap, href: '/grades', roles: ['STUDENT', 'TEACHER'] },
                { name: 'Jadwal', icon: Calendar, href: '/schedule', roles: ['STUDENT', 'TEACHER'] },
            ]
        },
        {
            title: 'Sistem',
            items: [
                { name: 'Manajemen Kursus', icon: BookOpen, href: '/admin/courses', roles: ['ADMIN'] },
                { name: 'Hak Akses', icon: Settings, href: '/admin/users', roles: ['ADMIN'] },
                {
                    name: 'Pengaturan',
                    icon: Settings,
                    href: '/settings',
                    roles: ['STUDENT', 'TEACHER', 'ADMIN'],
                    subItems: [
                        { name: 'Profil', href: '/settings?tab=profile' },
                        { name: 'Tampilan', href: '/settings?tab=appearance' },
                        { name: 'Notifikasi', href: '/settings?tab=notifications' },
                        { name: 'Keamanan', href: '/settings?tab=security' }
                    ]
                },
            ]
        }
    ].map(section => ({
        ...section,
        items: section.items.filter(item => item.roles.includes(role))
    })).filter(section => section.items.length > 0);

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-md transition-opacity"
                    onClick={() => setMobileOpen?.(false)}
                />
            )}

            <aside className={`fixed top-0 left-0 h-full ${collapsed ? 'w-24' : 'w-64'} bg-white dark:bg-[#0b0f19] border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col py-6 px-4 z-50 transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setMobileOpen?.(false)}
                    className="absolute top-6 right-4 lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl"
                >
                    <X size={16} />
                </button>

                {/* User Profile Block (ByeWind top design) */}
                <div className="relative mb-8 mt-2">
                    <button 
                        onClick={() => setProfileOpen(!profileOpen)}
                        className={`flex items-center ${collapsed ? 'justify-center w-full px-0' : 'gap-3 px-2 py-1.5'} rounded-xl w-full hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all text-left focus:outline-none`}
                    >
                        <div className="w-8 h-8 min-w-[2rem] shrink-0 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shadow-sm">
                            <img
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${mounted && session?.user?.name ? session.user.name : 'Siswa'}`}
                                alt="User avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate leading-none">
                                    {mounted && session?.user?.name ? session.user.name : 'Nama Pengguna'}
                                </span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wider leading-none">
                                    {mounted && session?.user ? (role === 'STUDENT' ? 'Siswa' : role === 'TEACHER' ? 'Guru' : 'Admin') : 'Siswa'}
                                </span>
                            </div>
                        )}
                    </button>

                    {/* Popover / Dropdown Menu */}
                    {profileOpen && (
                        <>
                            {/* Backdrop click listener */}
                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                            <div className={`absolute ${collapsed ? 'left-20 top-0 w-48' : 'left-2 right-2 top-12'} bg-white dark:bg-[#0f172a] border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}>
                                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Akun Saya</p>
                                </div>
                                <Link
                                    href="/settings?tab=profile"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <Settings size={14} className="text-slate-400" />
                                    <span>Pengaturan Profil</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setProfileOpen(false);
                                        signOut({ callbackUrl: "/login" });
                                    }}
                                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold text-red-650 text-red-650 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                >
                                    <LogOut size={14} />
                                    <span>Keluar (Logout)</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <nav className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                    {showLoading ? (
                        <div className="px-2 space-y-3 mt-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-9 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        sections.map((section) => (
                            <div key={section.title} className="flex flex-col gap-0.5 mb-5">
                                {!collapsed && <span className="text-[9px] font-bold text-slate-400/80 dark:text-slate-600 uppercase tracking-wider px-2 mb-1.5">{section.title}</span>}
                                {section.items.map((item) => {
                                    const isSettings = item.name === 'Pengaturan';
                                    const isCourses = item.name === 'Kursus Saya';
                                    const hasSubItems = !!item.subItems && item.subItems.length > 0;
                                    
                                    const isExpanded = isSettings ? settingsExpanded : (isCourses ? coursesExpanded : false);
                                    const isActive = pathname === item.href || (isCourses && (pathname.startsWith('/courses/') || pathname.startsWith('/teacher/courses/')));

                                    if (hasSubItems) {
                                        return (
                                            <div key={item.name} className="flex flex-col gap-0.5">
                                                <Link
                                                    href={item.href}
                                                    onClick={(e) => {
                                                        // Toggle expansion when clicked
                                                        if (isSettings) setSettingsExpanded(!settingsExpanded);
                                                        if (isCourses) setCoursesExpanded(!coursesExpanded);
                                                    }}
                                                    className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-2'} py-2 rounded-xl transition-all duration-200 group w-full text-left cursor-pointer ${isActive && !isExpanded
                                                        ? 'bg-[#E8EFFF] dark:bg-slate-800/40 text-blue-600 dark:text-blue-400 font-bold'
                                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20 hover:text-slate-880 dark:hover:text-slate-200'
                                                        }`}
                                                >
                                                     {collapsed ? (
                                                         <item.icon size={15} className={`min-w-[1rem] transition-colors duration-200 ${(isActive && !isExpanded) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-650 dark:group-hover:text-slate-300'}`} />
                                                     ) : (
                                                         <div className="flex items-center gap-2 flex-1 min-w-0">
                                                             <ChevronRight
                                                                 size={10}
                                                                 className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`}
                                                             />
                                                             <item.icon size={15} className={`min-w-[1rem] transition-colors duration-200 ${(isActive && !isExpanded) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-650 dark:group-hover:text-slate-300'}`} />
                                                             <span className="text-[11px] font-medium leading-none truncate">{item.name}</span>
                                                         </div>
                                                     )}
                                                </Link>

                                                {/* Sub Items (Expandable naturally downwards, with clean spacing to prevent overlapping) */}
                                                {!collapsed && isExpanded && (
                                                    <div className="flex flex-col gap-1.5 pl-4 ml-2 mt-1 border-l border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-1 duration-200">
                                                        {item.subItems.map((sub) => {
                                                            const isSubActive = sub.href.includes('?tab=')
                                                                ? (pathname === '/settings' && sub.href.includes(`tab=${currentTab}`))
                                                                : (pathname === sub.href);
                                                            return (
                                                                <Link
                                                                    key={sub.name}
                                                                    href={sub.href}
                                                                    className={`flex items-center w-full py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all duration-200 ${isSubActive
                                                                        ? 'text-blue-600 dark:text-blue-400 bg-[#E8EFFF] dark:bg-slate-800/80 font-semibold'
                                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                                                                        }`}
                                                                >
                                                                    <span className="truncate block w-full text-left leading-normal">
                                                                        {sub.name}
                                                                    </span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-2'} py-2 rounded-xl transition-all duration-200 group ${isActive
                                                ? 'bg-[#E8EFFF] dark:bg-slate-800/40 text-blue-600 dark:text-blue-400 font-bold'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20 hover:text-slate-800 dark:hover:text-slate-200'
                                                }`}
                                            title={collapsed ? item.name : undefined}
                                        >
                                            <item.icon size={15} className={`min-w-[1rem] transition-colors duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-660 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                            {!collapsed && <span className="text-[11px] font-medium leading-none">{item.name}</span>}
                                        </Link>
                                    )
                                })}
                            </div>
                        ))
                    )}
                </nav>

                {/* Footer Logo Block (matches SnowUI footer label) */}
                <div className={`mt-auto pt-6 flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'} border-t border-slate-100 dark:border-slate-800/50`}>
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                        <Image src="/logo.png" alt="Logo" width={20} height={20} className="object-contain dark:mix-blend-screen" />
                    </div>
                    {!collapsed && <span className="font-bold text-[9px] tracking-widest text-slate-400 dark:text-slate-500 uppercase leading-none">pErC lms</span>}
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={toggleCollapse}
                    className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-700 z-10 hover:scale-110 transition-all hidden lg:flex"
                >
                    {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>
            </aside>
        </>
    );
}
