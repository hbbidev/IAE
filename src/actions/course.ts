"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function createCourse(prevState: any, data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') return { error: 'Akses Ditolak' }

    const title = data.get('title') as string
    const description = data.get('description') as string
    const teacherId = data.get('teacherId') as string

    if (!title || !teacherId) return { error: 'Judul Kursus dan Pengajar wajib diisi' }

    await prisma.course.create({
      data: {
        title,
        description: description || null,
        teacherId
      }
    })

    revalidatePath('/admin/courses')
    return { success: true, message: 'Berhasil membuat kursus baru!' }
  } catch (err: any) {
    return { error: 'Kesalahan saat menyimpan: ' + err.message }
  }
}

export async function updateCourse(prevState: any, data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') return { error: 'Akses Ditolak' }

    const id = data.get('id') as string
    const title = data.get('title') as string
    const description = data.get('description') as string
    const teacherId = data.get('teacherId') as string

    if (!id || !title || !teacherId) return { error: 'Validasi gagal' }

    await prisma.course.update({
      where: { id },
      data: { title, description: description || null, teacherId }
    })
    
    revalidatePath('/admin/courses')
    return { success: true, message: 'Berhasil memperbarui kursus!' }
  } catch (err: any) {
    return { error: 'Kesalahan saat memperbarui: ' + err.message }
  }
}

export async function deleteCourse(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') return { error: 'Akses Ditolak' }

    await prisma.course.delete({ where: { id } })
    revalidatePath('/admin/courses')
    return { success: true }
  } catch (err: any) {
    return { error: 'Gagal menghapus: ' + err.message }
  }
}

export async function getMyEnrolledOrTaughtCourses() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return { error: 'Tidak terautentikasi' }

    const { id: userId, role } = session.user as any

    if (role === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: { id: true, title: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return { success: true, courses: enrollments.map(e => e.course) }
    } else if (role === 'TEACHER') {
      const courses = await prisma.course.findMany({
        where: { teacherId: userId },
        select: { id: true, title: true },
        orderBy: { createdAt: 'desc' }
      })
      return { success: true, courses }
    } else {
      const courses = await prisma.course.findMany({
        select: { id: true, title: true },
        orderBy: { createdAt: 'desc' }
      })
      return { success: true, courses }
    }
  } catch (err: any) {
    return { error: 'Gagal memuat kursus: ' + err.message }
  }
}
