"use client";

import Link from 'next/link';
import StatCard from '@/components/StatCard';
import { BookOpen, ClipboardList, GraduationCap, PlayCircle, Clock, Sparkles, CheckSquare, AlertCircle, ArrowRight } from 'lucide-react';

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
    const activeCourses = enrollments.length > 0 ? enrollments.map(e => ({
        id: e.id,
        course: e.course.title,
        courseId: e.course.id,
        progress: e.progress ?? 0,
        color: 'blue'
    })) : [];

    const pendingCount = upcomingItems.length;

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
        <>
            {/* Welcome Banner */}
            <div className="accent-bg rounded-3xl p-8 text-white shadow-[0_10px_30px_-10px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.3)] mb-8 hover-lift relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-2">
                        Selamat datang, {name}! <Sparkles className="text-yellow-300" size={24} />
                    </h1>
                    <p className="text-white/80 max-w-xl">
                        {pendingCount > 0
                            ? `Anda memiliki ${pendingCount} tugas/quiz mendatang yang perlu diselesaikan.`
                            : 'Tidak ada tugas mendatang. Terus semangat belajar!'}
                    </p>
                </div>
                <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Kursus Berjalan" value={activeCourses.length} subtitle="yang sedang diikuti" icon={BookOpen} color="purple" />
                <StatCard title="Tugas Mendatang" value={upcomingItems.filter(i => i.type === 'assignment').length} subtitle="belum dikumpulkan" icon={ClipboardList} color="amber" trend="neutral" trendValue="Penting" />
                <StatCard title="Quiz Tersedia" value={upcomingItems.filter(i => i.type === 'quiz').length} subtitle="belum dikerjakan" icon={CheckSquare} color="indigo" />
                <StatCard title="Total Terdaftar" value={enrollments.length} subtitle="kursus" icon={GraduationCap} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kursus aktif */}
                <div className="lg:col-span-2 glass-panel rounded-3xl p-7 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Kursus Saya</h2>
                        <Link href="/courses" className="text-sm font-semibold accent-text hover:underline">Lihat semua →</Link>
                    </div>
                    {activeCourses.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-8">
                            <BookOpen size={36} className="mb-3 opacity-30" />
                            <p className="font-medium">Belum ada kursus</p>
                            <Link href="/courses" className="mt-4 px-4 py-2 accent-bg text-white rounded-xl text-sm font-semibold">Daftar Kursus</Link>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-3">
                            {activeCourses.map(item => (
                                <Link key={item.id} href={`/courses/${item.courseId}`} className="group flex items-center p-4 rounded-2xl hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200">
                                    <div className="w-12 h-12 rounded-2xl accent-tint accent-text flex items-center justify-center mr-4 shrink-0">
                                        <PlayCircle size={24} className="group-hover:scale-110 transition-transform duration-200" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 dark:text-white truncate group-hover:accent-text transition-colors">{item.course}</h3>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div className="accent-bg h-1.5 rounded-full transition-all duration-700" style={{ width: `${item.progress}%` }}></div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{item.progress}% selesai</p>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 ml-3 shrink-0 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tugas & Quiz Mendatang */}
                <div className="glass-panel rounded-3xl p-7 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Mendatang</h2>
                        <Link href="/assignments" className="text-sm font-semibold accent-text hover:underline">Lihat tugas →</Link>
                    </div>

                    {upcomingItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-6">
                            <CheckSquare size={36} className="mb-3 opacity-30" />
                            <p className="font-medium text-sm">Tidak ada tugas mendatang</p>
                            <p className="text-xs mt-1">Semua tugas sudah selesai! 🎉</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 flex-1">
                            {upcomingItems.map(item => {
                                const { label, urgent } = formatDeadline(item.deadline);
                                const isQuiz = item.type === 'quiz';
                                const href = `/courses/${item.courseId}?tab=${isQuiz ? 'quiz' : 'tugas'}`;

                                return (
                                    <Link
                                        key={`${item.type}-${item.id}`}
                                        href={href}
                                        className="group relative p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 block"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isQuiz ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                                                {isQuiz ? <CheckSquare size={15} /> : <ClipboardList size={15} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:accent-text transition-colors truncate">{item.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">{item.courseName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pl-11">
                                            <span className="text-xs font-medium text-slate-400">{isQuiz ? 'Quiz' : 'Tugas'}</span>
                                            <span className={`text-xs font-bold flex items-center gap-1 ${urgent ? 'text-red-500' : 'text-slate-500'}`}>
                                                {urgent && <AlertCircle size={11} />}
                                                {label}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    <Link
                        href="/assignments"
                        className="mt-5 w-full py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center block"
                    >
                        Lihat Semua Tugas
                    </Link>
                </div>
            </div>
        </>
    );
}
