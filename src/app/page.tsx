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
        // Default to STUDENT view
        const enrollments = await prisma.enrollment.findMany({ 
            where: { userId: id }, 
            include: { course: true }
        });
        return <StudentDashboard name={name} enrollments={enrollments} />;
    }
}
