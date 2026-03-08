import React from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';

export default function Header() {
    return (
        <header className="flex items-center justify-between h-20 mb-8 z-10 relative gap-4">
            <button className="lg:hidden p-2 rounded-xl bg-white shadow-sm text-slate-500 hover:text-blue-600 transition-colors">
                <Menu size={24} />
            </button>

            <div className="flex items-center flex-1 max-w-xl hidden sm:flex">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses, grades, or settings..."
                        className="w-full bg-white h-14 pl-12 pr-4 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)] placeholder:text-slate-400 text-slate-700"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-3.5 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 text-slate-500 hover:text-slate-800">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] cursor-pointer hover:-translate-y-1 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
                            alt="User avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">Budi Santoso</span>
                        <span className="text-xs text-slate-500">Informatics Eng.</span>
                    </div>
                    <ChevronDown size={16} className="text-slate-400 ml-2" />
                </div>
            </div>
        </header>
    );
}
