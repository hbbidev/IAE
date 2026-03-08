import React from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    BookOpenCheck,
    GraduationCap,
    Wallet,
    CalendarDays,
    Settings
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/', active: true },
    { name: 'Course Registration', icon: BookOpenCheck, href: '#' },
    { name: 'Grades/KHS', icon: GraduationCap, href: '#' },
    { name: 'Finance', icon: Wallet, href: '#' },
    { name: 'Schedule', icon: CalendarDays, href: '#' },
    { name: 'Settings', icon: Settings, href: '#' },
];

export default function Sidebar() {
    return (
        <aside className="fixed left-6 top-6 bottom-6 w-64 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] hidden lg:flex flex-col p-6 z-20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                    S
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">SIAKAD</span>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${item.active
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <item.icon size={20} className={item.active ? 'text-blue-600' : 'text-slate-400'} />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto pt-8">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl">
                    <p className="text-xs font-semibold text-indigo-900 mb-1">Need Help?</p>
                    <p className="text-xs text-indigo-700/70 mb-3">Contact academic support</p>
                    <button className="w-full py-2 bg-white text-indigo-600 text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        Support Center
                    </button>
                </div>
            </div>
        </aside>
    );
}
