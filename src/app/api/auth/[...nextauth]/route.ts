import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { AuthOptions } from "next-auth";
import { randomUUID } from "crypto";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                nim: { label: "Identifier / ID Pengguna", type: "text" },
                password: { label: "Kata Sandi", type: "password" },
                qrJwt: { label: "QR JWT Token", type: "text" }
            },
            async authorize(credentials) {
                if (credentials?.qrJwt) {
                    try {
                        const base64Url = credentials.qrJwt.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
                        const claims = JSON.parse(jsonPayload);
                        
                        const user = await prisma.user.findFirst({
                            where: { OR: [{ email: claims.sub }, { id: claims.lms_id }] }
                        });
                        
                        if (!user) throw new Error("User not found from QR token");
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            nim: user.nim,
                            role: user.role,
                            mfaPending: false,
                        } as any;
                    } catch (e) {
                        throw new Error("Invalid QR token");
                    }
                }

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
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                if (!user.email) return false;

                let dbUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                if (!dbUser) {
                            // Create new student user
                    const hashedPassword = await bcrypt.hash(randomUUID(), 10);
                    dbUser = await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "Google User",
                            password: hashedPassword,
                            role: "STUDENT",
                            nim: `g-${Date.now().toString().slice(-6)}` // Generate a basic nim
                        }
                    });
                }
                // Store DB properties on the user object so they flow to the JWT callback
                (user as any).id = dbUser.id;
                (user as any).role = dbUser.role;
                (user as any).nim = dbUser.nim;
                (user as any).mfaPending = false; // Bypass MFA for Google login by default, or customize
            }
            return true;
        },
        async jwt({ token, user, trigger, session, account }) {
            // Initial login
            if (user) {
                // For google users, values were added during signIn callback
                // For credential users, they come directly from authorize() return
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.nim = (user as any).nim;
                token.role = (user as any).role;
                token.mfaPending = (user as any).mfaPending ?? false;
            }

            // Handle dynamic updates (e.g. after MFA verification)
            if (trigger === "update" && session?.mfaVerified === true) {
                token.mfaPending = false;
            }
            
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session.user as any).id = token.id;
                (session.user as any).email = token.email;
                (session.user as any).name = token.name;
                (session.user as any).nim = token.nim;
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
