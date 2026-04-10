import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import * as OTPAuth from "otpauth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { code } = await req.json();

    if (!code || code.length !== 6) {
        return NextResponse.json({ error: "Kode tidak valid" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totpSecret: true, totpEnabled: true, email: true },
    });

    if (!user?.totpEnabled || !user.totpSecret) {
        return NextResponse.json({ error: "MFA tidak aktif" }, { status: 400 });
    }

    const totp = new OTPAuth.TOTP({
        issuer: "pErC lms",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
        return NextResponse.json({ error: "Kode salah. Coba lagi." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
