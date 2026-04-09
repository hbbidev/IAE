import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserManagementClient from "./UserManagementClient";

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);
    
    // Proteksi Rute: Hanya Admin!
    if (!session || (session.user as any).role !== 'ADMIN') {
        redirect("/");
    }

    // Ambil semua daftar pengguna dari database untuk dikelola Admin
    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            name: true,
            email: true,
            nim: true,
            role: true,
            createdAt: true
        }
    });

    return <UserManagementClient users={users} />;
}
