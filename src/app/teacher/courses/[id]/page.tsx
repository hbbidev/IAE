import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";
import mysql from "mysql2/promise";

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

    // Fetch attendance from SIAKAd database
    let attendances = [];
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'db_percik_integrasi',
            port: 3306
        });

        const [rows] = await connection.execute(
            `SELECT a.id, a.user_id, a.attendance_date, a.status, a.is_verified, a.created_at, u.name as student_name, u.email as student_email 
             FROM attendances a 
             JOIN users u ON a.user_id = u.id 
             WHERE a.course_id = ? 
             ORDER BY a.attendance_date DESC`,
            [course.id]
        );
        attendances = rows as any[];
        await connection.end();
    } catch(e) {
        console.error("Failed to fetch attendances", e);
    }

    return <CourseDetailClient course={course} attendances={attendances} />;
}
