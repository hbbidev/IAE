import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'slate';
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, trendValue }: StatCardProps) {
    return (
        <div className={`group relative overflow-hidden bg-white dark:bg-slate-800/40 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_15px_45px_rgba(0,0,0,0.4)] transition-all duration-300 border border-slate-100/50 dark:border-slate-700/30`}>
            {/* Subtle background glow effect on hover */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${color}-500/5 dark:bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/10 dark:group-hover:bg-${color}-500/20 transition-colors duration-500`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                        <Icon size={24} strokeWidth={2} />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{value}</span>
                        {trend && trendValue && (
                            <span className={`flex items-center text-xs font-semibold ${trend === 'up' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' :
                                trend === 'down' ? 'text-red-500 bg-red-50 dark:bg-red-500/10' :
                                    'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                                } px-2 py-1 rounded-lg`}>
                                {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> :
                                    trend === 'down' ? <TrendingDown size={12} className="mr-1" /> :
                                        <Minus size={12} className="mr-1" />}
                                {trendValue}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{subtitle}</p>
                </div>
            </div>
        </div>
    );
}
