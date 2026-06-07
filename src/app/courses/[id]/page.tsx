import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import StudentCourseDetailClient from "./StudentCourseDetailClient";

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const userId = (session.user as any).id;

    // Pastikan siswa sudah terdaftar di kursus ini
    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: id } }
    });
    if (!enrollment) redirect("/courses");

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            teacher: { select: { name: true } },
            weekModules: { orderBy: { weekNumber: 'asc' } },
            lessons: {
                orderBy: { order: 'asc' },
                include: {
                    weekModule: { select: { id: true, weekNumber: true, title: true } }
                }
            },
            assignments: {
                orderBy: { createdAt: 'desc' },
                include: {
                    weekModule: { select: { id: true, weekNumber: true, title: true } },
                    submissions: {
                        where: { userId },
                        select: { id: true, content: true, fileUrl: true, score: true, feedback: true, submittedAt: true }
                    }
                }
            },
            quizzes: {
                where: { isPublished: true },
                orderBy: { createdAt: 'desc' },
                include: {
                    weekModule: { select: { id: true, weekNumber: true, title: true } },
                    questions: {
                        orderBy: { order: 'asc' },
                        select: { id: true, text: true, type: true, options: true, points: true, order: true }
                        // Note: correctAnswer is intentionally excluded from student view
                    },
                    attempts: {
                        where: { userId },
                        include: {
                            answers: {
                                include: {
                                    question: { select: { type: true } }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!course) notFound();

    const courseData = {
        ...course,
        assignments: course.assignments.map(a => ({
            ...a,
            mySubmission: a.submissions[0] ?? null
        })),
        quizzes: course.quizzes.map(q => ({
            ...q,
            myAttempt: q.attempts[0] ?? null
        }))
    };

    return <StudentCourseDetailClient course={courseData} />;
}
