import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import TeacherDashboard from "@/components/dashboards/TeacherDashboard";
import StudentDashboard from "@/components/dashboards/StudentDashboard";

export default async function Home() {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        redirect("/login");
    }

    const { role, id, name } = session.user as any;

    if (role === 'ADMIN') {
        const totalUsers = await prisma.user.count();
        const totalCourses = await prisma.course.count();
        return <AdminDashboard name={name} totalUsers={totalUsers} totalCourses={totalCourses} />;
    } else if (role === 'TEACHER') {
        const courses = await prisma.course.findMany({ 
            where: { teacherId: id }, 
            include: { _count: { select: { enrollments: true } } }
        });
        return <TeacherDashboard name={name} courses={courses} />;
    } else {
        const enrollments = await prisma.enrollment.findMany({ 
            where: { userId: id }, 
            include: { course: true }
        });

        // Ambil upcoming assignments (belum dikumpulkan, deadline belum lewat atau ada)
        const upcomingAssignments = await prisma.assignment.findMany({
            where: {
                course: { enrollments: { some: { userId: id } } },
                NOT: { submissions: { some: { userId: id } } },
            },
            orderBy: { dueDate: 'asc' },
            take: 5,
            include: { course: { select: { id: true, title: true } } },
        });

        // Ambil upcoming quizzes (published, belum dikerjakan, deadline belum lewat)
        const upcomingQuizzes = await prisma.quiz.findMany({
            where: {
                isPublished: true,
                course: { enrollments: { some: { userId: id } } },
                NOT: { attempts: { some: { userId: id } } },
                OR: [
                    { deadline: null },
                    { deadline: { gt: new Date() } },
                ],
            },
            orderBy: { deadline: 'asc' },
            take: 5,
            include: { course: { select: { id: true, title: true } } },
        });

        // Gabung & sort berdasarkan deadline
        const upcomingItems = [
            ...upcomingAssignments.map(a => ({
                id: a.id,
                title: a.title,
                courseName: a.course.title,
                courseId: a.course.id,
                deadline: a.dueDate,
                type: 'assignment' as const,
            })),
            ...upcomingQuizzes.map(q => ({
                id: q.id,
                title: q.title,
                courseName: q.course.title,
                courseId: q.course.id,
                deadline: q.deadline,
                type: 'quiz' as const,
            })),
        ].sort((a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }).slice(0, 6);

        return <StudentDashboard name={name} enrollments={enrollments} upcomingItems={upcomingItems} />;
    }
}
