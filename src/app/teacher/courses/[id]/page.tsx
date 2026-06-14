import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";

export default async function TeacherCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            lessons: { orderBy: { order: 'asc' }, include: { weekModule: { select: { id: true, title: true, weekNumber: true } } } },
            weekModules: { orderBy: { weekNumber: 'asc' } },
            schedules: { orderBy: { dayOfWeek: 'asc' } },
            assignments: {
                orderBy: { createdAt: 'desc' },
                include: {
                    weekModule: { select: { id: true, weekNumber: true, title: true } },
                    submissions: {
                        include: {
                            user: { select: { id: true, name: true, nim: true } }
                        },
                        orderBy: { submittedAt: 'asc' }
                    }
                }
            },
            enrollments: {
                orderBy: { createdAt: 'asc' },
                include: {
                    user: { select: { id: true, name: true, nim: true } }
                }
            },
            quizzes: {
                orderBy: { createdAt: 'desc' },
                include: {
                    weekModule: { select: { id: true, weekNumber: true, title: true } },
                    questions: { orderBy: { order: 'asc' } },
                    attempts: {
                        include: {
                            user: { select: { id: true, name: true, nim: true } }
                        }
                    }
                }
            }
        }
    });

    if (!course) notFound();

    // Only teacher of this course or admin can access
    if (role !== 'ADMIN' && course.teacherId !== userId) redirect("/");

    // Fetch attendance from unified database via Prisma
    let attendances = [];
    try {
        const attendanceRecords = await prisma.attendance.findMany({
            where: { courseId: id },
            orderBy: { attendanceDate: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        attendances = attendanceRecords.map((att: any) => ({
            id: att.id,
            user_id: att.userId,
            attendance_date: att.attendanceDate,
            status: att.status,
            is_verified: att.isVerified,
            created_at: att.createdAt,
            student_name: att.user.name,
            student_email: att.user.email,
            location_name: att.locationName,
        }));
    } catch(e) {
        console.error("Failed to fetch attendances", e);
    }

    return <CourseDetailClient course={course} attendances={attendances} />;
}
