"use client";

import { useState } from "react";
import { CalendarDays, Clock, MapPin, User, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAY_COLORS = [
    '',
    'from-blue-500 to-blue-600',
    'from-indigo-500 to-indigo-600',
    'from-violet-500 to-violet-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
];
const DAY_LIGHT = [
    '',
    'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
    'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20',
    'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20',
    'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
    'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
    'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20',
];

export default function ScheduleClient({ schedules, userRole }: { schedules: any[]; userRole: string }) {
    const todayNum = new Date().getDay(); // 0=Minggu, 1=Senin...
    const todayMapped = todayNum === 0 ? 7 : todayNum; // our: 1=Senin...6=Sabtu (no Sunday)

    const [view, setView] = useState<'today' | 'weekly'>('today');
    const [selectedDay, setSelectedDay] = useState(todayMapped > 6 ? 1 : todayMapped);

    const daysWithSchedule = [...new Set(schedules.map(s => s.dayOfWeek))].sort();

    const filteredSchedules = view === 'today'
        ? schedules.filter(s => s.dayOfWeek === todayMapped)
        : schedules.filter(s => s.dayOfWeek === selectedDay);

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl shadow-sm">
                        <CalendarDays size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Jadwal Pembelajaran</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {schedules.length === 0
                                ? 'Belum ada jadwal yang ditambahkan'
                                : `${schedules.length} jadwal pertemuan`}
                        </p>
                    </div>
                </div>
            </div>

            {schedules.length === 0 ? (
                <div className="glass-panel rounded-3xl p-16 flex flex-col items-center justify-center text-center text-slate-400">
                    <CalendarDays size={48} className="mb-4 opacity-20" />
                    <p className="font-semibold text-lg mb-1">Belum Ada Jadwal</p>
                    <p className="text-sm">
                        {userRole === 'STUDENT'
                            ? 'Guru belum menambahkan jadwal untuk kursus yang Anda ikuti.'
                            : 'Tambahkan jadwal pertemuan melalui halaman manajemen kursus.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* View Switcher */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
                            <button
                                onClick={() => setView('today')}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'today' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Hari Ini
                            </button>
                            <button
                                onClick={() => setView('weekly')}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'weekly' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Per Hari
                            </button>
                        </div>

                        {/* Day selector for weekly view */}
                        {view === 'weekly' && (
                            <div className="flex gap-2 flex-wrap">
                                {([1, 2, 3, 4, 5, 6] as const).map(day => {
                                    const hasSchedule = daysWithSchedule.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                selectedDay === day
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : hasSchedule
                                                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                                                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-400 cursor-default'
                                            }`}
                                        >
                                            {DAY_NAMES[day]}
                                            {hasSchedule && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 opacity-70 align-middle" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Today Header */}
                    {view === 'today' && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {DAY_NAMES[todayMapped] ?? 'Hari ini'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {filteredSchedules.length === 0 && (
                                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Tidak ada kelas</span>
                            )}
                        </div>
                    )}

                    {/* Schedule Cards */}
                    {filteredSchedules.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                            <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="font-medium">Tidak ada kelas {view === 'weekly' ? `hari ${DAY_NAMES[selectedDay]}` : 'hari ini'}.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredSchedules.map((item: any) => {
                                const day = item.dayOfWeek as 1 | 2 | 3 | 4 | 5 | 6;
                                return (
                                    <div key={item.id} className={`glass-panel rounded-2xl border overflow-hidden ${DAY_LIGHT[day]}`}>
                                        <div className="flex items-stretch">
                                            {/* Day color bar */}
                                            <div className={`w-1.5 bg-gradient-to-b ${DAY_COLORS[day]} shrink-0`} />

                                            <div className="flex-1 p-5">
                                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                                    <div className="flex-1">
                                                        {/* Course name */}
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <BookOpen size={16} className="text-slate-400 shrink-0" />
                                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-tight">
                                                                {item.courseName}
                                                            </h3>
                                                        </div>

                                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                            {/* Time */}
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock size={14} />
                                                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                                    {item.startTime} – {item.endTime}
                                                                </span>
                                                            </span>

                                                            {/* Room */}
                                                            {item.room && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <MapPin size={14} />
                                                                    {item.room}
                                                                </span>
                                                            )}

                                                            {/* Teacher */}
                                                            <span className="flex items-center gap-1.5">
                                                                <User size={14} />
                                                                {item.teacherName}
                                                            </span>
                                                        </div>

                                                        {item.note && (
                                                            <p className="mt-2 text-xs text-slate-500 italic">{item.note}</p>
                                                        )}
                                                    </div>

                                                    {/* Day badge (only in weekly view) */}
                                                    {view === 'weekly' && (
                                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r ${DAY_COLORS[day]} text-white shadow-sm shrink-0`}>
                                                            {DAY_NAMES[day]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Weekly Overview mini */}
                    <div className="glass-panel rounded-2xl p-5">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-3">Ringkasan Mingguan</p>
                        <div className="grid grid-cols-6 gap-2">
                            {([1, 2, 3, 4, 5, 6] as const).map(day => {
                                const count = schedules.filter(s => s.dayOfWeek === day).length;
                                const isToday = day === todayMapped;
                                return (
                                    <div key={day} className={`text-center p-2 rounded-xl transition-all ${isToday ? `bg-gradient-to-b ${DAY_COLORS[day]} text-white` : 'text-slate-500 dark:text-slate-400'}`}>
                                        <p className="text-xs font-medium">{DAY_NAMES[day].slice(0, 3)}</p>
                                        <p className={`text-xl font-bold mt-0.5 ${count === 0 ? 'opacity-30' : ''}`}>{count}</p>
                                        <p className="text-xs opacity-70">kelas</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
