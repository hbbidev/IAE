"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function enrollStudent(courseId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return { error: 'Anda harus login terlebih dahulu' }

    const userId = (session.user as any).id

    // Cek sudah terdaftar belum
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    })
    if (existing) return { error: 'Anda sudah terdaftar di kursus ini' }

    await prisma.enrollment.create({
      data: { userId, courseId }
    })

    revalidatePath('/courses')
    revalidatePath('/')
    return { success: true, message: 'Berhasil mendaftar kursus!' }
  } catch (err: any) {
    return { error: 'Gagal mendaftar: ' + err.message }
  }
}

export async function unenrollStudent(courseId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return { error: 'Tidak terautentikasi' }

    const userId = (session.user as any).id

    await prisma.enrollment.delete({
      where: { userId_courseId: { userId, courseId } }
    })

    revalidatePath('/courses')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: 'Gagal membatalkan: ' + err.message }
  }
}

// For admin: enroll a specific student into a course
export async function adminEnrollStudent(studentId: string, courseId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') return { error: 'Akses Ditolak' }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: studentId, courseId } }
    })
    if (existing) return { error: 'Siswa sudah terdaftar di kursus ini' }

    await prisma.enrollment.create({
      data: { userId: studentId, courseId }
    })

    revalidatePath('/admin/courses')
    return { success: true, message: 'Siswa berhasil didaftarkan!' }
  } catch (err: any) {
    return { error: 'Gagal mendaftarkan: ' + err.message }
  }
}

export async function adminUnenrollStudent(studentId: string, courseId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') return { error: 'Akses Ditolak' }

    await prisma.enrollment.delete({
      where: { userId_courseId: { userId: studentId, courseId } }
    })

    revalidatePath('/admin/courses')
    return { success: true }
  } catch (err: any) {
    return { error: 'Gagal membatalkan: ' + err.message }
  }
}
