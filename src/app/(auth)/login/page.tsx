"use client";

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Fingerprint, KeyRound, Loader2, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';

export default function LoginPage() {
    const router = useRouter();
    const [nim, setNim] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // QR Login State
    const [showQr, setShowQr] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [qrToken, setQrToken] = useState('');
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                nim,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('ID Pengguna atau Kata Sandi salah');
                setIsLoading(false);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handleQrLogin = async () => {
        try {
            setError('');
            setShowQr(true);
            setQrCodeDataUrl('');
            
            // 1. Hit API to generate token
            const res = await fetch('https://percikapi.hbii.my.id/api/auth/qr/generate', { method: 'POST' });
            if (!res.ok) throw new Error("Gagal membuat sesi QR");
            const data = await res.json();
            const token = data.qr_token;
            setQrToken(token);

            // 2. Generate QR Code image
            const url = await QRCode.toDataURL(token, { width: 250, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } });
            setQrCodeDataUrl(url);

            // 3. Start polling for status
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            
            pollIntervalRef.current = setInterval(async () => {
                try {
                    const statusRes = await fetch(`https://percikapi.hbii.my.id/api/auth/qr/status?token=${token}`);
                    if (!statusRes.ok) return;
                    const statusData = await statusRes.json();
                    
                    if (statusData.status === 'approved' && statusData.token) {
                        // QR is scanned and approved! Stop polling and login.
                        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                        
                        setIsLoading(true);
                        const signInRes = await signIn('credentials', {
                            qrJwt: statusData.token,
                            redirect: false,
                        });

                        if (signInRes?.error) {
                            setError('Gagal masuk menggunakan QR');
                            setIsLoading(false);
                            setShowQr(false);
                        } else {
                            router.push('/');
                            router.refresh();
                        }
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 2000); // Poll every 2 seconds

        } catch(e: any) {
            setError(e.message);
            setShowQr(false);
        }
    };

    const closeQr = () => {
        setShowQr(false);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#F4F7FE] dark:bg-black flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 dark:bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            {showQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={closeQr} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={24} />
                        </button>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
                                <QrCode size={28} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Login dengan QR</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Buka aplikasi MyPercik di perangkat yang sudah terverifikasi, lalu scan QR code ini.
                            </p>
                            
                            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl flex items-center justify-center min-h-[250px]">
                                {qrCodeDataUrl ? (
                                    <img src={qrCodeDataUrl} alt="QR Code" className="rounded-xl shadow-sm" />
                                ) : (
                                    <Loader2 size={32} className="animate-spin text-slate-400" />
                                )}
                            </div>
                            
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 animate-pulse">
                                Menunggu hasil scan...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-blue-500/10 dark:shadow-blue-900/20 mb-6 border border-slate-100 dark:border-slate-700/50">
                        <Fingerprint size={32} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">Selamat Datang</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Silakan masuk ke akun pErC LMS Anda</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/20 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white dark:border-slate-700/50 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2 fade-in">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2 group">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Identifier / ID Pengguna</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Fingerprint size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={nim}
                                    onChange={(e) => setNim(e.target.value)}
                                    placeholder="e.g murid / guru / admin"
                                    
                                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kata Sandi</label>
                                <a href="#" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Lupa Akses?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    
                                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 mt-2 flex items-center justify-center gap-2 accent-bg hover:opacity-90 text-white rounded-xl font-semibold shadow-[0_8px_20px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.25)] hover:shadow-[0_12px_25px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.35)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:-translate-y-0"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    Masuk Ke LMS <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-4 flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            disabled={isLoading}
                            className="w-full h-12 flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:-translate-y-0.5"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Masuk dengan Google
                        </button>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Atau</span>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleQrLogin}
                        className="w-full h-12 mt-6 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-all duration-300"
                    >
                        <QrCode size={18} />
                        Login dengan Kode QR
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Akun dibuat oleh Administrator sistem.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
