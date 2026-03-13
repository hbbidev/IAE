"use client";

import { GraduationCap, Download } from "lucide-react";

export default function GradesPage() {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
                        <GraduationCap size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Grades & Study Results (KHS)</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">View your academic performance history.</p>
                    </div>
                </div>

                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors">
                    <Download size={16} />
                    <span>Download Transcript</span>
                </button>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800/30 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] border border-slate-100/50 dark:border-slate-700/30 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-indigo-500 dark:text-slate-400 shadow-[inset_0px_2px_10px_rgba(0,0,0,0.05)] border border-indigo-100 dark:border-slate-600">
                    <GraduationCap size={32} />
                </div>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No Grades Published Yet</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">Your grades for the current active semester are still being processed by the faculty or the semester hasn't officially ended.</p>
            </div>
        </div>
    );
}
