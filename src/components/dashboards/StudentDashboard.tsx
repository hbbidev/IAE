"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import { BookOpen, ClipboardList, GraduationCap, PlayCircle, Sparkles, CheckSquare, AlertCircle, ArrowRight, Circle } from 'lucide-react';

type UpcomingItem = {
    id: string;
    title: string;
    courseName: string;
    courseId: string;
    deadline: Date | null;
    type: 'assignment' | 'quiz';
};

export default function StudentDashboard({
    name,
    enrollments,
    upcomingItems = [],
}: {
    name: string;
    enrollments: any[];
    upcomingItems?: UpcomingItem[];
}) {
    const [data, setData] = useState({
        enrollments,
        upcomingItems,
        materiDilihat: "128",
        durasiBelajar: "45.2j",
        tugasSelesai: enrollments.length > 0 ? "12/16" : "0/0",
        rataRataNilai: 88.5,
        attendanceRatio: { hadir: 75, sakit: 15, izin: 10 },
        scoreDistribution: [
            { name: 'MTK', val: 85, color: 'bg-blue-400' },
            { name: 'FIS', val: 92, color: 'bg-cyan-400' },
            { name: 'ALG', val: 75, color: 'bg-slate-800 dark:bg-slate-400' },
            { name: 'KIM', val: 88, color: 'bg-indigo-400' },
            { name: 'BIO', val: 60, color: 'bg-purple-400' },
            { name: 'IND', val: 95, color: 'bg-sky-400' },
        ]
    });

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const res = await fetch('/api/dashboard');
                if (res.ok) {
                    const latest = await res.json();
                    if (latest.role === 'STUDENT') {
                        setData({
                            enrollments: latest.enrollments,
                            upcomingItems: latest.upcomingItems,
                            materiDilihat: String(latest.materiDilihat),
                            durasiBelajar: latest.durasiBelajar,
                            tugasSelesai: latest.tugasSelesai,
                            rataRataNilai: latest.rataRataNilai,
                            attendanceRatio: latest.attendanceRatio,
                            scoreDistribution: latest.scoreDistribution,
                        });
                    }
                }
            } catch (err) {
                console.error("Error polling student dashboard:", err);
            }
        };

        const interval = setInterval(fetchUpdates, 5000);
        fetchUpdates();
        return () => clearInterval(interval);
    }, []);

    const activeCourses = data.enrollments.length > 0 ? data.enrollments.map(e => ({
        id: e.id,
        course: e.course.title,
        courseId: e.course.id,
        progress: e.progress ?? 0,
        color: 'blue'
    })) : [];

    const pendingCount = data.upcomingItems.length;

    // Format waktu relatif
    const formatDeadline = (date: Date | null): { label: string; urgent: boolean } => {
        if (!date) return { label: 'Tanpa tenggat', urgent: false };
        const now = new Date();
        const diff = new Date(date).getTime() - now.getTime();
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (diff < 0) return { label: 'Terlambat', urgent: true };
        if (hours < 24) return { label: `${hours}j lagi`, urgent: true };
        if (days === 1) return { label: 'Besok', urgent: true };
        if (days <= 3) return { label: `${days} hari lagi`, urgent: true };
        return {
            label: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            urgent: false,
        };
    };

    return (
        <div className="flex flex-col gap-6 select-none animate-in fade-in duration-300">
            {/* Overview Metrics Grid (matches ByeWind top stats list) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Materi Dilihat" value={data.materiDilihat} color="purple" trend="up" trendValue="+11.0%" />
                <StatCard title="Durasi Belajar" value={data.durasiBelajar} color="blue" trend="down" trendValue="-3.0%" />
                <StatCard title="Tugas Selesai" value={data.tugasSelesai} color="indigo" trend="up" trendValue="+15.0%" />
                <StatCard title="Rata-rata Nilai" value={String(data.rataRataNilai)} color="amber" trend="up" trendValue="+6.0%" />
            </div>

            {/* Main Dashboard Visual Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 (2/3 width): Monthly Line Chart & Vertical Scores bar chart */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Activity Line Chart (matches Total Users) */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Aktivitas Belajar Bulanan</span>
                            <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                                <span className="flex items-center gap-1"><Circle size={8} className="fill-blue-500 text-blue-500" /> Tahun Ini</span>
                                <span className="flex items-center gap-1"><Circle size={8} className="fill-slate-300 text-slate-300" /> Tahun Lalu</span>
                            </div>
                        </div>
                        {/* SVG Line Chart */}
                        <div className="relative w-full h-44 mt-2">
                            <svg className="w-full h-full" viewBox="0 0 500 150">
                                {/* Grid Lines */}
                                <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="0.5" strokeDasharray="4" />
                                <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="0.5" strokeDasharray="4" />
                                <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="0.5" strokeDasharray="4" />
                                
                                {/* Line 1 (Tahun Ini) - smooth path */}
                                <path d="M 10 130 C 50 110, 100 120, 150 90 C 200 60, 250 80, 300 45 C 350 10, 400 40, 450 20" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                                {/* Line 2 (Tahun Lalu) - smooth path */}
                                <path d="M 10 110 C 50 85, 100 95, 150 75 C 200 55, 250 65, 300 35 C 350 5, 400 25, 450 10" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4" strokeLinecap="round" />
                            </svg>
                            {/* X-Axis Labels */}
                            <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold px-2 mt-2">
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                                <span>Jun</span>
                                <span>Jul</span>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Score Distribution (matches Traffic by Device) */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6">Distribusi Nilai Kuis</span>
                        {activeCourses.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-6">Belum ada data nilai kuis.</p>
                        ) : (
                            <div className="flex items-end justify-between gap-3 h-36 pt-2">
                                {data.scoreDistribution.map((bar, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                                        <div className="w-full bg-slate-100 dark:bg-slate-800/60 rounded-t-lg h-24 flex items-end overflow-hidden">
                                            <div className={`w-full rounded-t-lg transition-all duration-700 ${bar.color}`} style={{ height: `${bar.val}%` }}></div>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400">{bar.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2 (1/3 width): Donut Chart, Popular Courses list, Upcoming Events */}
                <div className="flex flex-col gap-6">
                    {/* Horizontal progress bar list - Popular Courses (matching Traffic by Website) */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col hover-lift">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6">Progres Kursus Terpopuler</span>
                        {activeCourses.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-4">Belum ada kursus aktif.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {activeCourses.slice(0, 4).map((item) => (
                                    <Link key={item.id} href={`/courses/${item.courseId}`} className="flex flex-col gap-1 hover:opacity-85 transition-opacity group">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors truncate max-w-[160px]">{item.course}</span>
                                            <span className="text-slate-500">{item.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${item.progress}%` }}></div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Class Attendance Ratio (matches Traffic by Location) */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col hover-lift">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6">Rasio Kehadiran</span>
                        <div className="flex items-center justify-between gap-4">
                            {/* SVG Donut Chart */}
                            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    {/* Background circle */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4" />
                                    {/* Hadir Segment */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray={`${data.attendanceRatio.hadir} ${100 - data.attendanceRatio.hadir}`} strokeDashoffset="0" />
                                    {/* Sakit Segment */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a78bfa" strokeWidth="4" strokeDasharray={`${data.attendanceRatio.sakit} ${100 - data.attendanceRatio.sakit}`} strokeDashoffset={`-${data.attendanceRatio.hadir}`} />
                                    {/* Izin Segment */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${data.attendanceRatio.izin} ${100 - data.attendanceRatio.izin}`} strokeDashoffset={`-${data.attendanceRatio.hadir + data.attendanceRatio.sakit}`} />
                                </svg>
                                <div className="absolute flex flex-col items-center leading-none">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">Total</span>
                                    <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">100%</span>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="flex flex-col gap-1.5 text-[9px] font-bold text-slate-500 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <Circle size={6} className="fill-blue-500 text-blue-500" />
                                    <span>Hadir</span>
                                    <span className="text-slate-400 ml-auto">{data.attendanceRatio.hadir}%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Circle size={6} className="fill-purple-500 text-purple-500" />
                                    <span>Sakit</span>
                                    <span className="text-slate-400 ml-auto">{data.attendanceRatio.sakit}%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Circle size={6} className="fill-amber-500 text-amber-500" />
                                    <span>Izin</span>
                                    <span className="text-slate-400 ml-auto">{data.attendanceRatio.izin}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tugas & Quiz Mendatang */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">Tugas Mendatang</span>
                            <Link href="/assignments" className="text-[10px] font-bold text-blue-600 hover:underline">Lihat semua</Link>
                        </div>
                        {data.upcomingItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center text-slate-400 py-6">
                                <p className="font-semibold text-xs">Tidak ada tugas mendatang</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {data.upcomingItems.slice(0, 3).map(item => {
                                    const { label, urgent } = formatDeadline(item.deadline);
                                    const isQuiz = item.type === 'quiz';
                                    const href = `/courses/${item.courseId}?tab=${isQuiz ? 'quiz' : 'tugas'}`;
                                    return (
                                        <Link key={`${item.type}-${item.id}`} href={href} className="flex justify-between items-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-all">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] leading-tight">{item.title}</span>
                                                <span className="text-[9px] text-slate-400 truncate max-w-[140px]">{item.courseName}</span>
                                            </div>
                                            <span className={`text-[9px] font-bold shrink-0 px-2 py-0.5 rounded-md ${urgent ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                                {label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
