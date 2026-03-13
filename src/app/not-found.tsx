"use client";

import Link from 'next/link';
import { Ghost, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="h-[75vh] w-full flex flex-col items-center justify-center text-center">
            {/* Floating visual element */}
            <div className="relative mb-8 group cursor-pointer">
                <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 blur-3xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center animate-bounce border border-slate-100 dark:border-slate-700 relative z-10">
                    <Ghost size={64} strokeWidth={1.5} className="text-blue-500 dark:text-blue-400 drop-shadow-md" />
                </div>

                {/* Simulated shadow on ground */}
                <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800/50 rounded-full mx-auto mt-12 blur-sm animate-pulse"></div>
            </div>

            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4 tracking-tight">
                404
            </h1>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Lost in the campus void
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps it never existed in this semester's curriculum.
            </p>

            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-2xl hover:-translate-y-1 hover:shadow-lg shadow-blue-900/20 dark:shadow-white/20 transition-all duration-300">
                <ArrowLeft size={18} />
                Return to Dashboard
            </Link>
        </div>
    );
}
