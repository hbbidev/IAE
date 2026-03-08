import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'blue' | 'indigo' | 'emerald' | 'amber';
}

const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
};

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue'
}: StatCardProps) {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

    return (
        <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_15px_45px_rgba(0,0,0,0.08)] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-slate-50 ${trendColor}`}>
                        <TrendIcon size={14} />
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
                <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
            </div>
        </div>
    );
}
