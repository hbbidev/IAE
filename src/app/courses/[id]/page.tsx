import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchBackend } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import StudentCourseDetailClient from "./StudentCourseDetailClient";

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const token = (session.user as any).accessToken;

    let data: any = null;
    try {
        data = await fetchBackend(`/courses/${id}`, token);
    } catch (e: any) {
        console.error("Failed to fetch course detail or student not enrolled", e);
        redirect("/courses");
    }

    if (!data || !data.course) notFound();

    const courseData = {
        ...data.course,
        lessons: data.lessons ?? [],
        weekModules: data.weekModules ?? [],
        assignments: (data.assignments ?? []).map((a: any) => ({
            ...a,
            mySubmission: a.submissions?.[0] ?? null
        })),
        quizzes: (data.quizzes ?? []).map((q: any) => ({
            ...q,
            myAttempt: q.attempts?.[0] ?? null
        }))
    };

    return <StudentCourseDetailClient course={courseData} />;
}
