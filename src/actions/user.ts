"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function createUser(prevState: any, data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return { error: 'Akses Ditolak: Anda bukan Administrator' }
    }

    const name = data.get('name') as string
    const email = data.get('email') as string
    const nim = data.get('nim') as string
    const password = data.get('password') as string
    const role = data.get('role') as string

    if (!name || !nim || !password || !role) {
      return { error: 'Nama, ID, Kata Sandi, dan Peran wajib diisi' }
    }

    // Cek apakah ID sudah dipakai
    const existingUser = await prisma.user.findUnique({
      where: { nim }
    })

    if (existingUser) {
      return { error: 'ID Pengguna / NIM ini sudah terdaftar' }
    }

    // Enkripsi kata sandi
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat User Baru
    await prisma.user.create({
      data: {
        name,
        email: email || `${nim}@lms.local`,
        nim,
        password: hashedPassword,
        // @ts-ignore - abaikan error tipe dari prisma client usang
        role: role
      }
    })

    revalidatePath('/admin/users')
    return { success: true, message: 'Berhasil menambahkan pengguna baru!' }
  } catch (err: any) {
    console.error("Create User Error:", err)
    return { error: 'Terjadi kesalahan sistem: ' + err.message }
  }
}

export async function updateUser(prevState: any, data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') return { error: 'Akses Ditolak' }

    const id = data.get('id') as string
    const name = data.get('name') as string
    const email = data.get('email') as string
    const nim = data.get('nim') as string
    const role = data.get('role') as string
    const password = data.get('password') as string

    if (!id || !name || !nim || !role) return { error: 'Informasi utama wajib diisi' }

    const updateData: any = { name, email: email || `${nim}@lms.local`, nim, role: role as any }
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    })
    
    revalidatePath('/admin/users')
    return { success: true, message: 'Berhasil diperbarui!' }
  } catch (err: any) {
    return { error: 'Gagal memperbarui: ' + err.message }
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') return { error: 'Akses Ditolak' }

    await prisma.user.delete({ where: { id } })
    revalidatePath('/admin/users')
    return { success: true }
  } catch (err: any) {
    return { error: 'Gagal menghapus: ' + err.message }
  }
}
