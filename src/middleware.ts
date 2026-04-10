import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Jika user sudah login tapi MFA belum diverifikasi
        // → paksa ke halaman /verify-mfa
        if (token?.mfaPending && path !== "/verify-mfa") {
            return NextResponse.redirect(new URL("/verify-mfa", req.url));
        }

        // Jika user sudah verif MFA tapi masih di /verify-mfa → redirect ke home
        if (!token?.mfaPending && path === "/verify-mfa") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

// Protect all routes except auth pages, api, static files
export const config = {
    matcher: [
        "/",
        "/verify-mfa",
        "/courses/:path*",
        "/grades/:path*",
        "/finance/:path*",
        "/schedule/:path*",
        "/settings/:path*",
        "/assignments/:path*",
        "/notifications/:path*",
        "/teacher/:path*",
        "/admin/:path*",
    ],
};
