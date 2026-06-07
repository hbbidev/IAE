"use client";

import { useState, useActionState, useEffect, Suspense } from "react";
import MfaSection from "@/components/MfaSection";
import QRCode from "qrcode";
import { useSession } from "next-auth/react";
import { Settings, User, Bell, Shield, Paintbrush, Check, AlertCircle, Eye, EyeOff, Moon, Sun, Monitor, Palette, QrCode, ChevronDown } from "lucide-react";
import { updateMyProfile, generateMobileLoginQrCodePayload } from "@/actions/user";
import { useTheme } from "next-themes";
import { useAccent, ACCENT_PRESETS } from "@/components/AccentProvider";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "profile" | "appearance" | "notifications" | "security";

// ─── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab({ name, email, nim }: { name: string; email: string; nim: string | null }) {
    const [state, formAction, isPending] = useActionState(updateMyProfile, null);

    return (
        <form action={formAction} className="space-y-6 max-w-2xl select-none">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 mt-2">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-800 shadow-md">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{name}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">{email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nama */}
                <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-350">
                        Nama Lengkap
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        defaultValue={name}
                        required
                        className="w-full h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/50 transition text-xs font-medium"
                    />
                </div>

                {/* NIM */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350">
                        NIM / ID Pengguna
                    </label>
                    <input
                        type="text"
                        value={nim ?? "—"}
                        readOnly
                        className="w-full h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 text-slate-400 dark:text-slate-500 cursor-not-allowed text-xs font-medium"
                    />
                    <p className="text-[10px] text-slate-400/80">NIM tidak bisa diubah.</p>
                </div>

                {/* Email */}
                <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350">
                        Alamat Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 text-slate-400 dark:text-slate-500 cursor-not-allowed text-xs font-medium"
                    />
                    <p className="text-[10px] text-slate-400/80">Email diatur oleh administrator.</p>
                </div>
            </div>

            {/* Feedback */}
            {state?.error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-500 dark:text-red-400 border border-red-200/50 dark:border-red-950/20 text-xs font-bold">
                    <AlertCircle size={14} className="shrink-0" />
                    {state.error}
                </div>
            )}
            {state?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E0F2FE] dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-transparent text-xs font-bold animate-in fade-in duration-300">
                    <Check size={14} className="shrink-0" />
                    {state.message}
                </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center gap-1.5"
                >
                    {isPending ? (
                        <>
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Menyimpan...
                        </>
                    ) : (
                        "Simpan Perubahan"
                    )}
                </button>
            </div>
        </form>
    );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [state, formAction, isPending] = useActionState(updateMyProfile, null);

    // QR Login Mobile State
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);

    const handleGenerateQr = async () => {
        setQrLoading(true);
        setQrError(null);
        try {
            const res = await generateMobileLoginQrCodePayload();
            if (res.error) {
                setQrError(res.error);
            } else if (res.payload) {
                const url = await QRCode.toDataURL(res.payload, {
                    width: 250,
                    margin: 2,
                });
                setQrCodeUrl(url);
            }
        } catch (e: any) {
            setQrError(e.message || "Gagal membuat QR Code");
        } finally {
            setQrLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl select-none">
            <form action={formAction} className="space-y-5">
                <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Ganti Kata Sandi</h3>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Pastikan kata sandi baru minimal 6 karakter dan mudah diingat.
                    </p>
                </div>

                {/* Hidden name field — required by action */}
                <input type="hidden" name="name" value="__keep__" />

                <div className="space-y-4">
                    {/* Kata Sandi Saat Ini */}
                    <div className="space-y-1.5">
                        <label htmlFor="currentPassword" className="text-xs font-bold text-slate-700 dark:text-slate-350">
                            Kata Sandi Saat Ini
                        </label>
                        <div className="relative">
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type={showCurrent ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full h-10 px-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/50 transition text-xs font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Kata Sandi Baru */}
                    <div className="space-y-1.5">
                        <label htmlFor="newPassword" className="text-xs font-bold text-slate-700 dark:text-slate-350">
                            Kata Sandi Baru
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showNew ? "text" : "password"}
                                placeholder="min. 6 karakter"
                                className="w-full h-10 px-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/50 transition text-xs font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Konfirmasi */}
                    <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 dark:text-slate-350">
                            Konfirmasi Kata Sandi Baru
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                placeholder="ulangi kata sandi baru"
                                className="w-full h-10 px-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/50 transition text-xs font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feedback */}
                {state?.error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-500 dark:text-red-400 border border-red-200/50 dark:border-red-950/20 text-xs font-bold">
                        <AlertCircle size={14} className="shrink-0" />
                        {state.error}
                    </div>
                )}
                {state?.success && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E0F2FE] dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-transparent text-xs font-bold animate-in fade-in duration-300">
                        <Check size={14} className="shrink-0" />
                        Kata sandi berhasil diubah!
                    </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center gap-1.5"
                    >
                        {isPending ? "Menyimpan..." : "Ganti Kata Sandi"}
                    </button>
                </div>
            </form>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-800" />

            {/* Login QR Aplikasi Mobile */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Akses Aplikasi Mobile (MyPercik)</h3>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        Scan QR Code berikut menggunakan aplikasi **MyPercik** di HP Anda untuk login otomatis tanpa mengetik kata sandi.
                    </p>
                </div>

                {qrCodeUrl ? (
                    <div className="flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-sm mx-auto animate-in fade-in duration-300">
                        <img src={qrCodeUrl} alt="Login QR Code" className="w-40 h-40 rounded-xl shadow-sm bg-white border border-slate-100 dark:border-slate-800" />
                        <p className="text-[10px] text-slate-400 text-center font-semibold leading-relaxed">QR Code ini berlaku selama 30 hari. Jangan bagikan QR Code ini kepada siapa pun.</p>
                        <button
                            type="button"
                            onClick={() => setQrCodeUrl(null)}
                            className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        >
                            Sembunyikan QR Code
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleGenerateQr}
                        disabled={qrLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                    >
                        {qrLoading ? (
                            <>
                                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Membuat QR Code...
                            </>
                        ) : (
                            <>
                                <QrCode size={14} />
                                Tampilkan QR Login Mobile
                            </>
                        )}
                    </button>
                )}

                {qrError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-500 dark:text-red-400 border border-red-200/50 dark:border-red-950/20 text-xs font-bold">
                        <AlertCircle size={14} />
                        {qrError}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-800" />

            {/* MFA Authenticator */}
            <MfaSection />
        </div>
    );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────

function AppearanceTab() {
    const { theme, setTheme } = useTheme();
    const { preset, customHex, setPreset, setCustomHex } = useAccent();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const themes = [
        { value: "light", label: "Terang", icon: Sun },
        { value: "dark", label: "Gelap", icon: Moon },
        { value: "system", label: "Sistem", icon: Monitor },
    ];

    const mainPresets = ACCENT_PRESETS.slice(0, 11);

    return (
        <div className="space-y-6 max-w-xl select-none">
            {/* Theme */}
            <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Tema Tampilan</h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-4">
                    Pilih tema yang nyaman untuk Anda.
                </p>
                <div className="grid grid-cols-3 gap-4">
                    {themes.map(({ value, label, icon: Icon }) => {
                        const isActive = mounted && theme === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setTheme(value)}
                                style={isActive ? {
                                    borderColor: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))`,
                                    backgroundColor: `hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.1)`,
                                } : {}}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${isActive
                                        ? "text-blue-600 dark:text-blue-400 font-bold"
                                        : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-xs font-semibold">{label}</span>
                                {isActive && <Check size={12} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800" />

            {/* Accent Color */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Palette size={14} className="text-slate-450 dark:text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Warna Aksen</h3>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-4">
                    Warna ini akan mewarnai tombol, link, dan elemen aktif di seluruh aplikasi.
                </p>

                {/* Preview badge */}
                <div className="mb-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/35">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">Preview</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl text-white text-[10px] font-bold transition-all hover:scale-105"
                            style={{ backgroundColor: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))` }}
                        >
                            Tombol Utama
                        </button>
                        <span
                            className="text-xs font-bold"
                            style={{ color: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))` }}
                        >
                            Link Aktif
                        </span>
                        <span
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{
                                backgroundColor: `hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.15)`,
                                color: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))`,
                            }}
                        >
                            Badge Kelas
                        </span>
                        <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))` }}
                        />
                    </div>
                </div>

                {/* Preset swatches */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                    {mainPresets.map((p) => {
                        const isActive = mounted && preset.name === p.name && preset.name !== "Custom";
                        return (
                            <button
                                key={p.name}
                                type="button"
                                onClick={() => setPreset(p)}
                                title={p.name}
                                className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${isActive
                                        ? "bg-slate-100 dark:bg-slate-900/40"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-900/20"
                                    }`}
                                style={isActive ? { outline: `1.5px solid ${p.hex}`, outlineOffset: "1px" } : {}}
                            >
                                <span
                                    className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
                                    style={{ backgroundColor: p.hex }}
                                >
                                    {isActive && <Check size={12} color="white" />}
                                </span>
                                <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold truncate w-full text-center">
                                    {p.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Custom color picker */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <div className="relative">
                        <input
                            type="color"
                            value={customHex}
                            onChange={(e) => setCustomHex(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border border-white dark:border-slate-700 shadow-sm p-0.5 bg-transparent"
                            title="Pilih warna kustom"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Warna Kustom</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500">Pilih warna bebas untuk aksen aplikasi</p>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                        {customHex.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
    const [settings, setSettings] = useState({
        emailAssignment: true,
        emailQuiz: true,
        emailAnnouncement: false,
        pushAll: true,
    });

    const toggle = (key: keyof typeof settings) =>
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    const items = [
        { key: "emailAssignment" as const, label: "Email Tugas Baru", desc: "Notifikasi saat guru menambahkan tugas baru" },
        { key: "emailQuiz" as const, label: "Email Quiz", desc: "Pengingat deadline quiz yang hampir tiba" },
        { key: "emailAnnouncement" as const, label: "Email Pengumuman", desc: "Pengumuman dari administrator" },
        { key: "pushAll" as const, label: "Notifikasi Push", desc: "Semua notifikasi dalam aplikasi" },
    ];

    return (
        <div className="space-y-5 max-w-xl select-none">
            <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Preferensi Notifikasi</h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-medium">
                    Atur notifikasi mana yang ingin Anda terima.
                </p>
            </div>

            <div className="space-y-2.5">
                {items.map(({ key, label, desc }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-100/50 dark:border-slate-800"
                    >
                        <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-250">{label}</p>
                            <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-500 mt-0.5">{desc}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => toggle(key)}
                            className={`relative w-10 h-5.5 rounded-full transition-colors ${settings[key] ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${settings[key] ? "translate-x-4.5" : "translate-x-0"}`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profil", icon: User },
    { id: "appearance", label: "Tampilan", icon: Paintbrush },
    { id: "notifications", label: "Notifikasi", icon: Bell },
    { id: "security", label: "Keamanan", icon: Shield },
];

function SettingsContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const queryTab = searchParams.get('tab') as Tab;
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    useEffect(() => {
        if (queryTab && ["profile", "appearance", "notifications", "security"].includes(queryTab)) {
            setActiveTab(queryTab);
        }
    }, [queryTab]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const user = session?.user as any;

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header (ByeWind minimalist styling) */}
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-100 dark:bg-slate-900/50 text-slate-750 dark:text-slate-200 rounded-2xl">
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pengaturan Akun</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                        Kelola informasi pribadi dan preferensi Anda.
                    </p>
                </div>
            </div>

            {/* Mobile Sub-Navigation Tabs (Visible only on mobile/small screens) */}
            <div className="flex lg:hidden bg-slate-100/80 dark:bg-slate-900/50 p-1 rounded-xl items-center gap-1 w-full mb-6 select-none overflow-x-auto no-scrollbar">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.id}
                            href={`/settings?tab=${tab.id}`}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-1 whitespace-nowrap ${
                                isActive
                                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-300"
                            }`}
                        >
                            <Icon size={13} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="max-w-3xl w-full">
                {/* Content Area */}
                <div className="glass-panel rounded-2xl p-6">
                    <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-800 pb-3 uppercase tracking-wider">
                        {TABS.find((t) => t.id === activeTab)?.label}
                    </h2>

                    {activeTab === "profile" && (
                        <ProfileTab
                            name={user?.name ?? ""}
                            email={user?.email ?? ""}
                            nim={user?.nim ?? null}
                        />
                    )}
                    {activeTab === "appearance" && <AppearanceTab />}
                    {activeTab === "notifications" && <NotificationsTab />}
                    {activeTab === "security" && <SecurityTab />}
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SettingsContent />
        </Suspense>
    );
}
