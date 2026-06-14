import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchBackend } from "@/lib/api";
import { redirect } from "next/navigation";
import CourseCatalogClient from "./CourseCatalogClient";

export default async function CoursesPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const role = (session.user as any).role;
    const token = (session.user as any).accessToken;

    // Admin go to their own course management
    if (role === 'ADMIN') redirect('/admin/courses');

    let coursesRaw: any[] = [];
    try {
        coursesRaw = await fetchBackend("/courses?all=true", token);
    } catch (e) {
        console.error("Failed to fetch student catalog from backend", e);
    }

    const coursesWithStatus = coursesRaw.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        teacher: { name: c.teacher_name },
        _count: {
            enrollments: c.enrollments_count ?? 0,
            lessons: c.lessons_count ?? 0
        },
        enrolled: c.enrolled
    }));

    return <CourseCatalogClient courses={coursesWithStatus} />;
}
