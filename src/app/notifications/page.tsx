import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, BookOpen, ClipboardList, CheckSquare, Clock, GraduationCap } from "lucide-react";

export default async function NotificationsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Ambil activity terbaru: tugas baru, nilai masuk, quiz baru
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                include: {
                    assignments: { orderBy: { createdAt: 'desc' }, take: 5 },
                    quizzes: { where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 5 },
                }
            }
        },
        take: 10
    });

    // Nilai yang baru masuk (submission dengan score yg baru di-set)
    const gradedSubmissions = await prisma.submission.findMany({
        where: { userId, score: { not: null } },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
            assignment: { include: { course: { select: { id: true, title: true } } } }
        }
    });

    type Notification = {
        id: string;
        type: 'assignment' | 'quiz' | 'grade' | 'enrollment';
        title: string;
        description: string;
        time: Date;
        href: string;
        icon: any;
        color: string;
    };

    const notifications: Notification[] = [];

    // Tugas baru
    enrollments.forEach(e => {
        e.course.assignments.slice(0, 3).forEach(a => {
            notifications.push({
                id: `a-${a.id}`,
                type: 'assignment',
                title: `Tugas Baru: ${a.title}`,
                description: `Kursus: ${e.course.title}${a.dueDate ? ` · Tenggat: ${new Date(a.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` : ''}`,
                time: a.createdAt,
                href: `/courses/${e.course.id}?tab=tugas`,
                icon: ClipboardList,
                color: 'amber',
            });
        });
        e.course.quizzes.slice(0, 3).forEach(q => {
            notifications.push({
                id: `q-${q.id}`,
                type: 'quiz',
                title: `Quiz Tersedia: ${q.title}`,
                description: `Kursus: ${e.course.title}${q.deadline ? ` · Tutup: ${new Date(q.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` : ''}`,
                time: q.createdAt,
                href: `/courses/${e.course.id}?tab=quiz`,
                icon: CheckSquare,
                color: 'indigo',
            });
        });
    });

    // Nilai masuk
    gradedSubmissions.forEach(s => {
        notifications.push({
            id: `g-${s.id}`,
            type: 'grade',
            title: `Tugas Dinilai: ${s.assignment.title}`,
            description: `${s.assignment.course.title} · Skor: ${s.score}/${s.assignment.maxScore}`,
            time: s.updatedAt,
            href: `/courses/${s.assignment.course.id}?tab=tugas`,
            icon: GraduationCap,
            color: 'blue',
        });
    });

    // Sort by time
    notifications.sort((a, b) => b.time.getTime() - a.time.getTime());

    const colorMap: Record<string, string> = {
        amber: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
        indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
        blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 accent-tint accent-text rounded-2xl shadow-sm">
                    <Bell size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Notifikasi</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{notifications.length} aktivitas terbaru</p>
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="flex-1 glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-12 text-slate-400">
                    <Bell size={40} className="mb-3 opacity-30" />
                    <p className="font-medium text-lg">Tidak ada notifikasi</p>
                    <p className="text-sm mt-1">Semua aktivitas kursus Anda akan muncul di sini.</p>
                    <Link href="/courses" className="mt-6 px-5 py-2.5 accent-bg text-white rounded-xl font-semibold text-sm transition-colors">
                        Lihat Katalog Kursus
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map(notif => {
                        const Icon = notif.icon;
                        const timeAgo = (() => {
                            const diff = Date.now() - notif.time.getTime();
                            const mins = Math.floor(diff / 60000);
                            const hrs = Math.floor(diff / 3600000);
                            const days = Math.floor(diff / 86400000);
                            if (days > 0) return `${days} hari lalu`;
                            if (hrs > 0) return `${hrs} jam lalu`;
                            if (mins > 0) return `${mins} mnt lalu`;
                            return 'Baru saja';
                        })();

                        return (
                            <Link
                                key={notif.id}
                                href={notif.href}
                                className="glass-panel rounded-2xl p-4 flex items-center gap-4 hover-lift group block"
                            >
                                <div className={`w-11 h-11 rounded-2xl ${colorMap[notif.color]} flex items-center justify-center shrink-0`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">{notif.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 truncate">{notif.description}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                                    <Clock size={11} />
                                    {timeAgo}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
