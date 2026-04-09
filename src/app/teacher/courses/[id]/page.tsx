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
            lessons: { orderBy: { order: 'asc' } },
            assignments: {
                orderBy: { createdAt: 'desc' },
                include: {
                    submissions: {
                        include: {
                            user: { select: { id: true, name: true, nim: true } }
                        }
                    }
                }
            },
            enrollments: {
                include: {
                    user: { select: { id: true, name: true, nim: true } }
                }
            },
            quizzes: {
                orderBy: { createdAt: 'desc' },
                include: {
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

    return <CourseDetailClient course={course} />;
}
