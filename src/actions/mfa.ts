"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as OTPAuth from "otpauth";

// Generate TOTP secret baru + return URI untuk QR Code
export async function generateTotpSetup() {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User tidak ditemukan" };

    // Buat TOTP secret baru
    const totp = new OTPAuth.TOTP({
        issuer: "pErC lms",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: new OTPAuth.Secret({ size: 20 }),
    });

    const secret = totp.secret.base32;
    const uri = totp.toString();

    // Simpan secret sementara (belum aktif sampai diverifikasi)
    await prisma.user.update({
        where: { id: userId },
        data: { totpSecret: secret }
    });

    return { secret, uri };
}

// Verifikasi kode TOTP dan aktifkan MFA
export async function verifyAndEnableTotp(code: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpSecret) return { error: "Setup MFA belum dimulai" };

    const totp = new OTPAuth.TOTP({
        issuer: "pErC lms",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) return { error: "Kode salah. Coba lagi." };

    await prisma.user.update({
        where: { id: userId },
        data: { totpEnabled: true }
    });

    revalidatePath("/settings");
    return { success: true };
}

// Nonaktifkan MFA
export async function disableTotp(code: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpSecret || !user.totpEnabled) return { error: "MFA tidak aktif" };

    const totp = new OTPAuth.TOTP({
        issuer: "pErC lms",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) return { error: "Kode salah. MFA tidak dinonaktifkan." };

    await prisma.user.update({
        where: { id: userId },
        data: { totpEnabled: false, totpSecret: null }
    });

    revalidatePath("/settings");
    return { success: true };
}

// Get MFA status
export async function getMfaStatus() {
    const session = await getServerSession(authOptions);
    if (!session) return { enabled: false };

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totpEnabled: true }
    });

    return { enabled: user?.totpEnabled ?? false };
}
