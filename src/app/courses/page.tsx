import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseCatalogClient from "./CourseCatalogClient";

export default async function CoursesPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Admin go to their own course management
    if (role === 'ADMIN') redirect('/admin/courses');

    // Get all courses with enrollment status for this user
    const courses = await prisma.course.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            teacher: { select: { name: true } },
            _count: { select: { enrollments: true, lessons: true } },
            enrollments: {
                where: { userId },
                select: { userId: true }
            }
        }
    });

    const coursesWithStatus = courses.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        teacher: c.teacher,
        _count: c._count,
        enrolled: c.enrollments.length > 0
    }));

    return <CourseCatalogClient courses={coursesWithStatus} />;
}
