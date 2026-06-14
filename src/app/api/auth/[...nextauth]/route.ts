import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";

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
                        const res = await fetch("https://api-percik.hbii.my.id/api/auth/me", {
                            headers: {
                                "Authorization": `Bearer ${credentials.qrJwt}`
                            }
                        });
                        if (!res.ok) throw new Error("Sesi QR tidak valid");
                        const user = await res.json();
                        
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            nim: user.nim,
                            role: user.role,
                            accessToken: credentials.qrJwt,
                            mfaPending: false,
                        } as any;
                    } catch (e: any) {
                        throw new Error(e.message || "Invalid QR token");
                    }
                }

                if (!credentials?.nim || !credentials?.password) {
                    throw new Error("ID Pengguna dan kata sandi wajib diisi");
                }

                try {
                    const res = await fetch("https://api-percik.hbii.my.id/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.nim,
                            password: credentials.password
                        })
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        if (data.error === "mfa_required" && data.user) {
                            return {
                                id: data.user.id,
                                name: data.user.name,
                                email: data.user.email,
                                nim: data.user.nim,
                                role: data.user.role,
                                mfaPending: true,
                                tempPassword: credentials.password,
                            } as any;
                        }
                        throw new Error(data.message || "ID Pengguna atau Kata Sandi salah");
                    }

                    return {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        nim: data.user.nim,
                        role: data.user.role,
                        accessToken: data.token,
                        mfaPending: false,
                    } as any;
                } catch (e: any) {
                    throw new Error(e.message || "Gagal menghubungkan ke server");
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const res = await fetch("https://api-percik.hbii.my.id/api/auth/google-login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_token: account.id_token })
                    });

                    if (!res.ok) return false;
                    const data = await res.json();

                    (user as any).id = data.user.id;
                    (user as any).role = data.user.role;
                    (user as any).nim = data.user.nim;
                    (user as any).accessToken = data.token;
                    (user as any).mfaPending = false;
                } catch (e) {
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.nim = (user as any).nim;
                token.role = (user as any).role;
                token.mfaPending = (user as any).mfaPending ?? false;
                token.accessToken = (user as any).accessToken;
                token.tempPassword = (user as any).tempPassword;
            }

            if (trigger === "update" && session?.mfaVerified === true) {
                token.mfaPending = false;
                token.accessToken = session.accessToken;
                delete token.tempPassword;
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
                (session.user as any).accessToken = token.accessToken;
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
