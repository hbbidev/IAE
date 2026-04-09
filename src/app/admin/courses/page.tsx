import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseManagementClient from "./CourseManagementClient";

export default async function AdminCoursesPage() {
    const session = await getServerSession(authOptions);
    
    // Proteksi Rute Admin
    if (!session || (session.user as any).role !== 'ADMIN') {
        redirect("/");
    }

    // Ambil Data Kursus Termasuk Relasi Relasional Guru
    const courses = await prisma.course.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            teacher: {
                select: {
                    id: true,
                    name: true
                }
            },
            enrollments: {
                include: {
                    user: {
                        select: { name: true, nim: true }
                    }
                }
            }
        }
    });

    // Ambil Semua Pengguna Yang Memiliki Jabatan 'TEACHER' Untuk Menu Dropdown
    const teachers = await prisma.user.findMany({
        where: { role: 'TEACHER' },
        select: {
            id: true,
            name: true,
            nim: true
        },
        orderBy: { name: 'asc' }
    });

    // Ambil semua siswa untuk panel enroll
    const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true, name: true, nim: true },
        orderBy: { name: 'asc' }
    });

    return <CourseManagementClient courses={courses} teachers={teachers} students={students} />;
}
