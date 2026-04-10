"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Shield, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { signOut } from "next-auth/react";

export default function VerifyMfaPage() {
    const { data: session, update, status } = useSession();
    const router = useRouter();
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Jika tidak ada mfaPending, redirect ke home
    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.replace("/login");
            return;
        }
        if (!(session.user as any).mfaPending) {
            router.replace("/");
        }
    }, [session, status, router]);

    const handleInput = (idx: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newCode = [...code];
        newCode[idx] = value;
        setCode(newCode);
        setError("");
        // Auto advance
        if (value && idx < 5) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setCode(pasted.split(""));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = () => {
        const fullCode = code.join("");
        if (fullCode.length !== 6) return;

        startTransition(async () => {
            setError("");
            const res = await fetch("/api/auth/verify-mfa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: fullCode }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Kode salah.");
                setCode(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
                return;
            }
            // Update session JWT — clear mfaPending flag
            await update({ mfaVerified: true });
            router.replace("/");
        });
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-sm">
                {/* Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center gap-6">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 flex items-center justify-center">
                            <Image src="/logo.png" alt="pErC lms" width={64} height={64} className="object-contain mix-blend-multiply dark:mix-blend-screen" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Verifikasi Autentikator</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Masukkan kode 6 digit dari aplikasi authenticator Anda
                            </p>
                        </div>
                    </div>

                    {/* Shield icon */}
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                        <Shield size={28} className="text-indigo-600 dark:text-indigo-400" />
                    </div>

                    {/* OTP Input */}
                    <div className="flex gap-2" onPaste={handlePaste}>
                        {code.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={el => { inputRefs.current[idx] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleInput(idx, e.target.value)}
                                onKeyDown={e => handleKeyDown(idx, e)}
                                className={`w-11 h-14 rounded-xl border-2 text-center text-xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all duration-150 ${
                                    error
                                        ? "border-red-400 dark:border-red-500"
                                        : digit
                                        ? "border-indigo-500 dark:border-indigo-400"
                                        : "border-slate-200 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-500"
                                }`}
                                autoFocus={idx === 0}
                            />
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-500/30 w-full">
                            <AlertCircle size={15} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Verify Button */}
                    <button
                        onClick={handleVerify}
                        disabled={code.join("").length !== 6 || isPending}
                        className="w-full h-12 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <><Loader2 size={16} className="animate-spin" /> Memverifikasi...</>
                        ) : (
                            "Verifikasi & Masuk"
                        )}
                    </button>

                    {/* Back to login */}
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <ArrowLeft size={14} /> Kembali ke Login
                    </button>
                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                    Buka Google Authenticator atau Authy untuk mendapatkan kode.
                </p>
            </div>
        </div>
    );
}
