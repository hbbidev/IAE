"use client";

import { useState } from "react";
import { CalendarDays, Clock, MapPin, User, BookOpen } from "lucide-react";

const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

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
            {/* Header (ByeWind minimalist styling) */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#E8EFFF] dark:bg-purple-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <CalendarDays size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Jadwal Pembelajaran</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                            {schedules.length === 0
                                ? 'Belum ada jadwal yang ditambahkan'
                                : `${schedules.length} jadwal pertemuan`}
                        </p>
                    </div>
                </div>
            </div>

            {schedules.length === 0 ? (
                <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center text-center text-slate-400">
                    <CalendarDays size={40} className="mb-3 opacity-20" />
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">Belum Ada Jadwal</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {userRole === 'STUDENT'
                            ? 'Guru belum menambahkan jadwal untuk kursus yang Anda ikuti.'
                            : 'Tambahkan jadwal pertemuan melalui halaman manajemen kursus.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* View Switcher & Day Selector */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex p-0.5 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
                            <button
                                onClick={() => setView('today')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'today' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Hari Ini
                            </button>
                            <button
                                onClick={() => setView('weekly')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'weekly' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Per Hari
                            </button>
                        </div>

                        {/* Day selector for weekly view */}
                        {view === 'weekly' && (
                            <div className="flex gap-2 flex-wrap">
                                {([1, 2, 3, 4, 5, 6] as const).map(day => {
                                    const hasSchedule = daysWithSchedule.includes(day);
                                    const isSelected = selectedDay === day;
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                                    : hasSchedule
                                                        ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:border-slate-300'
                                                        : 'bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900 text-slate-400 cursor-default'
                                            }`}
                                        >
                                            {DAY_NAMES[day]}
                                            {hasSchedule && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 opacity-80 align-middle" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Today Header */}
                    {view === 'today' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                {DAY_NAMES[todayMapped] ?? 'Hari ini'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {filteredSchedules.length === 0 && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900/50 px-2.5 py-0.5 rounded-full">Tidak ada kelas</span>
                            )}
                        </div>
                    )}

                    {/* Schedule Cards */}
                    {filteredSchedules.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                            <CalendarDays size={28} className="mx-auto mb-2 opacity-20" />
                            <p className="font-bold text-xs">Tidak ada kelas {view === 'weekly' ? `hari ${DAY_NAMES[selectedDay]}` : 'hari ini'}.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredSchedules.map((item: any) => (
                                <div key={item.id} className="glass-panel rounded-2xl overflow-hidden">
                                    <div className="flex items-stretch">
                                        {/* Accent left bar */}
                                        <div className="w-1 bg-blue-500 shrink-0" />

                                        <div className="flex-1 p-5">
                                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                                <div className="flex-1">
                                                    {/* Course name */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <BookOpen size={14} className="text-slate-400 shrink-0" />
                                                        <h3 className="font-bold text-slate-800 dark:text-slate-150 text-sm leading-tight">
                                                            {item.courseName}
                                                        </h3>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                        {/* Time */}
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} className="text-slate-400" />
                                                            <span className="text-slate-700 dark:text-slate-350">
                                                                {item.startTime} – {item.endTime}
                                                            </span>
                                                        </span>

                                                        {/* Room */}
                                                        {item.room && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={12} className="text-slate-400" />
                                                                <span className="text-slate-700 dark:text-slate-350">{item.room}</span>
                                                            </span>
                                                        )}

                                                        {/* Teacher */}
                                                        <span className="flex items-center gap-1">
                                                            <User size={12} className="text-slate-400" />
                                                            <span className="text-slate-700 dark:text-slate-350">{item.teacherName}</span>
                                                        </span>
                                                    </div>

                                                    {item.note && (
                                                        <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 italic">{item.note}</p>
                                                    )}
                                                </div>

                                                {/* Day badge */}
                                                {view === 'weekly' && (
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
                                                        {DAY_NAMES[item.dayOfWeek]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Weekly Overview mini */}
                    <div className="glass-panel rounded-2xl p-6">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Ringkasan Mingguan</p>
                        <div className="grid grid-cols-6 gap-3">
                            {([1, 2, 3, 4, 5, 6] as const).map(day => {
                                const count = schedules.filter(s => s.dayOfWeek === day).length;
                                const isToday = day === todayMapped;
                                return (
                                    <div key={day} className={`text-center p-3 rounded-xl transition-all ${isToday ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'}`}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider">{DAY_NAMES[day].slice(0, 3)}</p>
                                        <p className={`text-lg font-extrabold mt-0.5 ${count === 0 ? 'opacity-30' : ''}`}>{count}</p>
                                        <p className="text-[9px] font-bold opacity-75">kelas</p>
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
