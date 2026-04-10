"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function getTeacher() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  const role = (session.user as any).role
  if (role !== 'TEACHER' && role !== 'ADMIN') return null
  return session.user as any
}

export async function createWeekModule(prevState: any, data: FormData) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return { error: 'Akses ditolak' }

    const courseId = data.get('courseId') as string
    const weekNumber = parseInt(data.get('weekNumber') as string)
    const title = (data.get('title') as string)?.trim()

    if (!courseId || !title || isNaN(weekNumber)) return { error: 'Data tidak lengkap' }

    await prisma.weekModule.create({
      data: { courseId, weekNumber, title }
    })

    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true, message: 'Minggu berhasil ditambahkan!' }
  } catch (err: any) {
    return { error: 'Gagal: ' + err.message }
  }
}

export async function updateWeekModule(prevState: any, data: FormData) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return { error: 'Akses ditolak' }

    const id = data.get('id') as string
    const courseId = data.get('courseId') as string
    const title = (data.get('title') as string)?.trim()
    const weekNumber = parseInt(data.get('weekNumber') as string)

    if (!id || !title) return { error: 'Data tidak lengkap' }

    await prisma.weekModule.update({ where: { id }, data: { title, weekNumber } })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true, message: 'Minggu diperbarui!' }
  } catch (err: any) {
    return { error: 'Gagal: ' + err.message }
  }
}

export async function deleteWeekModule(id: string, courseId: string) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return { error: 'Akses ditolak' }

    await prisma.weekModule.delete({ where: { id } })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (err: any) {
    return { error: 'Gagal: ' + err.message }
  }
}

// ─── Schedule ──────────────────────────────────────────────────────────────────

export async function createSchedule(prevState: any, data: FormData) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return { error: 'Akses ditolak' }

    const courseId = data.get('courseId') as string
    const dayOfWeek = parseInt(data.get('dayOfWeek') as string)
    const startTime = data.get('startTime') as string
    const endTime = data.get('endTime') as string
    const room = (data.get('room') as string)?.trim() || null
    const note = (data.get('note') as string)?.trim() || null

    if (!courseId || !startTime || !endTime || isNaN(dayOfWeek)) {
      return { error: 'Hari, jam mulai, dan jam selesai wajib diisi' }
    }

    await prisma.schedule.create({
      data: { courseId, dayOfWeek, startTime, endTime, room, note }
    })

    revalidatePath(`/teacher/courses/${courseId}`)
    revalidatePath('/schedule')
    return { success: true, message: 'Jadwal berhasil ditambahkan!' }
  } catch (err: any) {
    return { error: 'Gagal: ' + err.message }
  }
}

export async function deleteSchedule(id: string, courseId: string) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return { error: 'Akses ditolak' }

    await prisma.schedule.delete({ where: { id } })
    revalidatePath(`/teacher/courses/${courseId}`)
    revalidatePath('/schedule')
    return { success: true }
  } catch (err: any) {
    return { error: 'Gagal: ' + err.message }
  }
}

export async function getMySchedule(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          schedules: true,
          teacher: { select: { name: true } }
        }
      }
    }
  })

  // Flatten all schedules with course info
  return enrollments.flatMap(e =>
    e.course.schedules.map(s => ({
      ...s,
      courseName: e.course.title,
      teacherName: e.course.teacher.name,
    }))
  ).sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
}
