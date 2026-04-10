import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                nim: { label: "Identifier / ID Pengguna", type: "text" },
                password: { label: "Kata Sandi", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.nim || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { nim: credentials.nim }
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    nim: user.nim,
                    role: user.role,
                    // Jika MFA aktif, tandai session sebagai pending MFA
                    mfaPending: user.totpEnabled ? true : false,
                } as any;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial login
            if (user) {
                token.nim = (user as any).nim;
                token.id = user.id;
                token.role = (user as any).role;
                token.mfaPending = (user as any).mfaPending ?? false;
            }
            // Saat session.update() dipanggil dari klien (setelah verif MFA)
            if (trigger === "update" && session?.mfaVerified === true) {
                token.mfaPending = false;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session.user as any).nim = token.nim;
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).mfaPending = token.mfaPending;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
