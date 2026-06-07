"use client";

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'slate' | 'purple' | 'rose';
}

const colorMap = {
    rose: { bg: 'bg-[#FFE2E5] dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400' },
    amber: { bg: 'bg-[#FFF4DE] dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400' },
    emerald: { bg: 'bg-[#DCFCE7] dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400' },
    indigo: { bg: 'bg-[#F3E8FF] dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400' },
    blue: { bg: 'bg-[#E0F2FE] dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-[#E8EFFF] dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400' },
    slate: { bg: 'bg-slate-100 dark:bg-slate-800/40', text: 'text-slate-600 dark:text-slate-400' }
};

const sparklines = {
    rose: "M0 15 Q12 18, 25 10 T50 5",
    amber: "M0 10 Q12 5, 25 15 T50 12",
    emerald: "M0 18 Q12 10, 25 12 T50 2",
    indigo: "M0 12 Q12 15, 25 8 T50 4",
    blue: "M0 15 Q12 5, 25 10 T50 5",
    purple: "M0 8 Q12 12, 25 5 T50 15",
    slate: "M0 15 Q12 10, 25 15 T50 10"
};

export default function StatCard({ title, value, subtitle, color = 'blue', trend = 'up', trendValue = '+11.0%' }: StatCardProps) {
    const colorStyles = colorMap[color] || colorMap.blue;
    const path = sparklines[color] || sparklines.blue;

    return (
        <div className={`rounded-2xl p-5 ${colorStyles.bg} flex flex-col justify-between h-28 relative group transition-all duration-300 hover:scale-[1.02] border border-transparent`}>
            {/* Title (e.g. Views) */}
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{title}</span>

            {/* Metric Value & Sparkline */}
            <div className="flex items-end justify-between mt-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{value}</span>
                    <span className={`text-[10px] font-bold flex items-center ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {trendValue}
                        {trend === 'up' ? <TrendingUp size={10} className="ml-0.5" /> : <TrendingDown size={10} className="ml-0.5" />}
                    </span>
                </div>

                {/* Inline SVG Sparkline graph matching ByeWind mockup */}
                <svg className="w-12 h-6 text-slate-900/60 dark:text-white/60 mr-1" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d={path} strokeLinecap="round" />
                </svg>
            </div>
        </div>
    );
}
