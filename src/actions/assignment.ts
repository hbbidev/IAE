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
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.teacherId !== userId) return null
  return session
}

export async function createAssignment(prevState: any, data: FormData) {
  try {
    const courseId = data.get('courseId') as string
    const session = await verifyTeacher(courseId)
    if (!session) return { error: 'Akses Ditolak' }

    const title = data.get('title') as string
    const description = data.get('description') as string
    const dueDateStr = data.get('dueDate') as string
    const maxScore = parseInt(data.get('maxScore') as string) || 100

    if (!title) return { error: 'Judul tugas wajib diisi' }

    await prisma.assignment.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        maxScore,
        courseId
      }
    })

    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true, message: 'Tugas berhasil dibuat!' }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateAssignment(prevState: any, data: FormData) {
  try {
    const id = data.get('id') as string
    const courseId = data.get('courseId') as string
    const session = await verifyTeacher(courseId)
    if (!session) return { error: 'Akses Ditolak' }

    const dueDateStr = data.get('dueDate') as string

    await prisma.assignment.update({
      where: { id },
      data: {
        title: data.get('title') as string,
        description: (data.get('description') as string) || null,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        maxScore: parseInt(data.get('maxScore') as string) || 100,
      }
    })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true, message: 'Tugas diperbarui!' }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteAssignment(id: string, courseId: string) {
  try {
    const session = await verifyTeacher(courseId)
    if (!session) return { error: 'Akses Ditolak' }
    await prisma.assignment.delete({ where: { id } })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function gradeSubmission(submissionId: string, score: number, feedback: string, courseId: string) {
  try {
    const session = await verifyTeacher(courseId)
    if (!session) return { error: 'Akses Ditolak' }

    await prisma.submission.update({
      where: { id: submissionId },
      data: { score, feedback: feedback || null }
    })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true, message: 'Nilai berhasil disimpan!' }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Students can submit assignments
export async function submitAssignment(assignmentId: string, content: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return { error: 'Tidak terautentikasi' }
    const userId = (session.user as any).id

    const existing = await prisma.submission.findUnique({
      where: { assignmentId_userId: { assignmentId, userId } }
    })

    if (existing) {
      // Update existing submission
      await prisma.submission.update({
        where: { assignmentId_userId: { assignmentId, userId } },
        data: { content }
      })
    } else {
      await prisma.submission.create({
        data: { assignmentId, userId, content }
      })
    }

    revalidatePath('/assignments')
    return { success: true, message: 'Tugas berhasil dikumpulkan!' }
  } catch (err: any) {
    return { error: err.message }
  }
}
