import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, ClipboardList, ChevronRight, Plus, Sparkles } from "lucide-react";

export default async function TeacherCoursesPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    
    const role = (session.user as any).role;
    if (role === 'STUDENT') redirect("/courses");
    if (role === 'ADMIN') redirect("/admin/courses");

    const teacherId = (session.user as any).id;
    const courses = await prisma.course.findMany({
        where: { teacherId },
        include: {
            _count: { select: { enrollments: true, lessons: true, assignments: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm">
                        <BookOpen size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Kursus Saya</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola materi, tugas, dan peserta kelas Anda</p>
                    </div>
                </div>
            </div>

            {courses.length === 0 ? (
                <div className="flex-1 glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-emerald-400">
                        <BookOpen size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Anda Belum Mengajar Kelas</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">Administrator belum menugaskan Anda ke kursus apapun. Hubungi admin untuk informasi lebih lanjut.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {courses.map(course => (
                        <Link
                            key={course.id}
                            href={`/teacher/courses/${course.id}`}
                            className="glass-panel rounded-3xl p-6 flex flex-col gap-5 hover-lift group transition-all duration-300 hover:ring-2 hover:ring-emerald-500/30"
                        >
                            {/* Icon + Title */}
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                    <Sparkles size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors shrink-0 mt-1" />
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <Users size={14} />
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{course._count.enrollments}</span>
                                    <span className="text-xs text-slate-500">Murid</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <BookOpen size={14} />
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{course._count.lessons}</span>
                                    <span className="text-xs text-slate-500">Materi</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <ClipboardList size={14} />
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{course._count.assignments}</span>
                                    <span className="text-xs text-slate-500">Tugas</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
