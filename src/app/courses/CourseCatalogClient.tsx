"use client";
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { BookOpen, Users, UserCheck, UserPlus, Loader2, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { enrollStudent } from '@/actions/enrollment';

type Course = {
    id: string;
    title: string;
    description: string | null;
    teacher: { name: string };
    _count: { enrollments: number; lessons: number };
    enrolled: boolean;
};

export default function CourseCatalogClient({ courses }: { courses: Course[] }) {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header (ByeWind minimalist styling) */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
                <div className="p-2.5 sm:p-3 bg-[#E0F2FE] dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <BookOpen size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">Katalog Kursus</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs">
                        Temukan dan daftar kelasmu — {courses.filter(c => c.enrolled).length} dari {courses.length} kursus diikuti
                    </p>
                </div>
            </div>

            {/* Course Grid */}
            {courses.length === 0 ? (
                <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-12">
                    <div className="w-16 h-16 bg-[#E0F2FE] dark:bg-blue-950/20 rounded-full flex items-center justify-center mb-4 text-blue-500">
                        <BookOpen size={28} />
                    </div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Belum Ada Kursus Tersedia</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">Administrator belum menambahkan kursus. Hubungi admin untuk informasi lebih lanjut.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CourseCard({ course }: { course: Course }) {
    const [isPending, startTransition] = useTransition();
    const [optimisticEnrolled, setOptimisticEnrolled] = useState(course.enrolled);
    const [feedback, setFeedback] = useState('');

    const handleEnroll = () => {
        if (optimisticEnrolled) return;
        startTransition(async () => {
            setFeedback('');
            setOptimisticEnrolled(true);
            const result = await enrollStudent(course.id);
            if (result.error) {
                setOptimisticEnrolled(false);
                setFeedback(result.error);
            }
        });
    };

    return (
        <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-3.5 sm:gap-4 transition-all duration-300 hover-lift">
            {/* Top */}
            <div className="flex items-center justify-between gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E0F2FE] dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <PlayCircle size={18} className="sm:w-5 sm:h-5" />
                </div>
                {optimisticEnrolled && (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold bg-[#E0F2FE] dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 sm:py-1 rounded-full">
                        <CheckCircle2 size={10} /> Terdaftar
                    </span>
                )}
            </div>

            {/* Title & Desc */}
            <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight mb-1">{course.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {course.description || 'Tidak ada deskripsi tersedia.'}
                </p>
            </div>

            {/* Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 truncate">
                    <UserCheck size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{course.teacher.name}</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                    <Users size={12} className="text-slate-400" />
                    {course._count.enrollments} peserta
                </span>
            </div>

            {/* Error feedback */}
            {feedback && (
                <p className="text-[10px] font-bold text-red-500 dark:text-red-400 -mt-2">{feedback}</p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2">
                {optimisticEnrolled ? (
                    <Link
                        href={`/courses/${course.id}`}
                        className="w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-[1.02]"
                    >
                        <PlayCircle size={14} /> Buka Kursus <ChevronRight size={12} />
                    </Link>
                ) : (
                    <button
                        onClick={handleEnroll}
                        disabled={isPending}
                        className="w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                    >
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : <><UserPlus size={14} /> Daftar Kursus Ini</>}
                    </button>
                )}
            </div>
        </div>
    );
}
