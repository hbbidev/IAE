"use client";

import { CalendarDays, Plus } from "lucide-react";

export default function SchedulePage() {
    // Reusing schedule data from home for visual consistency
    const scheduleData = [
        { id: 1, course: 'Data Structures & Algorithms', time: '08:00 - 10:30', room: 'Lab 01 - Compute', color: 'blue', type: 'Lecture' },
        { id: 2, course: 'Web Development Frameworks', time: '11:00 - 13:30', room: 'Room 304 - Gedung A', color: 'indigo', type: 'Practicum' },
        { id: 3, course: 'Database Management Systems', time: '14:30 - 16:00', room: 'Lab 03 - Compute', color: 'emerald', type: 'Lecture' },
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl shadow-sm">
                        <CalendarDays size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Class Schedule</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">View your academic timetable for the week.</p>
                    </div>
                </div>

                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-colors">
                    <Plus size={16} />
                    <span>Sync Calendar</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800/20 rounded-3xl p-7 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] border border-slate-100/50 dark:border-slate-700/30">
                {/* Temporary View Switcher Skeleton */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl mb-6 w-fit mx-auto sm:mx-0">
                    <button className="px-6 py-2 bg-white dark:bg-slate-800 shadow-sm rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200">Today</button>
                    <button className="px-6 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">Weekly</button>
                    <button className="px-6 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hidden sm:block">Monthly</button>
                </div>

                <div className="space-y-4">
                    {scheduleData.map((item) => (
                        <div key={item.id} className="group flex items-center p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-300">
                            <div className="w-24 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-center pr-4">
                                <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{item.time.split(' - ')[0]}</span>
                                <span className="text-sm font-medium text-slate-400 dark:text-slate-500">{item.time.split(' - ')[1]}</span>
                            </div>

                            <div className="flex-1 pl-6">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.course}</h3>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${item.color}-50 dark:bg-${item.color}-500/10 text-${item.color}-600 dark:text-${item.color}-400`}>
                                        {item.type}
                                    </span>
                                </div>
                                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm gap-4">
                                    <span className="flex items-center gap-1.5">{item.room}</span>
                                    <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                                    <span className="hidden sm:inline">Prof. Dr. Instructor</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
