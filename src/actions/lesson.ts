"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function verifyTeacher(courseId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return null
  const role = (session.user as any).role
  const userId = (session.user as any).id
  if (role === 'ADMIN') return session
  if (role !== 'TEACHER') return null
  // verify this teacher owns the course
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.teacherId !== userId) return null
  return session
}

export async function createLesson(prevState: any, data: FormData) {
  try {
    const courseId = data.get('courseId') as string
    const session = await verifyTeacher(courseId)
    if (!session) return { error: 'Akses Ditolak' }

    const title = data.get('title') as string
    const content = data.get('content') as string
    const videoUrl = data.get('videoUrl') as string

    if (!title || !content) return { error: 'Judul dan konten wajib diisi' }

    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    })
    const order = (lastLesson?.order ?? 0) + 1

    await prisma.lesson.create({
      data: { title, content, videoUrl: videoUrl || null, order, courseId }
    })

    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true, message: 'Materi berhasil dibuat!' }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateLesson(prevState: any, data: FormData) {
  try {
    const id = data.get('id') as string
    const courseId = data.get('courseId') as string
    const session = await verifyTeacher(courseId)
    if (!session) return { error: 'Akses Ditolak' }

    await prisma.lesson.update({
      where: { id },
      data: {
        title: data.get('title') as string,
        content: data.get('content') as string,
        videoUrl: (data.get('videoUrl') as string) || null,
      }
    })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true, message: 'Materi diperbarui!' }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteLesson(id: string, courseId: string) {
  try {
    const session = await verifyTeacher(courseId)
    if (!session) return { error: 'Akses Ditolak' }
    await prisma.lesson.delete({ where: { id } })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
