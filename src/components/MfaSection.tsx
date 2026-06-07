"use client";

import { useState, useTransition, useEffect } from "react";
import { Shield, ShieldCheck, ShieldOff, QrCode, Loader2, Check, AlertCircle, RefreshCw } from "lucide-react";
import { generateTotpSetup, verifyAndEnableTotp, disableTotp, getMfaStatus } from "@/actions/mfa";
import QRCode from "qrcode";

export default function MfaSection() {
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
    const [step, setStep] = useState<"idle" | "setup" | "disable">("idle");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        getMfaStatus().then(r => {
            setMfaEnabled(r.enabled);
            setIsLoading(false);
        });
    }, []);

    const handleStartSetup = () => {
        startTransition(async () => {
            setMsg(null);
            const res = await generateTotpSetup();
            if ("error" in res && res.error) { setMsg({ type: "error", text: res.error }); return; }
            if ("uri" in res && res.uri) {
                const dataUrl = await QRCode.toDataURL(res.uri, { width: 200, margin: 2 });
                setQrDataUrl(dataUrl);
                setSecretKey(res.secret ?? null);
                setStep("setup");
            }
        });
    };

    const handleVerify = () => {
        if (!code.trim() || code.length !== 6) return;
        startTransition(async () => {
            setMsg(null);
            const res = await verifyAndEnableTotp(code);
            if (res.error) { setMsg({ type: "error", text: res.error }); return; }
            setMfaEnabled(true);
            setStep("idle");
            setCode("");
            setQrDataUrl(null);
            setSecretKey(null);
            setMsg({ type: "success", text: "Autentikator berhasil diaktifkan!" });
        });
    };

    const handleDisable = () => {
        if (!code.trim() || code.length !== 6) return;
        startTransition(async () => {
            setMsg(null);
            const res = await disableTotp(code);
            if (res.error) { setMsg({ type: "error", text: res.error }); return; }
            setMfaEnabled(false);
            setStep("idle");
            setCode("");
            setMsg({ type: "success", text: "MFA berhasil dinonaktifkan." });
        });
    };

    if (isLoading) {
        return <div className="h-24 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-slate-400" /></div>;
    }

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
                    {mfaEnabled ? <ShieldCheck size={18} className="text-blue-500" /> : <Shield size={18} className="text-slate-400" />}
                    Autentikasi Dua Faktor (MFA)
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {mfaEnabled
                        ? "MFA aktif — akun Anda dilindungi dengan autentikator."
                        : "Tambahkan lapisan keamanan dengan TOTP Authenticator (Google Authenticator, Authy, dll)."}
                </p>
            </div>

            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${mfaEnabled ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {mfaEnabled ? <><ShieldCheck size={13} /> Aktif</> : <><ShieldOff size={13} /> Tidak Aktif</>}
            </div>

            {/* Feedback */}
            {msg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${msg.type === "success" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"}`}>
                    {msg.type === "success" ? <Check size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
                    {msg.text}
                </div>
            )}

            {/* SETUP FLOW */}
            {!mfaEnabled && step === "idle" && (
                <button
                    onClick={handleStartSetup}
                    disabled={isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                    {isPending ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
                    Aktifkan Autentikator
                </button>
            )}

            {step === "setup" && qrDataUrl && (
                <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        1. Scan QR Code ini dengan aplikasi authenticator:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                        {/* QR Code */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                            <img src={qrDataUrl} alt="QR Code MFA" width={160} height={160} />
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Atau masukkan kode ini secara manual:</p>
                            <code className="block text-xs font-mono bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 tracking-widest break-all select-all">
                                {secretKey}
                            </code>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 pt-2">
                                2. Masukkan kode 6 digit dari aplikasi:
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={code}
                                    onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                                    placeholder="000000"
                                    className="w-32 h-11 px-4 text-center font-mono text-lg tracking-widest rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={code.length !== 6 || isPending}
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition-all"
                                >
                                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    Verifikasi
                                </button>
                                <button onClick={() => { setStep("idle"); setCode(""); setMsg(null); }} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl text-sm">Batal</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DISABLE FLOW */}
            {mfaEnabled && step === "idle" && (
                <button
                    onClick={() => { setStep("disable"); setCode(""); setMsg(null); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-semibold rounded-xl text-sm hover:bg-red-100 transition-all"
                >
                    <ShieldOff size={15} /> Nonaktifkan MFA
                </button>
            )}

            {step === "disable" && mfaEnabled && (
                <div className="space-y-3 p-5 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200 dark:border-red-500/20">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">Masukkan kode dari aplikasi authenticator untuk menonaktifkan MFA:</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            className="w-32 h-11 px-4 text-center font-mono text-lg tracking-widest rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                        />
                        <button
                            onClick={handleDisable}
                            disabled={code.length !== 6 || isPending}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 hover:bg-red-700 transition-all"
                        >
                            {isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
                            Nonaktifkan
                        </button>
                        <button onClick={() => { setStep("idle"); setCode(""); }} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl text-sm">Batal</button>
                    </div>
                </div>
            )}
        </div>
    );
}
