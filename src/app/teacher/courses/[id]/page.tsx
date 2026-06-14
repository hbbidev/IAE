import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchBackend } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";

export default async function TeacherCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const token = (session.user as any).accessToken;

    let data: any = null;
    let attendanceRecords: any[] = [];

    try {
        data = await fetchBackend(`/courses/${id}`, token);
        attendanceRecords = await fetchBackend(`/courses/${id}/attendance`, token);
    } catch (e: any) {
        console.error("Failed to fetch course details from backend", e);
        notFound();
    }

    if (!data || !data.course) notFound();

    // Only teacher of this course or admin can access
    if (role !== 'ADMIN' && data.course.teacherId !== userId) redirect("/");

    const courseData = {
        ...data.course,
        lessons: data.lessons ?? [],
        weekModules: data.weekModules ?? [],
        schedules: data.schedules ?? [],
        enrollments: data.enrollments ?? [],
        assignments: data.assignments ?? [],
        quizzes: data.quizzes ?? [],
    };

    const attendances = attendanceRecords.map((att: any) => ({
        id: att.id,
        user_id: att.user_id,
        attendance_date: att.date,
        status: att.status,
        is_verified: att.is_verified,
        created_at: att.created_at ?? att.date,
        student_name: att.student_name,
        student_email: att.student_email,
        location_name: att.location_name,
    }));

    return <CourseDetailClient course={courseData} attendances={attendances} />;
}
