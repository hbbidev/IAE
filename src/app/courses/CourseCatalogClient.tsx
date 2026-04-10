"use client";

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { BookOpen, Users, UserCheck, UserPlus, Loader2, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { enrollStudent, unenrollStudent } from '@/actions/enrollment';

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
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
                    <BookOpen size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Katalog Kursus</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Temukan dan daftar kelasmu — {courses.filter(c => c.enrolled).length} dari {courses.length} kursus diikuti
                    </p>
                </div>
            </div>

            {/* Course Grid */}
            {courses.length === 0 ? (
                <div className="flex-1 glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-blue-400">
                        <BookOpen size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Belum Ada Kursus Tersedia</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">Administrator belum menambahkan kursus. Hubungi admin untuk informasi lebih lanjut.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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

    const handleToggle = () => {
        startTransition(async () => {
            setFeedback('');
            const prev = optimisticEnrolled;
            setOptimisticEnrolled(!prev); // optimistic update

            const result = prev
                ? await unenrollStudent(course.id)
                : await enrollStudent(course.id);

            if (result.error) {
                setOptimisticEnrolled(prev); // revert
                setFeedback(result.error);
            }
        });
    };

    return (
        <div className={`glass-panel rounded-3xl p-6 flex flex-col gap-4 transition-all duration-300 hover-lift ${optimisticEnrolled ? 'ring-2 ring-blue-500/30' : ''}`}>
            {/* Top */}
            <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl accent-bg flex items-center justify-center text-white shrink-0 shadow-lg">
                    <PlayCircle size={22} />
                </div>
                {optimisticEnrolled && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={12} /> Terdaftar
                    </span>
                )}
            </div>

            {/* Title & Desc */}
            <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight mb-1.5">{course.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                    {course.description || 'Tidak ada deskripsi tersedia.'}
                </p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                <span className="flex items-center gap-1.5">
                    <UserCheck size={14} />
                    {course.teacher.name}
                </span>
                <span className="flex items-center gap-1.5">
                    <Users size={14} />
                    {course._count.enrollments} peserta
                </span>
            </div>

            {/* Error feedback */}
            {feedback && (
                <p className="text-xs text-red-500 dark:text-red-400 -mt-1">{feedback}</p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2">
                {optimisticEnrolled && (
                    <Link
                        href={`/courses/${course.id}`}
                        className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-blue-600 text-white shadow-[0_6px_16px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.25)] hover:shadow-[0_8px_20px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.35)] hover:-translate-y-0.5 transition-all"
                    >
                        <PlayCircle size={16} /> Buka Kursus <ChevronRight size={14} />
                    </Link>
                )}
                <button
                    onClick={handleToggle}
                    disabled={isPending}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60
                        ${optimisticEnrolled
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 text-xs'
                            : 'bg-blue-600 text-white shadow-[0_6px_16px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.2)] hover:shadow-[0_8px_20px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.3)] hover:-translate-y-0.5'
                        }`}
                >
                    {isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : optimisticEnrolled ? (
                        'Batalkan Pendaftaran'
                    ) : (
                        <><UserPlus size={16} /> Daftar Kursus Ini</>
                    )}
                </button>
            </div>
        </div>
    );
}
