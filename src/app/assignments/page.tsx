import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, CheckCircle2, AlertCircle, Clock, Star, BookOpen } from "lucide-react";
import StatCard from "@/components/StatCard";

export default async function AssignmentsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const userId = (session.user as any).id;

    // Fetch semua tugas dari kursus yang diikuti siswa
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                include: {
                    assignments: {
                        orderBy: { dueDate: 'asc' },
                        include: {
                            submissions: {
                                where: { userId },
                                select: { id: true, score: true, feedback: true, submittedAt: true }
                            }
                        }
                    }
                }
            }
        }
    });

    // Flatten semua tugas dari semua kursus
    const allAssignments = enrollments.flatMap(e =>
        e.course.assignments.map(a => ({
            ...a,
            courseName: e.course.title,
            courseId: e.course.id,
            mySubmission: a.submissions[0] ?? null
        }))
    ).sort((a, b) => {
        // Belum dikumpulkan dulu, lalu berdasarkan tenggat
        if (!a.mySubmission && b.mySubmission) return -1;
        if (a.mySubmission && !b.mySubmission) return 1;
        if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return 0;
    });

    const total = allAssignments.length;
    const submitted = allAssignments.filter(a => a.mySubmission).length;
    const graded = allAssignments.filter(a => a.mySubmission?.score !== null && a.mySubmission?.score !== undefined).length;
    const pending = total - submitted;

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header (ByeWind minimalist styling) */}
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#FFF4DE] dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                    <ClipboardList size={24} />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Daftar Tugas</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{pending} tugas belum dikumpulkan dari {total} total tugas</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Belum Dikumpulkan" value={pending} color="amber" trend="neutral" trendValue="0.0%" />
                <StatCard title="Sudah Dikumpulkan" value={submitted} color="blue" trend="neutral" trendValue="0.0%" />
                <StatCard title="Sudah Dinilai" value={graded} color="emerald" trend="neutral" trendValue="0.0%" />
                <StatCard title="Total Tugas" value={total} color="purple" trend="neutral" trendValue="0.0%" />
            </div>

            {/* Assignment List */}
            {total === 0 ? (
                <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-12 text-slate-400">
                    <ClipboardList size={32} className="mb-3 opacity-20 text-slate-500" />
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Tidak Ada Tugas</p>
                    <p className="text-xs text-slate-500 mt-1">Daftar ke kursus terlebih dahulu untuk melihat tugas dari guru.</p>
                    <Link href="/courses" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors">Lihat Katalog Kursus</Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {allAssignments.map(assignment => {
                        const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
                        const submitted = !!assignment.mySubmission;
                        const graded = submitted && assignment.mySubmission?.score !== null && assignment.mySubmission?.score !== undefined;

                        return (
                            <Link
                                key={assignment.id}
                                href={`/courses/${assignment.courseId}?tab=tugas`}
                                className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 hover-lift group block"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                        ${graded ? 'bg-[#DCFCE7] dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                            : submitted ? 'bg-[#E0F2FE] dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                                            : 'bg-[#FFF4DE] dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                                        }`}>
                                        {graded ? <Star size={16} /> : submitted ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{assignment.title}</p>
                                        <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1"><BookOpen size={11} /> {assignment.courseName}</span>
                                            {assignment.dueDate && (
                                                <span className={`text-[10px] font-bold flex items-center gap-1 ${isOverdue && !submitted ? 'text-red-500' : 'text-slate-400'}`}>
                                                    <Clock size={11} />
                                                    {new Date(assignment.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {graded ? (
                                        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-[#DCFCE7] dark:bg-emerald-950/20 px-2.5 py-1 rounded-xl">
                                            {assignment.mySubmission.score}/{assignment.maxScore}
                                        </span>
                                    ) : submitted ? (
                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-[#E0F2FE] dark:bg-blue-950/20 px-2.5 py-1 rounded-xl">Menunggu Nilai</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-[#FFF4DE] dark:bg-amber-950/20 px-2.5 py-1 rounded-xl">Kumpulkan →</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
