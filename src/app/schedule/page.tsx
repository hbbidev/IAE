import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    let schedules: any[] = [];

    if (role === 'STUDENT') {
        // Siswa: jadwal dari kursus yang diikuti
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        schedules: true,
                        teacher: { select: { name: true } }
                    }
                }
            }
        });
        schedules = enrollments.flatMap(e =>
            e.course.schedules.map((s: any) => ({
                ...s,
                courseName: e.course.title,
                teacherName: e.course.teacher.name,
            }))
        );
    } else if (role === 'TEACHER') {
        // Guru: jadwal dari kursus yang diajar
        const courses = await prisma.course.findMany({
            where: { teacherId: userId },
            include: {
                schedules: true,
                teacher: { select: { name: true } }
            }
        });
        schedules = courses.flatMap(c =>
            c.schedules.map((s: any) => ({
                ...s,
                courseName: c.title,
                teacherName: c.teacher.name,
            }))
        );
    } else {
        // Admin: semua jadwal
        const allSchedules = await prisma.schedule.findMany({
            include: {
                course: {
                    include: { teacher: { select: { name: true } } }
                }
            }
        });
        schedules = allSchedules.map(s => ({
            ...s,
            courseName: s.course.title,
            teacherName: s.course.teacher.name,
        }));
    }

    // Sort by day then start time
    schedules.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

    return <ScheduleClient schedules={schedules} userRole={role} />;
}
