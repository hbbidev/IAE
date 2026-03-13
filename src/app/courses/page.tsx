"use client";

import { BookOpenCheck } from "lucide-react";

export default function CoursesPage() {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
                    <BookOpenCheck size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Course Registration (KRS)</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your class schedule for the upcoming semester.</p>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800/30 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] border border-slate-100/50 dark:border-slate-700/30 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-blue-500 dark:text-slate-400 shadow-[inset_0px_2px_10px_rgba(0,0,0,0.05)] border border-blue-100 dark:border-slate-600">
                    <BookOpenCheck size={32} />
                </div>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Registration Period Not Open</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">The KRS filling period for Odd Semester 2026 has not yet started. Please check the academic calendar or wait for further announcements.</p>

                <button className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.3)] transition-all duration-300 hover:-translate-y-1">
                    View Academic Calendar
                </button>
            </div>
        </div>
    );
}
