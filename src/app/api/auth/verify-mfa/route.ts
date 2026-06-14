import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const isServer = typeof window === 'undefined';
const BACKEND_URL = isServer 
    ? (process.env.INTERNAL_API_URL || "http://127.0.0.1:8080/api")
    : (process.env.NEXT_PUBLIC_API_URL || "https://api-percik.hbii.my.id/api");

export async function POST(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only" });
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || code.length !== 6) {
        return NextResponse.json({ error: "Kode tidak valid" }, { status: 400 });
    }

    const email = token.email;
    const password = token.tempPassword as string;

    if (!email || !password) {
        return NextResponse.json({ error: "Sesi login tidak valid" }, { status: 400 });
    }

    try {
        const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password,
                totp_code: code
            })
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Kode salah. Coba lagi." }, { status: 400 });
        }

        // Return the final JWT access token so the frontend can update the session
        return NextResponse.json({ success: true, accessToken: data.token });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Gagal menghubungi server" }, { status: 500 });
    }
}
